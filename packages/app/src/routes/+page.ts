import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const pageQuery = Selector('QueryHomepageConnection')({
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    cursor: true,
    node: {
      slug: true,
      title: true,
      bodyHtml: true,
      homepage: true,
      publishedAt: true,
      group: { uid: true, name: true, members: { memberId: true, title: true } },
      author: { uid: true, firstName: true, lastName: true },
    },
  },
});

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery({ homepage: [{}, pageQuery] }, { fetch, parent });
