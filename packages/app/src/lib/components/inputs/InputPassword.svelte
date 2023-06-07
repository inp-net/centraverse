<script lang="ts">
	import BaseInputText from './BaseInputText.svelte';
	import zxcvbn from 'zxcvbn';
	import InputField from './InputField.svelte';
	import IconEye from "~icons/majesticons/eye-line";
	import IconEyeOff from "~icons/majesticons/eye-off-line";
	import { durationDisplay } from '../../utils';
	import { z } from 'zod';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { tooltip } from '../../tooltip';

	export let value: string = "";
	export let placeholder: string = '';
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let shown = false;
	export let label: string;
	export let feedback: boolean = false;
	export let required: boolean = false;
	export let schema: Zod.ZodString = z.string();
	export let showEmptyErrors = true;
	export let errorMessage: string | undefined = undefined;
	export let userInputs: string[] = [];

	let analysis;
	let strength: 'dangerous' | 'weak' | 'good';
	let crackTimeDisplay: string;

	let currentPage: string = '';

	onMount(() => {
		if (browser) {
			currentPage = window.location.pathname + window.location.search + window.location.hash;
		}
	});

	$: analysis = zxcvbn(value, userInputs);
	$: strength = analysis.score <= 1 ? 'dangerous' : analysis.score <= 2 ? 'weak' : 'good';
	$: strengthDisplay = {
		dangerous: 'dangereuse',
		weak: 'faible',
		good: 'suffisante'
	}[strength];
	$: crackTimeDisplay = durationDisplay(
		analysis.crack_times_seconds.offline_slow_hashing_1e4_per_second
	);
</script>

<div class="password-with-feedback">
	<InputField {required} {label}>
		<BaseInputText
			on:input
			on:action={() => (shown = !shown)}
			type={shown ? 'text' : 'password'}
			bind:value
			{placeholder}
			{required}
			{id}
			{name}
			{schema}
			{errorMessage}
			autocomplete={feedback ? 'new-password' : 'current-password'}
			actionIcon={shown ? IconEye : IconEyeOff}
		/>
	</InputField>

	{#if feedback}
		<div class="feedback" class:empty={value === ''}>
			<div class="strength">
				<span class="icon">
					<Icon name="password-strength-{strength}" />
				</span>
				<p class="typo-details">
					Complexité du mot de passe
					<span class="colored" data-strength={strength}>{strengthDisplay}</span>
				</p>
			</div>
			<div class="cracktime">
				<p class="typo-details">
					Pour trouver ce mot de passe, un hacker mettra <span
						class="colored"
						data-strength={strength}>{crackTimeDisplay}</span
					>
				</p>
				<a
					use:tooltip={'En savoir plus sur la complexité des mots de passe'}
					class="about"
					href="/à-propos/mots-de-passe?from={encodeURIComponent(currentPage)}"
				>
					<span class="icon">
						<Icon name="question" />
					</span>
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.colored[data-strength='dangerous'] {
		color: var(--blood);
	}

	.colored[data-strength='weak'] {
		color: var(--safran);
	}

	.colored[data-strength='good'] {
		color: var(--cactus);
	}

	.icon {
		display: inline-block;
		height: 1.5em;
		width: 1.5em;
	}

	.cracktime p {
		font-weight: 400;
	}

	.feedback {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
	}
	.feedback.empty {
		opacity: 0;
	}

	.feedback > div {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.cracktime {
		justify-content: space-between;
	}

	.feedback a {
		display: flex;
	}

	.cracktime .about {
		transition: opacity 250ms ease;
	}

	.cracktime .about:not(:hover):not(:focus) {
		opacity: 0.75;
	}
</style>
