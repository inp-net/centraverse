<script lang="ts">
	import Icon from './Icon.svelte';

	export let value: boolean;
</script>

<label class="input-checkbox">
	<input type="checkbox" bind:checked={value} on:change />
	<div class="checkbox">
		<Icon
			name={value ? 'checkmark' : 'close'}
			color="bg"
			strokeWidth="calc(var(--border-width) * 2)"
		/>
	</div>
</label>

<style>
	.input-checkbox {
		--size: 1.5rem;
	}
	input {
		display: none;
	}
	.checkbox {
		grid-area: box;
		display: inline-block;
		width: var(--size);
		height: var(--size);
		border: var(--border-width) solid var(--fg);
		position: relative;
	}
	/* input:not(:checked) + .checkbox {
		content: '';
		 width: var(--border-width);
		height: var(--size);
		transform: rotate(45deg);
		background: var(--fg);
		position: absolute;
		left: calc(var(--size) / 2 - var(--border-width) / 2); 
	} */
	input:checked + .checkbox {
		background: var(--fg);
	}
	label {
		cursor: pointer;
	}
</style>
