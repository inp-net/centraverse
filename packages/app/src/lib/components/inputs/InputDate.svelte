<script lang="ts">
	import { z } from 'zod';
	import BaseInputText from './BaseInputText.svelte';

	export let value: Date | null;
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let initial: Date | undefined = undefined;
	export let placeholder: string = '';
	export let required: boolean = false;

	export let schema: Zod.ZodDate = z.date();
</script>

<BaseInputText {placeholder} type="date" bind:value {id} {name} {initial} {schema} {required} />
