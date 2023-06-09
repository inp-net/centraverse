<script lang="ts">
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/Alert.svelte';
  import Button from '$lib/components/Button.svelte';

  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus.js';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';
  import InputField from '$lib/components/InputField.svelte';

  export let data: PageData;

  let {
    address,
    phone,
    birthday,
    firstName,
    graduationYear = new Date().getFullYear() + 3,
    lastName,
    majorId,
  } = data.userCandidateByEmail;

  // Waiting for https://github.com/graphql-editor/graphql-zeus/issues/262 to be fixed
  graduationYear ??= new Date().getFullYear() + 3;

  const valueAsDate = (x: unknown) => (x as HTMLInputElement).valueAsDate;

  $: args = {
    email: data.userCandidateByEmail.email,
    address,
    birthday,
    firstName,
    graduationYear,
    lastName,
    majorId: majorId!,
    phone,
  };

  let loading = false;
  let loadingSave = false;
  let loadingRegister = false;
  let loadingRefuse = false;
  let formErrors: ZodFormattedError<typeof args> | undefined;
  const onSubmit = async ({ submitter }: SubmitEvent) => {
    if (loading) return;
    if (!submitter) return;

    const update = !submitter.dataset.refuse;

    try {
      loading = true;

      if (update) {
        const register = Boolean(submitter.dataset.register);
        loadingRegister = register;
        loadingSave = !register;
        await updateUserCandidate(register);
        if (register) await goto('../..');
      } else {
        loadingRefuse = true;
        await $zeus.mutate({
          refuseRegistration: [{ email: data.userCandidateByEmail.email }, true],
        });
      }
    } finally {
      loading = false;
      loadingSave = false;
      loadingRegister = false;
      loadingRefuse = false;
    }
  };

  const updateUserCandidate = async (register: boolean) => {
    try {
      const { updateUserCandidate } = await $zeus.mutate({
        updateUserCandidate: [
          { register, ...args },
          {
            __typename: true,
            '...on MutationUpdateUserCandidateSuccess': { data: true },
            '...on Error': { message: true },
            '...on ZodError': { message: true, fieldErrors: { path: true, message: true } },
          },
        ],
      });

      if (updateUserCandidate.__typename === 'ZodError') {
        formErrors = fieldErrorsToFormattedError(updateUserCandidate.fieldErrors);
        return;
      }

      if (updateUserCandidate.__typename === 'Error') {
        formErrors = { _errors: [updateUserCandidate.message] };
        return;
      }
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    }
  };
</script>

<form title="Modifier une inscription" on:submit|preventDefault={onSubmit}>
  <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
    <strong>{(formErrors?._errors ?? []).join(' ')}</strong>
  </Alert>
  <p>Demande envoyée par <strong>{data.userCandidateByEmail.email}</strong>.</p>
  <p class="grid gap-4 desktop:grid-cols-2">
    <InputField label="Prénom :" errors={formErrors?.firstName?._errors}>
      <input type="text" bind:value={firstName} required />
    </InputField>
    <InputField label="Nom de famille :" errors={formErrors?.lastName?._errors}>
      <input type="text" bind:value={lastName} required />
    </InputField>
  </p>
  <p class="grid gap-4 desktop:grid-cols-2">
    <InputField label="Filière :" errors={formErrors?.majorId?._errors}>
      <select bind:value={majorId} required>
        {#each data.schoolGroups as { majors, names }}
          <optgroup label={names.join(', ')}>
            {#each majors as { id, name }}
              <option value={id}>{name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </InputField>
    <InputField label="Promotion :" errors={formErrors?.graduationYear?._errors}>
      <input type="number" bind:value={graduationYear} size="4" required />
    </InputField>
  </p>
  <p class="grid gap-4 grid-cols-2">
    <InputField label="Date de naissance :" errors={formErrors?.birthday?._errors}>
      <input
        type="date"
        value={birthday?.toISOString().slice(0, 10)}
        on:change={({ target }) => {
          // @ts-expect-error https://github.com/graphql-editor/graphql-zeus/issues/262
          birthday = valueAsDate(target);
        }}
      />
    </InputField>
    <InputField label="Numéro de téléphone :" errors={formErrors?.phone?._errors}>
      <input type="tel" bind:value={phone} />
    </InputField>
  </p>
  <p>
    <InputField label="Adresse :" errors={formErrors?.address?._errors}>
      <input type="text" bind:value={address} />
    </InputField>
  </p>
  <p class="text-center">
    <Button type="submit" theme="primary" disabled={loading} loading={loadingSave} data-save>
      Sauvegarder
    </Button>
    <Button
      type="submit"
      theme="success"
      disabled={loading}
      loading={loadingRegister}
      data-register
    >
      Sauvegarder et inscrire
    </Button>
    <Button type="submit" theme="danger" disabled={loading} loading={loadingRefuse} data-refuse>
      Refuser
    </Button>
    <a href="../..">Retour à la liste</a>
  </p>
</form>
