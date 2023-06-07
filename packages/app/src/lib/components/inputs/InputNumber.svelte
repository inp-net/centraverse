<script lang="ts">
	import { z } from 'zod';
	import BaseInputText from './BaseInputText.svelte';

	export let unit: string = '';
	export let value: number | undefined;
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let initial: number | undefined = undefined;
	export let placeholder: string = '';
	export let closeKeyboardOnEnter: boolean = false;

	export let schema: Zod.ZodSchema = z.number();

	export let required: boolean = false;
</script>

<BaseInputText
	{placeholder}
	type="number"
	{unit}
	bind:value
	{id}
	{name}
	{initial}
	{schema}
	{required}
	{closeKeyboardOnEnter}
/>
