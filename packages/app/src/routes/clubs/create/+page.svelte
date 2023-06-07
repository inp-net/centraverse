<script lang="ts">
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import ButtonPrimary from '$lib/components/buttons/ButtonPrimary.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
    import InputText from '$lib/components/inputs/InputText.svelte';
  import { GraphQLError, GroupType, zeus, ZeusError } from '$lib/zeus';
  import type { PageData } from './$types';
  import ParentSearch from './ParentSearch.svelte';

  export let data: PageData;

  let name = '';
  let parentUid: string | undefined;
  let selfJoinable = false;
  let serverError = '';

  let schoolId = data.schools[0].id;

  let loading = false;
  const createGroup = async () => {
    if (loading) return;

    try {
      serverError = '';
      loading = true;
      const { createGroup: group } = await $zeus.mutate({
        createGroup: [
          { type: GroupType.Club, name, schoolId, parentUid, selfJoinable },
          { uid: true },
        ],
      });
      await goto(`/club/${group.uid}`);
    } catch (error: unknown) {
      if (!(error instanceof ZeusError) && !(error instanceof GraphQLError)) throw error;
      serverError = error.message;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={createGroup}>
  <FormInput label="Nom du groupe :">
    <InputText  bind:value={name} required />
  </FormInput>

  <p>
    <ParentSearch bind:parentUid />
  </p>
  <p>
    <label>
      École&nbsp;:
      <select id="school" bind:value={schoolId}>
        {#each data.schools as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </select>
    </label>
  </p>
  <p class="oneline">
    <label>
      <input type="checkbox" bind:checked={selfJoinable} />
      Autoriser l'auto-inscription
    </label>
  </p>
  <ButtonPrimary type="submit"  {loading}>Créer le groupe</ButtonPrimary>
  {#if serverError}
    <Alert theme="danger">{serverError}</Alert>
  {/if}
</form>

<style lang="scss">
  input,
  select {
    display: block;
    width: 100%;
  }

  .oneline {
    input {
      display: inline-block;
      width: unset;
    }
  }
</style>
