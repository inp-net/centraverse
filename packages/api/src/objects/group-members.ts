import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';

export const GroupMemberType = builder.prismaObject('GroupMember', {
  fields: (t) => ({
    memberId: t.exposeID('memberId'),
    groupId: t.exposeID('groupId'),
    title: t.string({ resolve: ({ title }) => title || 'Membre' }),
    president: t.exposeBoolean('president'),
    treasurer: t.exposeBoolean('treasurer'),
    canEditMembers: t.exposeBoolean('canEditMembers'),
    canEditArticles: t.exposeBoolean('canEditArticles'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    member: t.relation('member'),
    group: t.relation('group'),
  }),
});

/** Adds a member to a group. The member is found by their name. */
builder.mutationField('addGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
      title: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === groupUid)
      ),
    resolve: (query, _, { groupUid, uid, title }) =>
      prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: groupUid } },
          title,
        },
      }),
  })
);

/** Adds a member to a group that is self-joinable. Does not require the same auth scopes. */
builder.mutationField('selfJoinGroup', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      groupUid: t.arg.string(),
      uid: t.arg.string(),
    },
    authScopes: (_, {}, { user }) => Boolean(user),
    async resolve(query, _, { groupUid, uid }) {
      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group?.selfJoinable) throw new Error('This group is not self-joinable.');
      return prisma.groupMember.create({
        ...query,
        data: {
          member: { connect: { uid } },
          group: { connect: { uid: groupUid } },
          title: 'Membre', // don't allow people to name themselves "Président", for example.
        },
      });
    },
  })
);

/** Updates a group member. */
builder.mutationField('updateGroupMember', (t) =>
  t.prismaField({
    type: GroupMemberType,
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
      title: t.arg.string(),
      president: t.arg.boolean(),
      treasurer: t.arg.boolean(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id)
      ),
    async resolve(query, _, { memberId, groupId, title, president, treasurer }) {
      if (president) {
        await prisma.groupMember.updateMany({
          where: { groupId, president: true },
          data: { president: false },
        });
      }

      if (treasurer) {
        await prisma.groupMember.updateMany({
          where: { groupId, treasurer: true },
          data: { treasurer: false },
        });
      }

      return prisma.groupMember.update({
        ...query,
        where: { groupId_memberId: { groupId, memberId } },
        data: { title, president, treasurer, canEditMembers: president || treasurer },
      });
    },
  })
);

/** Removes a member from a group. */
builder.mutationField('deleteGroupMember', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      memberId: t.arg.id(),
      groupId: t.arg.id(),
    },
    authScopes: (_, { groupId }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ groupId: id, canEditMembers }) => canEditMembers && groupId === id)
      ),
    async resolve(_, { memberId, groupId }) {
      await prisma.groupMember.delete({ where: { groupId_memberId: { groupId, memberId } } });
      return true;
    },
  })
);
