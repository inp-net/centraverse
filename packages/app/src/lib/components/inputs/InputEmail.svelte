<script lang="ts">
	import { z } from 'zod';
	import BaseInputText from './BaseInputText.svelte';
	import { EMAIL_REGEX } from './types';

	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let initial: string | undefined = undefined;
	export let placeholder: string | undefined = undefined;
	export let value: string;
	export let unit: string = '';
	export let suggestions: string[] | undefined = undefined;
	export let required: boolean = false;

	export let schema: Zod.ZodString = z.string().regex(EMAIL_REGEX, {
		message: 'Adresse email invalide'
	}); /* don't use .email() until https://github.com/colinhacks/zod/pull/2224 gets merged, someone@laplace.univ-tlse.fr does not pass!!!! */
</script>

<BaseInputText
	autocomplete="email"
	type="email"
	bind:value
	on:input
	{id}
	{schema}
	{name}
	{unit}
	{initial}
	{placeholder}
	{suggestions}
	{required}
/>
