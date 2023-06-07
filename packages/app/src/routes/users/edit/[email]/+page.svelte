<script lang="ts">
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import ButtonPrimary from '$lib/components/buttons/ButtonPrimary.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus.js';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';

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

    const update = !submitter!.dataset.refuse;

    try {
      loading = true;

      if (update) {
        const register = Boolean(submitter!.dataset.register);
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

<FormCard large title="Modifier une inscription" on:submit={onSubmit}>
  <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
    <strong>{(formErrors?._errors ?? []).join(' ')}</strong>
  </Alert>
  <p>Demande envoyée par <strong>{data.userCandidateByEmail.email}</strong>.</p>
  <p class="grid gap-4 desktop:grid-cols-2">
    <FormInput label="Prénom :" errors={formErrors?.firstName?._errors}>
      <InputText  bind:value={firstName} required />
    </FormInput>
    <FormInput label="Nom de famille :" errors={formErrors?.lastName?._errors}>
      <InputText  bind:value={lastName} required />
    </FormInput>
  </p>
  <p class="grid gap-4 desktop:grid-cols-2">
    <FormInput label="Filière :" errors={formErrors?.majorId?._errors}>
      <select bind:value={majorId} required>
        {#each data.schoolGroups as { majors, names }}
          <optgroup label={names.join(', ')}>
            {#each majors as { id, name }}
              <option value={id}>{name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </FormInput>
    <FormInput label="Promotion :" errors={formErrors?.graduationYear?._errors}>
      <input type="number" bind:value={graduationYear} size="4" required />
    </FormInput>
  </p>
  <p class="grid gap-4 grid-cols-2">
    <FormInput label="Date de naissance :" errors={formErrors?.birthday?._errors}>
      <input
        type="date"
        value={birthday?.toISOString().slice(0, 10)}
        on:change={({ target }) => {
          // @ts-expect-error https://github.com/graphql-editor/graphql-zeus/issues/262
          birthday = valueAsDate(target);
        }}
      />
    </FormInput>
    <FormInput label="Numéro de téléphone :" errors={formErrors?.phone?._errors}>
      <input type="tel" bind:value={phone} />
    </FormInput>
  </p>
  <p>
    <FormInput label="Adresse :" errors={formErrors?.address?._errors}>
      <InputText  bind:value={address} />
    </FormInput>
  </p>
  <p class="text-center">
    <ButtonPrimary type="submit" disabled={loading} loading={loadingSave} data-save>
      Sauvegarder
    </ButtonPrimary>
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
</FormCard>
