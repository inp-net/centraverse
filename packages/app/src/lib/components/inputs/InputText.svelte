<script lang="ts">
	import { z, type ZodSchema } from 'zod';
	import BaseInputText from './BaseInputText.svelte';

	export let name: string | undefined = undefined;
	export let initial: string | undefined = undefined;
	export let placeholder: string | undefined = undefined;
	export let value: string;
	export let required: boolean = false;
	export let autocomplete: string | undefined = undefined;
	export let schema: ZodSchema = z.string();
	export let errorMessage: string | undefined = undefined;
	export let messageIsWarning: boolean = false;
</script>

<BaseInputText
	type="text"
	bind:value
	on:input
	on:action
	{autocomplete}
	{name}
	{initial}
	{errorMessage}
	{messageIsWarning}
	{schema}
	{placeholder}
	{required}
	{...$$restProps}
/>
