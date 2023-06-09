<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { intlFormatDistance } from 'date-fns';
  import Card from './Card.svelte';
  import IconLock from '~icons/mdi/lock-outline';
  import IconCommunity from '~icons/mdi/google-circles-extended';
  import IconLinkLock from '~icons/mdi/link-lock';
  import IconGlobe from '~icons/mdi/earth';
  import IconDots from '~icons/mdi/dots-horizontal';
  import { Visibility } from '$lib/zeus';
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import ButtonInk from './ButtonInk.svelte';

  export let visibility: Visibility | undefined = undefined;
  export let title: string;
  export let href: string;
  export let publishedAt: Date;
  export let links: Array<{ value: string; name: string }> = [];
  export let group: { uid: string; name: string; pictureFile: string };
  export let author: { uid: string; firstName: string; lastName: string } | undefined = undefined;
  export let img: { src: string; alt?: string; width?: number; height?: number } | undefined =
    undefined;
</script>

<Card element="article">
  <svelte:fragment slot="header">
    {#if img}
      <a {href} class="header">
        <img loading="lazy" {...img} alt={img.alt || "Image de l'article"} />
      </a>
    {/if}
  </svelte:fragment>
  <header>
    <a {href}><h2>{title}</h2></a>
    <div class="visibility" title={visibility ? DISPLAY_VISIBILITIES[visibility] : undefined}>
      {#if visibility === Visibility.Private}
        <IconLock />
      {:else if visibility === Visibility.Unlisted}
        <IconLinkLock />
      {:else if visibility === Visibility.Restricted}
        <IconCommunity />
      {:else if visibility === Visibility.Public}
        <IconGlobe />
      {/if}
    </div>
  </header>

  <div class="description">
    <slot />
  </div>

  {#if links.length > 0}
    <ul class="links">
      {#each links as link}
        <li>
          <ButtonSecondary href={link.value}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="see-more">
    <ButtonInk {href} icon={IconDots}>Voir plus</ButtonInk>
  </div>

  <section class="author-and-date">
    <div class="author">
      <a href="/club/{group.uid}">
        <img
          src={group.pictureFile
            ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
            : 'https://via.placeholder.com/400/400'}
          alt=""
        />
      </a>
      <div class="names">
        <span class="name">{group.name}</span>
        {#if author}
          <span class="author">
            {author.firstName}
            {author.lastName}
          </span>
        {/if}
      </div>
    </div>
    <div class="published-at">
      {#if publishedAt}
        {intlFormatDistance(publishedAt, new Date())}
      {/if}
    </div>
  </section>
</Card>

<style lang="scss">
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .description {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .author-and-date {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .author {
    display: flex;
    gap: 0.5rem;

    img {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-inline);
      object-fit: contain;
    }
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    list-style: none;
  }

  .header {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
    grid-template-columns: repeat(auto-fit, minmax(max(min(120px, 100%), 100%/3), 1fr));
    min-height: 10rem;
    max-height: 20rem;
    padding: 0;
    color: #fff;
    text-decoration: unset;
    background: linear-gradient(160deg, tomato, purple);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .see-more {
    display: inline-block;
    margin: 2rem 0;
  }
</style>
