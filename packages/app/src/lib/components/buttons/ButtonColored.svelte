<script lang="ts">
	export let id: string = '';
	export let dangerous = false;
	export let warns = false;
	export let successful = false;
	export let href: string = '';

	const backgroundColor = dangerous ? 'rose' : warns ? 'plaster' : successful ? 'moss' : 'ice';
	const foregroundColor = dangerous
		? 'blood'
		: warns
		? 'safran'
		: successful
		? 'cactus'
		: 'cobalt';
	const pressedBackgroundColor = dangerous
		? 'mushroom'
		: warns
		? 'gold'
		: successful
		? 'acid'
		: 'sky';
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{id}
	{href}
	class="button-colored typo-paragraph"
	style:--foreground={`var(--${foregroundColor})`}
	style:--background={`var(--${backgroundColor})`}
	style:--pressed-background={`var(--${pressedBackgroundColor})`}
	style:--pressed-foreground={successful ? '#000' : '#fff'}
	on:click
>
	<slot />
</svelte:element>

<style>
	.button-colored {
		background-color: var(--background);
		color: var(--foreground);

		border: none;

		border-radius: 1em;

		padding: 0.5rem 1rem;

		cursor: pointer;
	}

	.button-colored:hover,
	.button-colored:focus {
		background-color: var(--pressed-background);
		color: var(--pressed-foreground);
	}
</style>
