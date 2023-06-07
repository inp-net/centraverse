<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Name as IconName } from './icons/types';

	export let id: string = '';
	export let icon: IconName;

	let hoverOrFocus = false;
</script>

<button
	{id}
	on:focus={() => (hoverOrFocus = true)}
	on:blur={() => (hoverOrFocus = false)}
	on:mouseenter={() => (hoverOrFocus = true)}
	on:mouseleave={() => (hoverOrFocus = false)}
	on:click
	type="button"
>
	<Icon name={icon} color={hoverOrFocus ? '#fffa' : 'bg'} />
</button>

<style>
	button {
		background: var(--fg);
		color: var(--bg);
		border-color: transparent;

		border-radius: 50%;
		height: 2rem;
		width: 2rem;
		padding: 0.25rem;

		cursor: pointer;
	}
</style>
