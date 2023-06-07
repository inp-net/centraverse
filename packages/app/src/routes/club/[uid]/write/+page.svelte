<script lang="ts">
  import { goto } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  let title = '';
  let body = '';

  const createArticle = async () => {
    try {
      await $zeus.mutate({
        createArticle: [{ title, body, groupUid: data.group.uid }, { id: true }],
      });
      await goto('..');
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<form on:submit|preventDefault={createArticle}>
  <p>
    <label>
      Titre :
      <InputText  bind:value={title} />
    </label>
  </p>
  <p>
    <textarea bind:value={body} cols="80" rows="10" />
  </p>
  <p><button type="submit">Créer l'article</button></p>
</form>
