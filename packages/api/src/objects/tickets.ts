import { builder } from '../builder';
import { prisma } from '../prisma';
import { toHtml } from '../services/markdown';
import { PaymentMethodEnum } from './registration';
import { eventAccessibleByUser, eventManagedByUser } from './events';
import { DateTimeScalar } from './scalars';
import { LinkInput } from './links';

export const placesLeft = (ticket: { name: string; capacity: number; registrations: Array<{ paid: boolean }>; group: null | { capacity: number; tickets: Array<{ registrations: Array<{ paid: boolean }> }> } }) => {
  let placesLeftInGroup = Number.POSITIVE_INFINITY;
  if (ticket.group?.capacity) {
    placesLeftInGroup =
      ticket.group.capacity -
      ticket.group.tickets.reduce(
        (sum, { registrations }) => sum + registrations.filter(({ paid }) => paid).length,
        0
      );
  }

  const placesLeftInTicket =
    ticket.capacity - ticket.registrations.filter(({ paid }) => paid).length;
    console.log(`Places left for ticket ${ticket.name}: self=${placesLeftInTicket}, group=${placesLeftInGroup}`)
  return Math.min(placesLeftInGroup, placesLeftInTicket);
}

export const TicketType = builder.prismaNode('Ticket', {
  id: { field: 'id' },
  fields: (t) => ({
    eventId: t.exposeID('eventId'),
    ticketGroupId: t.exposeID('ticketGroupId', { nullable: true }),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    descriptionHtml: t.string({ resolve: async ({ description }) => toHtml(description) }),
    opensAt: t.expose('opensAt', { type: DateTimeScalar, nullable: true }),
    closesAt: t.expose('closesAt', { type: DateTimeScalar, nullable: true }),
    price: t.exposeFloat('price'),
    capacity: t.exposeInt('capacity'),
    registrations: t.relation('registrations'),
    links: t.relation('links'),
    allowedPaymentMethods: t.expose('allowedPaymentMethods', { type: [PaymentMethodEnum] }),
    openToPromotions: t.expose('openToPromotions', { type: ['Int'] }),
    openToAlumni: t.exposeBoolean('openToAlumni', { nullable: true }),
    openToExternal: t.exposeBoolean('openToExternal', { nullable: true }),
    openToSchools: t.relation('openToSchools'),
    openToGroups: t.relation('openToGroups'),
    openToNonAEContributors: t.exposeBoolean('openToNonAEContributors', { nullable: true }),
    godsonLimit: t.exposeInt('godsonLimit'),
    onlyManagersCanProvide: t.exposeBoolean('onlyManagersCanProvide'),
    event: t.relation('event'),
    group: t.relation('group', {nullable: true}),
    authorId: t.exposeID('authorId'),
    author: t.relation('author', { nullable: true }),
    linkCollectionId: t.exposeID('linkCollectionId', { nullable: true }),
    placesLeft: t.int({
      async resolve({ id }) {
        const ticket = await prisma.ticket.findUnique({
          where: { id },
          include: {
            registrations: true,
            group: { include: { tickets: { include: { registrations: true } } } },
          },
        });
        if (!ticket) return 0;
        return placesLeft(ticket);
      },
      complexity: 5
    }),
  }),
});

builder.queryField('ticket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({ where: { id }, include: { event: true } });
      if (!ticket) return false;
      return eventAccessibleByUser(ticket.event, user);
    },
    resolve: async (query, _, { id }) =>
      prisma.ticket.findFirstOrThrow({ ...query, where: { id } }),
  })
);

builder.queryField('ticketsOfEvent', (t) =>
  t.prismaConnection({
    type: TicketType,
    cursor: 'id',
    args: {
      event: t.arg.id(),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return false;
      return eventAccessibleByUser(event, user);
    },
    async resolve(query, _, { event }) {
      return prisma.ticket.findMany({ ...query, where: { eventId: event } });
    },
  })
);

