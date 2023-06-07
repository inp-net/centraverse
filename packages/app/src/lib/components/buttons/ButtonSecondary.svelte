<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Name as IconName } from './icons/types';

	export let icon: IconName = '';
	export let id: string = '';
	export let href: string = '';
	export let formaction: string | undefined = undefined;
	export let dangerous: boolean = false;
	export let submits = false;
	export let download: string | undefined = undefined;
	export let insideProse = false;
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	type={submits ? 'submit' : 'button'}
	class="button-secondary typo-paragraph"
	class:dangerous
	class:inside-prose={insideProse}
	{href}
	{download}
	{formaction}
	{id}
	on:click
>
	{#if icon}
		<div class="icon">
			<Icon name={icon} />
		</div>
	{/if}
	<slot />
</svelte:element>

<style>
	.button-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.25rem 0.75rem;

		background: var(--bg);
		border: var(--border-width) solid var(--fg);
		border-radius: 1000px;

		cursor: pointer;
	}

	.button-secondary.inside-prose {
		margin: 0.5rem;
	}

	.button-secondary:hover,
	.button-secondary:focus {
		background: var(--fg);
		color: var(--bg);
		--icon-color: var(--bg);
	}

	.button-secondary.dangerous {
		border-color: var(--mushroom);
		background-color: var(--mushroom);
		color: #fff;
		--icon-color: #fff;
	}

	.button-secondary.dangerous:hover,
	.button-secondary.dangerous:focus {
		background-color: var(--blood);
		border-color: var(--blood);
	}

	.icon {
		height: 1em;
		width: 1em;
	}
</style>
