<script lang="ts">
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconTicket from '~icons/mdi/ticket-outline';
  import IconAccount from '~icons/mdi/account-circle-outline';

  import ButtonSecondary from './ButtonSecondary.svelte';
  import { onMount } from 'svelte';
  import { me } from '$lib/session';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';

  onMount(() => {
    window.addEventListener('scroll', () => {
      scrolled = window.scrollY >= 3;
    });
  });

  let scrolled = false;
</script>

<nav id="navigation-top" class:scrolled>
  <a href="/"><img class="logo" src="/logo.png" alt="logo de l'AE" /></a>

  <div class="actions">
    {#if $me}
      <a href="https://git.inpt.fr/inp-net/centraverse/-/issues/new" style="color:red"
        ><IconIssue /></a
      >
      <a href="/notifications/"><IconNotif /></a>
      <a href="/bookings/"><IconTicket /></a>
      <a href="/me/">
        {#if $me.pictureFile}
          <img class="profilepic" src="{PUBLIC_STORAGE_URL}{$me.pictureFile}" alt="Profil" />
        {:else}
          <IconAccount />
        {/if}
      </a>
    {:else}
      <div><ButtonSecondary href="/register/">Créer un compte</ButtonSecondary></div>
      <div><ButtonSecondary href="/login/">Connexion</ButtonSecondary></div>
    {/if}
  </div>
</nav>

<style lang="css">
  nav {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin: 0;
    background: var(--bg);
    transition: box-shadow 0.25s ease;
  }

  nav.scrolled {
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1.3rem;
    font-size: 1.3em;
  }

  img.logo {
    width: 6rem;
    height: 3rem;
    object-fit: cover;
  }

  .actions a {
    display: flex;
    align-items: center;
  }

  .profilepic {
    --size: calc(1.3em);
    border-radius: 50%;
    height: var(--size);
    width: var(--size);
    overflow: hidden;
    /* border: 3px solid var(--text); */
  }
</style>
