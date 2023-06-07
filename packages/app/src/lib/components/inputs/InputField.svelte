<script lang="ts">
	import { tooltip } from '../../tooltip';

	export let label: string;
	export let id: string | null = null;
	export let required: boolean = false;
</script>

<div class="field">
	<svelte:element this={id === null ? 'p' : 'label'} for={id}
		><span class="label typo-field-label"
			>{label}{#if required}
				<span use:tooltip={'Ce champ est requis'} class="required-indicator">*</span>
			{/if}</span
		>
	</svelte:element>
	<slot />
</div>

<style>
	.field {
		flex-grow: 1;
	}

	.label {
		display: inline-flex;
		justify-content: center;
		margin-bottom: 0.25rem;
	}

	.required-indicator {
		color: var(--sky);
		margin-left: 0.125rem;
		transform: scale(1.2) translateY(0.1em);
	}
</style>
