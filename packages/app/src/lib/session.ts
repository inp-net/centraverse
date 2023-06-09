import { page } from '$app/stores';
import { redirect } from '@sveltejs/kit';
import * as cookie from 'cookie';
import { derived } from 'svelte/store';
import { Selector, type PropsType } from './zeus';
import { browser } from '$app/environment';

/** What's needed in a user session. */
export const sessionUserQuery = () =>
  Selector('User')({
    id: true,
    uid: true,
    firstName: true,
    pictureFile: true,
    lastName: true,
    admin: true,
    canEditGroups: true,
    canEditUsers: true,
    groups: {
      group: { uid: true, id: true, name: true },
      title: true,
      president: true,
      secretary: true,
      vicePresident: true,
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    managedEvents: {
      event: { uid: true, id: true },
      canEdit: true,
      canEditPermissions: true,
      canVerifyRegistrations: true,
    },
    major: { id: true, name: true, schools: { id: true, name: true } },
  });

export type SessionUser = PropsType<typeof sessionUserQuery, 'User'>;

/** Saves `token` as a cookie. */
export const saveSessionToken = (
  document: { cookie: string },
  {
    token,
    expiresAt,
  }: {
    token: string;
    expiresAt?: Date | null;
  }
) => {
  document.cookie = cookie.serialize('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'strict',
  });
};

/** Returns a temporary redirect object. */
export const redirectToLogin = (to: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  redirect(307, `/login?${new URLSearchParams({ to }).toString()}`);

export const me = derived(page, ($page) => $page.data.me);
