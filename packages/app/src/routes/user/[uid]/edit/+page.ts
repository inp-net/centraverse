import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const _userQuery = Selector('User')({
  uid: true,
  firstName: true,
  lastName: true,
  nickname: true,
  description: true,
  pictureFile: true,
  address: true,
  graduationYear: true,
  majorId: true,
  phone: true,
  birthday: true,
  links: { name: true, value: true },
  notificationSettings: {
    id: true,
    type: true,
    allow: true,
    group: {
      id: true,
      uid: true,
      name: true,
      pictureFile: true,
    },
  },
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  if (params.uid !== me?.uid && !me?.canEditUsers) throw redirect(307, '..');

  return loadQuery(
    {
      user: [params, _userQuery],
      // If the user is an admin, we also load the permissions
      __alias: {
        userPermissions: me.admin
          ? { user: [params, { admin: true, canEditUsers: true, canEditGroups: true }] }
          : {},
      },
      schoolGroups: { names: true, majors: { id: true, name: true } },
    },
    { fetch, parent }
  );
};
