<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/user/[uid]/edit/$types';

  export let data: PageData;

  let { admin, canEditGroups, canEditUsers } = data.userPermissions;

  let loading = false;
  const updateUserPermissions = async () => {
    loading = true;
    try {
      const { updateUserPermissions } = await $zeus.mutate({
        updateUserPermissions: [
          { uid: data.user.uid, admin, canEditGroups, canEditUsers },
          { admin: true, canEditGroups: true, canEditUsers: true },
        ],
      });

      // Soft refresh because the user's permissions might have changed
      await invalidateAll();

      // Because some permissions set others, we need to update the values
      ({ admin, canEditGroups, canEditUsers } = updateUserPermissions);
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUserPermissions}>
  <fieldset>
    <legend>Permissions</legend>
    <p>
      <label><input type="checkbox" bind:checked={admin} /> Administrateur</label>
    </p>
    <p>
      <label><input type="checkbox" bind:checked={canEditGroups} /> Édition des groupes</label>
    </p>
    <p>
      <label><input type="checkbox" bind:checked={canEditUsers} /> Édition des utilisateurs</label>
    </p>
    <p>
      <Button type="submit" theme="primary" {loading}>Sauvegarder</Button>
    </p>
  </fieldset>
</form>
