import { PRIVATE_API_URL } from '$env/static/private';
import { PUBLIC_API_URL } from '$env/static/public';
import { sessionUserQuery } from '$lib/session';
import { chain } from '$lib/zeus';
import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
  const { token } = cookie.parse(event.request.headers.get('Cookie') ?? '');
  if (token) {
    try {
      const { me } = await chain(fetch, { token })('query')({
        me: sessionUserQuery(),
      });
      event.locals.token = token;
      event.locals.me = me;
    } catch {}
  }

  event.locals.mobile = Boolean(
    event.request.headers.get('User-Agent')?.toLowerCase().includes('mobile')
  );

  const response = await resolve(event);

  // Delete invalid token
  if (token && !event.locals.me) {
    response.headers.append(
      'Set-Cookie',
      cookie.serialize('token', '', { expires: new Date(0), path: '/', sameSite: 'strict' })
    );
  }

  return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  if (request.url.startsWith(PUBLIC_API_URL))
    request = new Request(request.url.replace(PUBLIC_API_URL, PRIVATE_API_URL), request);

  return fetch(request).catch(() => {
    throw new TypeError('Impossible de joindre le serveur.');
  });
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
};
