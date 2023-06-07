<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Name as IconName } from './icons/types';

	export let id: string = '';
	export let icon: IconName;
	export let href: string = '';
</script>

<svelte:element this={href ? 'a' : 'button'} class="button-floating" {id} {href} on:click>
	<div class="icon">
		<Icon name={icon} />
	</div>
	<slot />
</svelte:element>

<style>
	.button-floating {
		background: var(--bg);
		color: var(--fg);
		--icon-color: var(--fg);
		border-color: transparent;
		box-shadow: -0.5rem 0.5rem 1rem rgba(0, 0, 0, 0.25);
		font-size: 1rem;

		border-radius: 10000px;
		/* width: 4rem; */
		padding: 1rem 1.5rem;
		gap: 1rem;

		cursor: pointer;
		display: flex;
		align-items: center;
	}

	a.button-floating {
		height: 2rem;
	}

	.button-floating:hover,
	.button-floating:focus {
		background: var(--fg);
		color: var(--bg);
		--icon-color: var(--bg);
	}

	.icon {
		height: 2rem;
	}
</style>
