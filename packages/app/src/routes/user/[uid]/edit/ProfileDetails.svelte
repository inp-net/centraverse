<script lang="ts">
  import ButtonPrimary from '$lib/components/buttons/ButtonPrimary.svelte';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import InputGroup from '$lib/components/groups/InputGroup.svelte';
  import { zeus } from '$lib/zeus';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up';
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import type { PageData } from './$types';
  import { userQuery } from './+page';

  export let data: PageData;

  // We don't want form bindings to be reactive to let them evolve separately from the data
  let {
    address,
    description,
    graduationYear,
    linkCollection,
    majorId,
    nickname,
    phone,
    // See https://github.com/graphql-editor/graphql-zeus/issues/262
    // eslint-disable-next-line unicorn/no-null
    birthday = null,
  } = data.user;

  const valueAsDate = (x: unknown) => (x as HTMLInputElement).valueAsDate;

  let loading = false;
  const updateUser = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateUser } = await $zeus.mutate({
        updateUser: [
          {
            uid: data.user.uid,
            nickname,
            description,
            links: linkCollection.links,
            address,
            graduationYear,
            majorId,
            phone,
            birthday,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpdateUserSuccess': { data: userQuery },
          },
        ],
      });

      if (updateUser.__typename === 'Error') {
        console.error(updateUser.message);
        return;
      }

      data.user = updateUser.data;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUser}>
  <fieldset>
    <legend>Informations personnelles</legend>
    <p>
      <label>Surnom : <InputText  bind:value={nickname} /></label>
    </p>
    <p>
      <label>Description : <InputText  bind:value={description} /></label>
    </p>
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
      Filière et promotion :
      <InputGroup>
        <select bind:value={majorId}>
          {#each data.schoolGroups as { majors, names }}
            <optgroup label={names.join(', ')}>
              {#each majors as { id, name }}
                <option value={id}>{name}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
        <input type="number" bind:value={graduationYear} size="4" />
      </InputGroup>
    </p>
    <p>
      Anniversaire :
      {#if birthday === null}
        <GhostButton
          on:click={() => {
            birthday = new Date();
          }}
        >
          <MajesticonsPlus aria-label="Ajouter" />
        </GhostButton>
      {:else}
        <input
          type="date"
          value={birthday.toISOString().slice(0, 10)}
          on:change={({ target }) => {
            birthday = valueAsDate(target);
          }}
        />
        <GhostButton
          on:click={() => {
            // We use null rather than undefined because only null exists in JSON
            // eslint-disable-next-line unicorn/no-null
            birthday = null;
          }}
        >
          <MajesticonsClose aria-label="Supprimer" />
        </GhostButton>
      {/if}
    </p>
    <p>
      <label>
        Adresse : <InputText  bind:value={address} />
      </label>
    </p>
    <p>
      <label>
        Phone : <input type="tel" bind:value={phone} />
      </label>
    </p>
    <p>
      <ButtonPrimary type="submit" {loading}>Sauvegarder</ButtonPrimary>
    </p>
  </fieldset>
</form>
