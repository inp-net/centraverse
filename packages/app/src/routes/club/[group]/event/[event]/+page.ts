import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  return loadQuery(
    {
      event: [
        { groupUid: params.group, uid: params.event },
        Selector('Event')({
          startsAt: true,
          endsAt: true,
          uid: true,
          id: true,
          pictureFile: true,
          articles: {
            uid: true,
            bodyHtml: true,
            title: true,
            group: {
              uid: true,
              name: true,
              pictureFile: true,
            },
            author: {
              uid: true,
              firstName: true,
              lastName: true,
              pictureFile: true,
            },
            createdAt: true,
          },
          author: {
            uid: true,
            firstName: true,
            lastName: true,
            pictureFile: true,
          },
          descriptionHtml: true,
          title: true,
          links: {
            name: true,
            value: true,
          },
          group: {
            uid: true,
            name: true,
            pictureFile: true,
          },
          contactMail: true,
          tickets: {
            uid: true,
            id: true,
            name: true,
            descriptionHtml: true,
            price: true,
            capacity: true,
            placesLeft: true,
            opensAt: true,
            closesAt: true,
            group: {
              capacity: true,
            },
            links: {
              name: true,
              value: true,
            },
            registrations: {
              id: true,
              beneficiary: true,
              beneficiaryUser: {
                uid: true,
                firstName: true,
                lastName: true,
              },
              authorIsBeneficiary: true,
              author: {
                uid: true,
              },
              paid: true,
              ticket: {
                name: true,
              },
            },
            openToAlumni: true,
            openToExternal: true,
            openToGroups: {
              uid: true,
              name: true,
            },
            openToNonAEContributors: true,
            openToSchools: {
              name: true,
              color: true,
              id: true,
            },
            openToPromotions: true,
          },
        }),
      ],
    },
    { fetch, parent }
  );
};
