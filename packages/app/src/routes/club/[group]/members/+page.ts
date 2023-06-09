import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.canEditGroups &&
    !me.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === params.group)
  )
    throw redirect(307, '.');

  return loadQuery(
    {
      group: [
        { uid: params.group },
        {
          id: true,
          uid: true,
          members: {
            memberId: true,
            member: { firstName: true, lastName: true },
            title: true,
            president: true,
            treasurer: true,
            secretary: true,
            vicePresident: true,
            canEditMembers: true,
          },
        },
      ],
    },
    { fetch, parent }
  );
};
