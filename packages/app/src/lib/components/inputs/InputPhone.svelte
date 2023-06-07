<script lang="ts">
	import BaseInputText from './BaseInputText.svelte';
	import { z } from 'zod';

	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let initial: string | undefined = undefined;
	export let placeholder: string | undefined = undefined;
	export let value: string;
	export let schema: Zod.ZodString = z.string();
	export let required: boolean = false;
</script>

<BaseInputText
	autocomplete="tel"
	type="tel"
	bind:value
	{id}
	{name}
	{initial}
	{placeholder}
	{schema}
	{required}
/>
