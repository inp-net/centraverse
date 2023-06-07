<script lang="ts">
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  let uid = '';
  let title = '';

  // Please tell me there's a better way to do this
  function extractIdInteger(groupId: string): string {
    return atob(groupId).split(':')[1];
  }

  const addGroupMember = async () => {
    try {
      const { addGroupMember } = await $zeus.mutate({
        addGroupMember: [
          { groupUid: data.group.uid, uid, title },
          {
            memberId: true,
            title: true,
            president: true,
            treasurer: true,
            secretary: true,
            vicePresident: true,
            canEditMembers: true,
            member: { firstName: true, lastName: true },
          },
        ],
      });
      data.group.members = [...data.group.members, addGroupMember];
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const deleteGroupMember = async (memberId: string) => {
    try {
      await $zeus.mutate({
        deleteGroupMember: [{ groupId: extractIdInteger(data.group.id), memberId }, true],
      });
      data.group.members = data.group.members.filter((member) => member.memberId !== memberId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const updateGroupMember = async (
    memberId: string,
    {
      makePresident,
      makeTreasurer,
      makeVicePresident,
      makeSecretary,
    }: {
      makePresident?: boolean;
      makeTreasurer?: boolean;
      makeVicePresident?: boolean;
      makeSecretary?: boolean;
    } = {}
  ) => {
    try {
      const member = data.group.members.find((member) => member.memberId === memberId);
      if (!member) throw new Error('Member not found');
      const { updateGroupMember } = await $zeus.mutate({
        updateGroupMember: [
          {
            groupId: extractIdInteger(data.group.id),
            memberId,
            title: member.title,
            president: makePresident ?? member.president,
            treasurer: makeTreasurer ?? member.treasurer,
            vicePresident: makeVicePresident ?? member.vicePresident,
            secretary: makeSecretary ?? member.secretary,
          },
          { title: true, president: true, treasurer: true, vicePresident: true, secretary: true },
        ],
      });
      data.group.members = data.group.members.map((member) =>
        member.memberId === memberId
          ? { ...member, ...updateGroupMember }
          : {
              ...member,
              president: updateGroupMember.president ? false : member.president,
            }
      );
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<a href="../edit">Modifier les informations du club</a>

<table>
  {#each data.group.members as { memberId, member, president, treasurer, vicePresident, secretary }, i}
    <tr>
      <td
        >{president ? '👑' : ''}{treasurer ? '💰' : ''}{vicePresident ? '⭐' : ''}{secretary
          ? '📜'
          : ''}</td
      >
      <td>{member.firstName} {member.lastName}</td>
      <td>
        <input
          type="text"
          bind:value={data.group.members[i].title}
          on:change={async () => updateGroupMember(memberId)}
        />
        {#if !president && !treasurer}
          <button type="button" on:click={async () => deleteGroupMember(memberId)}> ❌ </button>
        {/if}
        <button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makePresident: !president })}
          >👑</button
        ><button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makeTreasurer: !treasurer })}
          >💰</button
        >
        <button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makeVicePresident: !vicePresident })}
          >⭐</button
        >
        <button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makeSecretary: !secretary })}
          >📜</button
        >
      </td>
    </tr>
  {/each}
</table>

<form on:submit|preventDefault={addGroupMember}>
  <h2>Ajouter un membre</h2>
  <p>
    <label>
      Nom d'utilisateur : <InputText  bind:value={uid} required />
    </label>
  </p>
  <p>
    <label>
      Titre : <InputText  bind:value={title} />
    </label>
  </p>
  <p><button type="submit">Ajouter</button></p>
</form>

<style>
  td.actions {
    display: flex;
    flex-wrap: wrap;
  }
</style>
