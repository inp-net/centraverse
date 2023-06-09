import { type Group, GroupType as GroupPrismaType } from '@prisma/client';
import { getDescendants, hasCycle, mappedGetAncestors } from 'arborist';
import dichotomid from 'dichotomid';
import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { LinkInput } from './links.js';
import { GraphQLError } from 'graphql';
import { unlink, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { FileScalar } from './scalars.js';
import imageType, { minimumBytes } from 'image-type';
import {
  type FuzzySearchResult,
  levenshteinFilterAndSort,
  splitSearchTerms,
  levenshteinSorter,
} from '../services/search.js';
import type { Context } from '../context.js';

export function userIsInBureauOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(
      ({ group: { uid }, president, secretary, treasurer, vicePresident }) =>
        uid === groupUid && (president || secretary || treasurer || vicePresident)
    )
  );
}

export function userIsPresidentOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(({ group: { uid }, president }) => uid === groupUid && president)
  );
}

export function userIsTreasurerOf(user: Context['user'], groupUid: string): boolean {
  return Boolean(
    user?.groups.some(({ group: { uid }, treasurer }) => uid === groupUid && treasurer)
  );
}

export const GroupEnumType = builder.enumType(GroupPrismaType, { name: 'GroupType' });

export const GroupType = builder.prismaNode('Group', {
  id: { field: 'id' },
  fields: (t) => ({
    // Because `id` is a Relay id, expose `groupId` as the real db id
    groupId: t.exposeID('id'),
    type: t.expose('type', { type: GroupEnumType }),
    uid: t.exposeString('uid'),
    parentId: t.exposeID('parentId', { nullable: true }),
    familyId: t.exposeID('familyId', { nullable: true }),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    address: t.exposeString('address'),
    description: t.exposeString('description'),
    email: t.exposeString('email'),
    longDescription: t.exposeString('longDescription'),
    longDescriptionHtml: t.string({
      resolve: async ({ longDescription }) => toHtml(longDescription),
    }),
    pictureFile: t.exposeString('pictureFile'),
    articles: t.relation('articles', {
      query: { orderBy: { publishedAt: 'desc' } },
    }),
    links: t.relation('links'),
    members: t.relation('members', {
      // Seeing group members requires being logged in
      authScopes: { loggedIn: true },
      query: {
        orderBy: [
          { president: 'desc' },
          { treasurer: 'desc' },
          { member: { firstName: 'asc' } },
          { member: { lastName: 'asc' } },
        ],
      },
    }),
    school: t.relation('school', { nullable: true }),
    parent: t.relation('parent'),
    selfJoinable: t.exposeBoolean('selfJoinable'),
    events: t.relation('events'),
  }),
});

// Because it's too hard for Pothos to correctly type recursive data loading,
// we declare the field after the type
builder.objectField(GroupType, 'ancestors', (t) =>
  // Declare `Groups.ancestors` as a batch-loadable field, to avoid the N+1 problem
  t.loadableList({
    type: GroupType,
    description: 'All the ancestors of this group, from the current group to the root.',
    // Because this request can be expensive, only allow logged in users
    authScopes: { loggedIn: true },
    resolve: ({ id, familyId }) => ({ id, familyId: familyId ?? id }),
    load: async (ids) =>
      prisma.group
        // Get all groups in the same family as the current groups
        .findMany({ where: { familyId: { in: ids.map(({ familyId }) => familyId) } } })
        // Get the ancestors of each group
        .then((groups) => mappedGetAncestors(groups, ids)),
  })
);

builder.queryField('groups', (t) =>
  t.prismaField({
    type: [GroupType],
    args: {
      types: t.arg({ type: [GroupEnumType], required: false }),
    },
    resolve: (query, _, { types }) =>
      prisma.group.findMany({
        ...query,
        where: types ? { type: { in: types } } : {},
        orderBy: { name: 'asc' },
      }),
  })
);

builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { uid: t.arg.string() },
    resolve: (query, _, { uid }) => prisma.group.findUniqueOrThrow({ ...query, where: { uid } }),
  })
);
builder.queryField('searchGroups', (t) =>
  t.prismaField({
    type: [GroupType],
    args: { q: t.arg.string() },
    authScopes: { loggedIn: true },
    async resolve(query, _, { q }) {
      q = q.trim();
      const { searchString: search } = splitSearchTerms(q);
      const fuzzyResults: FuzzySearchResult = await prisma.$queryRaw`
SELECT "id", levenshtein_less_equal("name", ${q}, 15) as changes
FROM "Group"
ORDER BY changes ASC
LIMIT 20
`;
      const resultsByFuzzySearch = await prisma.group.findMany({
        ...query,
        where: {
          id: { in: fuzzyResults.map(({ id }) => id) },
        },
      });
      const results = await prisma.group.findMany({
        ...query,
        where: {
          OR: [
            { uid: { search } },
            { name: { search } },
            { description: { search } },
            { longDescription: { search } },
            { email: { search } },
          ],
        },
      });

      return [
        ...results.sort(levenshteinSorter(fuzzyResults)),
        ...levenshteinFilterAndSort<Group>(
          fuzzyResults,
          3,
          results.map(({ id }) => id)
        )(resultsByFuzzySearch),
      ];
    },
  })
);

const createGroupUid = async (name: string) => {
  const groupSlug = slug(name);
  const createUid = (i: number) => (i === 1 ? groupSlug : `${groupSlug}-${i}`);
  const i = await dichotomid(
    async (i) => !(await prisma.group.findFirst({ where: { uid: createUid(i) } }))
  );
  return createUid(i);
};

/** Upserts a group. */
builder.mutationField('upsertGroup', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    args: {
      uid: t.arg.string({ required: false }),
      type: t.arg({ type: GroupEnumType }),
      parentId: t.arg.id({ required: false }),
      schoolId: t.arg.id({ required: false }),
      studentAssociationId: t.arg.id({ required: false }),
      name: t.arg.string({ validate: { maxLength: 255 } }),
      color: t.arg.string({ validate: { regex: /#[\dA-Fa-f]{6}/ } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      description: t.arg.string({ validate: { maxLength: 255 } }),
      email: t.arg.string({ validate: { email: true } }),
      longDescription: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      selfJoinable: t.arg.boolean(),
    },
    authScopes(_, { uid }, { user }) {
      const creating = !uid;
      if (creating) return Boolean(user?.canEditGroups);
      return Boolean(
        user?.canEditGroups ||
          (user?.groups ?? []).some(
            ({ president, secretary, treasurer, vicePresident, group }) =>
              group.uid === uid && (president || secretary || treasurer || vicePresident)
          )
      );
    },
    async resolve(
      query,
      _,
      {
        uid,
        selfJoinable,
        type,
        parentId,
        name,
        color,
        address,
        description,
        schoolId,
        studentAssociationId,
        email,
        longDescription,
        links,
      }
    ) {
      // --- First, we update the group's children's familyId according to the new parent of this group. ---
      // We have 2 possible cases for updating the parent: either it is:
      // - null (or set to ''): the group does not have a parent anymore;
      //   In that case, the root (set by familyId) is the group itself.
      //   We don't need to change the root's children
      // - an id: the group's parent is changed to the group with that ID.
      //   In that case, the root is changed to the root of the new parent.
      //   - if we are creating the group, we don't need to change its children since it has none
      //
      let familyId;
      const oldGroup = await prisma.group.findUnique({ where: { uid: uid ?? '' } });
      if (parentId === null || parentId === '') {
        // First case (null): the group does not have a parent anymore.
        // Set both the parent and the root to the group itself.
        // eslint-disable-next-line unicorn/no-null
        parentId = null;
        // eslint-disable-next-line unicorn/no-null
        familyId = oldGroup?.id ?? null;
      } else {
        // Third case (number): the group's parent is changed to the group with that ID.
        const newParent = await prisma.group.findUnique({ where: { id: parentId } });
        if (!newParent) throw new GraphQLError('ID de groupe parent invalide');
        familyId = newParent.familyId ?? newParent.id;
        // Update all descendants' familyId to the new parent's familyId
        // Or when creating (i.e. oldGroup is undefined), just check for cycles
        const allGroups = await prisma.group.findMany({});
        if (oldGroup) {
          if (
            hasCycle(allGroups.map((g) => (g.id === oldGroup.id ? { ...oldGroup, parentId } : g)))
          )
            throw new GraphQLError('La modification créerait un cycle dans les groupes');

          const descendants = getDescendants(allGroups, oldGroup.id);
          console.log({
            [`setting familyId to ${familyId} for`]: descendants.map((g) => g.name),
          });
          await prisma.group.updateMany({
            where: { id: { in: descendants.map((g) => g.id) } },
            data: {
              familyId,
            },
          });
        } else if (parentId && hasCycle([{ parentId, id: '' }, ...allGroups])) {
          throw new GraphQLError("Can't create a cycle");
        }
      }

      if (parentId === oldGroup?.id) throw new GraphQLError('Group cannot be its own parent');

      const data = {
        type,
        selfJoinable,
        name,
        color,
        parent:
          parentId === undefined
            ? undefined
            : parentId === null
            ? {}
            : { connect: { id: parentId } },
        familyRoot: familyId ? { connect: { id: familyId } } : undefined,
        address,
        description,
        email,
        longDescription,
        school: schoolId ? { connect: { id: schoolId } } : {},
        studentAssociation: studentAssociationId ? { connect: { id: studentAssociationId } } : {},
      };

      // if (uid) {
      //   const id = (await prisma.group.findUnique({ where: { uid: uid ?? '' } }))?.id;
      //   await prisma.link.deleteMany({ where: { groupId: id ?? '' } });
      // }

      return prisma.group.upsert({
        ...query,
        where: { uid: uid ?? '' },
        create: {
          ...data,
          links: { create: links },
          uid: await createGroupUid(name),
        },
        update: {
          ...data,
          links: {
            deleteMany: {},
            createMany: { data: links },
          },
        },
      });
    },
  })
);

/** Deletes a group. */
builder.mutationField('deleteGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(({ group, president }) => president && group.uid === uid)
      ),
    async resolve(_, { uid }) {
      await prisma.group.delete({ where: { uid } });
      return true;
    },
  })
);

