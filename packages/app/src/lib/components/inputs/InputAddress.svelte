<script lang="ts">
	import BaseInputText from './BaseInputText.svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { distanceBetween, ENSEEIHT } from './utils';
	import { throttle } from 'lodash-es';
	import { z } from 'zod';

	export let value: string;
	export let latitude: number | null = null;
	export let longitude: number | null = null;
	export let id: string = `input-address-${uuidv4()}`;
	export let name: string | undefined = undefined;
	export let initial: string | undefined = undefined;
	export let placeholder: string = '';
	export let required: boolean = false;
	export let showEmptyErrors: boolean = true;
	export let schema: Zod.ZodString = z.string();

	let messageIsWarning = false;
	let errorMessage: string = '';
	let suggestions: string[] = [];
	let results: object[] = [];

	let distanceToN7: number | null = null;
	$: distanceToN7 =
		latitude && longitude ? distanceBetween({ latitude, longitude }, ENSEEIHT) : null;

	async function updateSuggestions() {
		if (value.length <= 3) {
			results = [];
			return;
		}
		const response = await (
			await fetch(
				`https://api-adresse.data.gouv.fr/search/?q=${value}&lat=${ENSEEIHT.latitude}&lon=${ENSEEIHT.longitude}`
			)
		).json();

		results = response.features.filter(({ properties: { type } }) =>
			['housenumber', 'street'].includes(type)
		);

		// if (results.length === 1) {
		// 	[latitude, longitude] = results[0].geometry.coordinates;
		// }
	}

	$: suggestions = results.map(
		({ properties: { name, postcode, city } }) => `${name}, ${postcode} ${city}`
	);

	$: if (value === '') {
		latitude = null;
		longitude = null;
	}

	$: if (showEmptyErrors && required && !value) {
		errorMessage = 'Ce champ est requis';
		messageIsWarning = false;
	} else if (distanceToN7 !== null && distanceToN7 > 20e3) {
		errorMessage = `L'adresse saisie est très loin de l'ENSEEIHT. Vérifiez l'adresse saisie.`;
		messageIsWarning = true;
	} else {
		errorMessage = '';
	}
</script>

<BaseInputText
	{required}
	{suggestions}
	{placeholder}
	type="text"
	unit={distanceToN7 !== null ? (distanceToN7 * 1e-3).toFixed(2) + 'km' : ''}
	bind:value
	autocomplete="off"
	{id}
	{name}
	{initial}
	{schema}
	{errorMessage}
	{messageIsWarning}
	on:input={throttle(updateSuggestions, 200)}
	on:select={(e) => {
		if (e.detail === null) {
			[latitude, longitude] = [null, null];
			return;
		}
		[latitude, longitude] =
			results[suggestions.findIndex((a) => a === e.detail)]?.geometry.coordinates;
	}}
/>

<input type="hidden" name="{name}Latitude" value={latitude} />
<input type="hidden" name="{name}Longitude" value={longitude} />
