<script lang="ts">
	import { onMount } from 'svelte';

	export let value: string | null = null;
	export let options: string[] | Record<string, string> = {};
	export let name: string | undefined = undefined;
	export let required: boolean = false;

	let errorMessage: string = '';
	let showEmptyErrors: boolean = false;
	$: if (required && value === null && showEmptyErrors) {
		errorMessage = 'Ce champ est requis';
	} else {
		errorMessage = '';
	}

	onMount(() => {
		if (required) {
			fieldsetElement
				.closest('form')
				?.querySelector('button[type=submit]')
				?.addEventListener('click', () => {
					showEmptyErrors = true;
				});
		}
	});

	let edited: boolean = false;

	let errored: boolean = false;
	$: errored = errorMessage !== '';

	let optionsWithDisplay: Record<string, string> = {};
	$: optionsWithDisplay = Array.isArray(options)
		? Object.fromEntries(options.map((option) => [option, option]))
		: options;

	let fieldsetElement: HTMLFieldSetElement;
</script>

<div class="wrapper" class:errored>
	<fieldset bind:this={fieldsetElement}>
		{#each Object.entries(optionsWithDisplay) as [option, display] (option)}
			<label aria-current={option === value}>
				<input type="radio" {required} {name} bind:group={value} value={option} />
				<slot {value} {display} {option}>{display}</slot>
			</label>
		{/each}
	</fieldset>

	{#if errored}
		<div class="error-area">
			<p class="typo-details error-message">{errorMessage}</p>
		</div>
	{/if}
</div>

<style>
	input {
		display: none;
	}

	label {
		background: var(--bg);
		color: var(--fg);
		padding: 0.5rem 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		outline: var(--border-width) solid var(--fg);
		margin-right: var(--border-width);
		margin-top: var(--border-width);
		flex-grow: 1;
		justify-content: center;
	}

	label[aria-current='true'] {
		background: var(--diamond);
		color: black;
	}

	fieldset {
		border: none;
		display: inline-flex;
		padding: 0;
		flex-wrap: wrap;
		margin: 0;
		justify-content: center;
	}

	.error-area {
		padding: 0.5rem 0.75rem;
		margin-top: calc(var(--border-width) * 2);
		outline: var(--border-width) solid var(--blood);
	}

	/* .wrapper.errored label {
		outline-color: var(--blood);
	} */
	.wrapper.errored label[aria-current='true'] {
		background: var(--blood);
		color: #fff;
	}
	.wrapper.errored .error-area {
		background: var(--blood);
	}

	.wrapper.errored .error-area p {
		color: #fff;
	}
</style>
