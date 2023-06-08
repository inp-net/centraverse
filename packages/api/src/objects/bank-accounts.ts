import type { LydiaAccount } from '@prisma/client';
import { builder } from '../builder';
import { prisma } from '../prisma';

import { createHash } from 'node:crypto';

export const LydiaAccountType = builder.prismaNode('LydiaAccount', {
  id: { field: 'id' },
  fields: (t) => ({
    groupId: t.exposeID('groupId'),
    group: t.relation('group'),
    description: t.exposeString('description'),
    events: t.relation('events'),
    // tokens are NOT EXPOSED, they should never quit the backend
  }),
});

builder.queryField('lydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.lydiaAccount.findFirstOrThrow({ ...query, where: { id } }),
  })
);

export function lydiaSignature(
  { privateToken }: { privateToken: string },
  params: Record<string, string>
): string {
  return createHash('md5')
    .update(
      new URLSearchParams(
        Object.keys(params)
          .sort()
          .map((key) => [key, params[key]!])
      ).toString() +
        '&' +
        privateToken
    )
    .digest('hex');
}

builder.mutationField('createLydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    args: {
      groupId: t.arg.id(),
      description: t.arg.string(),
      privateToken: t.arg.string(),
      vendorToken: t.arg.string(),
    },
    resolve: async (query, _, { groupId, description, privateToken, vendorToken }) =>
      prisma.lydiaAccount.create({
        ...query,
        data: {
          description,
          group: { connect: { id: groupId } },
          privateToken,
          vendorToken,
        },
      }),
  })
);

builder.queryField('lydiaAccounts', t => t.prismaConnection({
    type: LydiaAccountType,
    cursor: 'id',
    authScopes: (_, {}, { user }) => Boolean(user),
    async resolve(query, _, {}) {
        const results = await prisma.lydiaAccount.findMany({ ...query }) 
        return results.map(result => Object.fromEntries(Object.entries(result).map(([key, value]) => [key, ['privateToken', 'vendorToken'].includes(key) ? "*****************" : value]))) as LydiaAccount[]
    }
}))

builder.queryField('lydiaAccountsOfGroup', t => t.prismaConnection({
    type: LydiaAccountType,
    cursor: 'id',
    args: {
        uid: t.arg.string()
    },
    authScopes: (_, { uid }, { user }) => Boolean(user?.admin || user?.groups.some(({ group, president, treasurer }) => group.uid === uid && (president || treasurer))),
    async resolve(query, _, { uid }) {
        return prisma.lydiaAccount.findMany({ ...query, where: { group: {uid} } })
    }
}))
