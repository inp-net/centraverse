<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import ArticleCard from '$lib/components/cards/ArticleCard.svelte';
  import { formatDateTime } from '$lib/dates';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { pageQuery } from './+page';
  import MajesticonsShare from '~icons/majesticons/share';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';

  export let data: PageData;

  let loading = false;
  const loadMore = async () => {
    if (loading) return;
    try {
      loading = true;
      const { homepage } = await $zeus.query({
        homepage: [{ after: data.homepage.pageInfo.endCursor }, pageQuery],
      });
      data.homepage.pageInfo = homepage.pageInfo;
      data.homepage.edges = [...data.homepage.edges, ...homepage.edges];
    } finally {
      loading = false;
    }
  };
</script>

<h1>Mon feed</h1>

{#each data.homepage.edges as { cursor, node: { slug, title, bodyHtml, publishedAt, group, author, homepage } }}
  <ArticleCard
    {title}
    {author}
    {publishedAt}
    {group}
    authorRole={group.members.find(({memberId}) => memberId === author?.uid)?.title ?? ''}
    href="/club/{group.uid}/post/{slug}/"
    img={publishedAt.getTime() % 2
      ? { src: `https://picsum.photos/seed/${cursor}/960/400`, alt: '', width: 960, height: 400 }
      : undefined}
  >
    <p>
      Par <a href="/club/{group.uid}/">{group.name}</a>
      le {formatDateTime(publishedAt)}
      {#if homepage}en page d'accueil{/if}
      <GhostButton
        on:click={async () => {
          await navigator.share({ url: window.location.href, title });
        }}
      >
        <MajesticonsShare />
      </GhostButton>
    </p>
    {@html bodyHtml}
    {#if author}
      <p>
        <em>
          Auteur : <a href="/user/{author.uid}/">
            {author.firstName}
            {author.lastName}
          </a>
        </em>
      </p>
    {/if}
  </ArticleCard>
{/each}

{#if data.homepage.pageInfo.hasNextPage}
  <p class="text-center"><Button on:click={loadMore} {loading}>Voir plus</Button></p>
{/if}

<style>
  h1 {
    text-align: center;
  }
</style>
