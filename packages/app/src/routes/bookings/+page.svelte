<script lang="ts">
  import PaymentStatusBadge from '$lib/components/BadgePaymentStatus.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Mes places</h1>

<ul>
  {#each data.registrationsOfUser.edges as { node: { ticket, paid, id, beneficiary, beneficiaryUser, author, ticket: { event, event: { group } } } }}
    <li>
      <a href="/bookings/{id.split(':')[1].toUpperCase()}">
        <strong>{event.title}</strong>
        Place {ticket.name}
      </a>
      <PaymentStatusBadge {paid} />
      <p>
        {#if beneficiary && author.uid === $me?.uid}pour
          {#if beneficiaryUser}
            <a href="/user/{beneficiaryUser.uid}"
              >{beneficiaryUser.firstName} {beneficiaryUser.lastName}</a
            >
          {:else}
            {beneficiary}
          {/if}
        {/if}
        {#if author.uid !== $me?.uid}par <a href="/user/{author.uid}"
            >{author.firstName} {author.lastName}</a
          >
        {/if}
      </p>
    </li>
  {/each}
</ul>
