<script lang="ts">
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import InputGroup from '$lib/components/groups/InputGroup.svelte';
  import InputText from "$lib/components/inputs/InputText.svelte";
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { clubQuery } from './+page';
  import ButtonPrimary from '$lib/components/buttons/ButtonPrimary.svelte';
  import { onMount } from 'svelte';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import ParentSearch from '../../../clubs/create/ParentSearch.svelte';

  export let data: PageData;

  let serverError = '';

  let {
    address,
    color,
    description,
    email,
    linkCollection,
    longDescription,
    name,
    selfJoinable,
    type,
    parentId = '',
  } = data.group;

  let otherGroups: Array<{ groupId: string; uid: string }> = [];
  let parentUid = '';
  onMount(async () => {
    // See https://github.com/graphql-editor/graphql-zeus/issues/262
     
    ({ parentId = '' } = data.group);
    ({ groups: otherGroups } = await $zeus.query({
      groups: [{}, { groupId: true, uid: true }],
    }));
    parentUid = parentId ? otherGroups.find((g) => g.groupId === parentId)?.uid ?? '' : '';
  });
  $: parentId = parentUid ? otherGroups.find((g) => g.uid === parentUid)?.groupId ?? '' : '';

  let loading = false;
  const updateClub = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateGroup } = await $zeus.mutate({
        updateGroup: [
          {
            uid: data.group.uid,
            address,
            color,
            description,
            email,
            links: linkCollection.links,
            longDescription,
            name,
            selfJoinable,
            parentId,
            type,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpdateGroupSuccess': { data: clubQuery },
          },
        ],
      });

      if (updateGroup.__typename === 'Error') {
        serverError = updateGroup.message;
        return;
      }

      serverError = '';
      data.group = updateGroup.data;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateClub}>
  <fieldset>
    <legend>Informations</legend>
    <p>
      <label
        >Type de groupe : <select bind:value={type}>
          <option value="Association">Association</option>
          <option value="Club">Club</option>
          <option value="Group">Groupe informel</option>
          <option value="Integration">Groupe d'inté</option>
          <option value="StudentAssociationSection">Bureau d'AE</option>
        </select></label
      >
    </p>
    <p><label>Nom : <InputText  bind:value={name} /></label></p>
    <p>
      <label
        >Description courte :
        <InputText  bind:value={description} />
      </label>
    </p>
    <p>
      Description longue (syntaxe <a
        rel="noreferrer"
        target="_blank"
        href="https://www.markdownguide.org/cheat-sheet/#basic-syntax">Markdown</a
      > supportée) :
    </p>
    <textarea cols="30" rows="10" bind:value={longDescription} />
    <p>
      <label>Couleur : <input type="color" bind:value={color} /></label>
    </p>
    <p>
      <label>Adresse : <InputText  bind:value={address} /></label>
    </p>
    <!-- <p>
        <label>Email : <input type="email" bind:value={email} /></label>
    </p> -->
    <p>Réseaux sociaux :</p>
    <ul>
      {#each linkCollection.links as link, i}
        <li>
          <InputGroup>
            <select bind:value={link.type}>
              {#each data.linkTypes as type}
                <option>{type}</option>
              {/each}
            </select>
            <input bind:value={link.value} />
          </InputGroup>
          <InputGroup>
            <GhostButton
              title="Supprimer"
              on:click={() => {
                linkCollection.links = linkCollection.links.filter((_, j) => i !== j);
              }}
            >
              <MajesticonsClose aria-label="Supprimer" />
            </GhostButton>
            {#if i > 0}
              <GhostButton
                title="Remonter"
                on:click={() => {
                  linkCollection.links = [
                    ...linkCollection.links.slice(0, i - 1),
                    linkCollection.links[i],
                    linkCollection.links[i - 1],
                    ...linkCollection.links.slice(i + 1),
                  ];
                }}
              >
                <MajesticonsChevronUp aria-label="Remonter" />
              </GhostButton>
            {/if}
          </InputGroup>
        </li>
      {/each}
      <li>
        <button
          type="button"
          on:click={() => {
            linkCollection.links = [
              ...linkCollection.links,
              { type: data.linkTypes[0], value: '' },
            ];
          }}><MajesticonsPlus aria-hidden="true" />Ajouter</button
        >
      </li>
    </ul>
    <p>
      <ParentSearch bind:parentUid />
    </p>
    {#if serverError}
      <Alert theme="danger"
        >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
      >
    {/if}
    <p>
      <ButtonPrimary type="submit"  {loading}>Sauvegarder</ButtonPrimary>
    </p>
  </fieldset>
</form>