builder.mutationField('createTicket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      eventId: t.arg.id(),
      ticketGroupId: t.arg.id({ required: false }),
      name: t.arg.string(),
      description: t.arg.string(),
      opensAt: t.arg({ type: DateTimeScalar, required: false }),
      closesAt: t.arg({ type: DateTimeScalar, required: false }),
      price: t.arg.float(),
      capacity: t.arg.int(),
      links: t.arg({ type: [LinkInput] }),
      allowedPaymentMethods: t.arg({ type: [PaymentMethodEnum] }),
      openToPromotions: t.arg({ type: ['Int'] }),
      openToAlumni: t.arg.boolean({ required: false }),
      openToExternal: t.arg.boolean({ required: false }),
      openToSchools: t.arg({ type: ['Int'] }),
      openToGroups: t.arg({ type: ['String'] }),
      openToNonAEContributors: t.arg.boolean(),
      godsonLimit: t.arg.int(),
      onlyManagersCanProvide: t.arg.boolean(),
    },
    async authScopes(_, { eventId }, { user }) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return false;
      return eventManagedByUser(event, user);
    },
    async resolve(
      _,
      {},
      {
        eventId,
        ticketGroupId,
        name,
        description,
        opensAt,
        closesAt,
        price,
        capacity,
        links,
        allowedPaymentMethods,
        openToPromotions,
        openToAlumni,
        openToExternal,
        openToSchools,
        openToNonAEContributors,
        godsonLimit,
        onlyManagersCanProvide,
      },
      { user }
    ) {
      if (!user) throw new Error('You must be logged in to create a ticket');
      return prisma.ticket.create({
        data: {
          event: { connect: { id: eventId } },
          group: ticketGroupId ? { connect: { id: ticketGroupId } } : undefined,
          name,
          description,
          opensAt,
          closesAt,
          price,
          capacity,
          links: {
            create: links.map((link) => ({ ...link, author: { connect: { id: user.id } } })),
          },
          allowedPaymentMethods: { set: allowedPaymentMethods },
          openToPromotions: { set: openToPromotions },
          openToAlumni,
          openToExternal,
          openToSchools: { connect: openToSchools.map((id) => ({ id })) },
          godsonLimit,
          onlyManagersCanProvide,
          openToNonAEContributors,
        },
      });
    },
  })
);

builder.mutationField('updateTicket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg.id(),
      eventId: t.arg.id(),
      name: t.arg.string(),
      description: t.arg.string(),
      opensAt: t.arg({ type: DateTimeScalar }),
      closesAt: t.arg({ type: DateTimeScalar }),
      price: t.arg.float(),
      capacity: t.arg.int(),
      links: t.arg({ type: [LinkInput] }),
      allowedPaymentMethods: t.arg({ type: [PaymentMethodEnum] }),
      openToPromotions: t.arg({ type: ['Int'] }),
      // XXX values can be null, but we aren't allowed to set them, so we interpret undefined as null, and not as "don't change".
      openToAlumni: t.arg.boolean({ required: false }),
      openToExternal: t.arg.boolean({ required: false }),
      openToSchools: t.arg({ type: ['Int'] }),
      openToGroups: t.arg({ type: ['String'] }),
      openToNonAEContributors: t.arg.boolean({ required: false }),
      godsonLimit: t.arg.int(),
      onlyManagersCanProvide: t.arg.boolean(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({ where: { id }, include: { event: true } });
      if (!ticket) return false;
      return eventManagedByUser(ticket.event, user);
    },
    async resolve(
      query,
      {},
      {
        id,
        eventId,
        name,
        description,
        opensAt,
        closesAt,
        price,
        capacity,
        links,
        allowedPaymentMethods,
        openToPromotions,
        openToAlumni,
        openToExternal,
        openToSchools,
        openToNonAEContributors,
        godsonLimit,
        onlyManagersCanProvide,
      },
      { user }
    ) {
      if (!user) throw new Error('You must be logged in to update a ticket');
      return prisma.ticket.update({
        ...query,
        where: { id },
        data: {
          name,
          event: { connect: { id: eventId } },
          description,
          opensAt,
          closesAt,
          price,
          capacity,
          links: {
            update: {
              links: {
                deleteMany: {},
                create: links.map((link) => ({ ...link, author: { connect: { id: user.id } } })),
              },
            },
          },
          allowedPaymentMethods: { set: allowedPaymentMethods },
          openToPromotions: { set: openToPromotions },
          // eslint-disable-next-line unicorn/no-null
          openToAlumni: openToAlumni === undefined ? null : openToAlumni,
          // eslint-disable-next-line unicorn/no-null
          openToExternal: openToExternal === undefined ? null : openToExternal,
          openToSchools: { connect: openToSchools.map((id) => ({ id })) },
          godsonLimit,
          onlyManagersCanProvide,
          openToNonAEContributors:
            // eslint-disable-next-line unicorn/no-null
            openToNonAEContributors === undefined ? null : openToNonAEContributors,
        },
      });
    },
  })
);

builder.mutationField('deleteTicket', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({ where: { id }, include: { event: true } });
      if (!ticket) return false;
      return eventManagedByUser(ticket.event, user);
    },
    async resolve(_, { id }) {
      await prisma.ticket.delete({ where: { id } });
      return true;
    },
  })
);