/** Update the club's picture */
builder.mutationField('updateGroupPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: FileScalar }),
    },
    authScopes: (_, { uid }, { user }) =>
      Boolean(user?.canEditGroups || user?.groups.some(({ group }) => group.uid === uid)),
    async resolve(_, { uid, file }) {
      console.log('updating group picture');
      const type = await file
        .slice(0, minimumBytes)
        .arrayBuffer()
        .then((array) => Buffer.from(array))
        .then(async (buffer) => imageType(buffer));
      if (!type || (type.ext !== 'png' && type.ext !== 'jpg'))
        throw new GraphQLError('File format not supported');
      console.log(`file type: ${type.ext}`);

      // Delete the existing picture
      const { pictureFile } = await prisma.group.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      console.log(`existing picture: ${pictureFile}`);

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      const path = join(`groups`, `${uid}.${type.ext}`);
      await mkdir(new URL(dirname(path), process.env.STORAGE), { recursive: true });
      await writeFile(new URL(path, process.env.STORAGE), file.stream());
      await prisma.group.update({ where: { uid }, data: { pictureFile: path } });
      return path;
    },
  })
);

/** Delete the club's picture */
builder.mutationField('deleteGroupPicture', (t) =>
  t.field({
    type: 'Boolean',
    args: { uid: t.arg.string() },
    authScopes: (_, { uid }, { user }) => Boolean(user?.canEditGroups || uid === user?.uid),
    async resolve(_, { uid }) {
      const { pictureFile } = await prisma.group.findUniqueOrThrow({
        where: { uid },
        select: { pictureFile: true },
      });

      if (pictureFile) await unlink(new URL(pictureFile, process.env.STORAGE));

      await prisma.group.update({
        where: { uid },
        data: { pictureFile: '' },
      });
      return true;
    },
  })
);
