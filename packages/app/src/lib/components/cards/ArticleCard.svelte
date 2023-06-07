<script lang="ts">
  import Card from './Card.svelte';

  export let title: string;
  export let href: string;
  export let group: { name: string; uid: string } | undefined;
  export let author: { firstName: string; lastName: string; uid: string }|undefined;
  export let publishedAt: Date;
  export let authorRole: string;
  export let img: { src: string; alt: string; width: number; height: number } | undefined =
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
    <h2>{title}</h2>
  </header>
  <slot />
</Card>

<style lang="scss">
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
</style>
