<script lang="ts">
  import FormEvent from '$lib/components/FormEvent.svelte';
  import { me } from '$lib/session';
  import { Selector, zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;

  let availableLydiaAccounts: Array<{ name: string; id: string }> = [];
  $: $zeus
    .query({
      lydiaAccountsOfGroup: [
        { uid: data.event.group.uid },
        Selector('LydiaAccount')({ id: true, name: true }),
      ],
    })
    .then(({ lydiaAccountsOfGroup }) => {
      availableLydiaAccounts = lydiaAccountsOfGroup;
    })
    .catch(console.error);
</script>

<a href="../">Voir l'évènement</a>

<FormPicture objectName="Event" bind:object={data.event} />
<FormEvent
  availableGroups={data.groups.filter((g) =>
    $me?.groups.some(({ group, canEditArticles }) => canEditArticles && group.id === g.id)
  )}
  {availableLydiaAccounts}
  bind:event={data.event}
/>
