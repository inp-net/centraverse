<script lang="ts">
	import Icon from './Icon.svelte';

	export let name: string = '';
	export let options: string[] | Record<string, string>;
	export let selection: string[] = [];

	let optionsWithDisplay: Record<string, string> = {};
	$: optionsWithDisplay = Array.isArray(options)
		? Object.fromEntries(options.map((option) => [option, option]))
		: options;
</script>

<fieldset>
	{#each Object.entries(optionsWithDisplay) as [value, display] (value)}
		<label aria-checked={selection.includes(value)}>
			<div class="icon" aria-hidden={!selection.includes(value)}>
				<Icon name="checkmark" color="bg" />
			</div>
			<input type="checkbox" {name} bind:group={selection} {value} />
			{display}
		</label>
	{/each}
</fieldset>

<style>
	fieldset {
		display: flex;
		border: none;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		flex-wrap: wrap;
	}
	label {
		background-color: transparent;
		padding: 0.25rem 1rem;
		border-radius: 10000px;

		border: var(--border-width) solid var(--fg);

		cursor: pointer;

		display: flex;
		align-items: center;
		gap: 0;

		transition: all 0.25s ease;
	}

	label[aria-checked='true'] {
		background-color: var(--fg);
		color: var(--bg);

		gap: 0.5rem;
	}

	.icon {
		height: 1em;

		transition: all 0.25s ease;
	}

	.icon[aria-hidden='true'] {
		transform: scale(0);
		width: 0;
		opacity: 0;
	}

	input {
		display: none;
	}
</style>
