<script lang="ts">
	import { afterUpdate, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// the list of items  the user can select from
	export let items: string[] = [];

	// field of each item that's used for the labels in the list
	// events
	// Behaviour properties
	export let selectFirstIfEmpty = false;

	// true to close the dropdown when the component loses focus
	export let closeOnBlur = false;

	// UI properties
	// the text displayed when no option is selected
	export let placeholder: string = '';

	// apply a id to the input control
	export let id: string | undefined = undefined;
	// generate an HTML input with this name
	export let name: string | undefined = undefined;

	// selected item state
	export let selected: string | undefined = undefined;
	export let value = undefined;
	export let highlightIndex: number = 0;

	// --- Internal State ----
	const uniqueId = 'sautocomplete-' + Math.floor(Math.random() * 1000);

	// HTML elements
	let input: HTMLInputElement;
	let list: HTMLUListElement;
	export let inputContainer: HTMLDivElement;

	// UI state
	let opened = false;
	export let loading = false;
	export let text: string | number = '';

	// requests/responses counters

	let setPositionOnNextUpdate = false;

	// --- Lifecycle events ---

	afterUpdate(() => {
		if (setPositionOnNextUpdate) {
			setScrollAwareListPosition();
		}
		setPositionOnNextUpdate = false;
	});

	// -- Reactivity --
	function onSelectedItemChanged() {
		value = selected;
		if (selected) {
			text = selected;
		}

		dispatch('change', selected);
		dispatch('select', selected);
	}

	$: selected, onSelectedItemChanged();

	$: if (text === '') {
		selected = undefined;
	}

	$: showList = opened && items && items.length > 0;

	// $: text, search();
	function selectHighlighted() {
		selected = undefined; // triggers change even if the the same item is selected
		selected = items[highlightIndex];
		dispatch('select', selected);
		close();
	}

	function up() {
		open();
		if (highlightIndex > 0) {
			highlightIndex--;
		}
		highlight();
	}

	function down() {
		open();
		if (highlightIndex < items.length - 1) {
			highlightIndex++;
		}

		highlight();
	}

	function highlight() {
		const query = '.selected';
		const el = list && list.querySelector(query);
		if (el) {
			if (typeof el.scrollIntoViewIfNeeded === 'function') {
				el.scrollIntoViewIfNeeded();
			} else if (el.scrollIntoView === 'function') {
				el.scrollIntoView();
			}
		}
	}

	function onDocumentClick(e: Event) {
		if (e.composedPath().some((path) => path?.dataset?.suggestionsId === uniqueId)) {
			highlight();
			if (e.target.tagName === 'LI') {
				selectHighlighted();
			}
		} else {
			close();
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		let key = e.key;
		if (key === 'Tab' && e.shiftKey) key = 'ShiftTab';
		switch (key) {
			case 'Tab':
			case 'ShiftTab':
				if (opened) close();
				break;
			case 'ArrowDown':
				down();
				break;
			case 'ArrowUp':
				up();
				break;
			case 'Escape':
				onEsc(e);
				break;
			default:
				break;
		}
	}

	function onKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onEnter(e);
		}
	}

	function onEnter(e: KeyboardEvent) {
		if (opened) {
			e.preventDefault();
			selectHighlighted();
		}
	}

	function onEsc(e: KeyboardEvent) {
		//if (text) return clear();
		e.stopPropagation();
		if (opened) {
			input.focus();
			close();
		}
	}

	function onFocusInternal() {
		dispatch('focus');

		resetListToAllItemsAndOpen();
	}

	function onBlurInternal() {
		if (closeOnBlur) {
			close();
		}

		dispatch('blur');
	}

	function resetListToAllItemsAndOpen() {
		open();

		// find selected item
		if (selected) {
			highlightIndex = items.findIndex((i) => i === selected);
			highlight();
		}
	}

	function open() {
		setPositionOnNextUpdate = true;
		opened = true;
	}

	function close() {
		opened = false;
		loading = false;

		if (!text && selectFirstIfEmpty) {
			highlightIndex = 0;
			selectHighlighted();
		}
		dispatch('close-suggestions');
	}

	function setScrollAwareListPosition() {
		const { height: viewPortHeight } = window.visualViewport;
		const { bottom: inputButtom, height: inputHeight } = inputContainer.getBoundingClientRect();
		const { height: listHeight } = list.getBoundingClientRect();

		if (inputButtom + listHeight > viewPortHeight) {
			list.style.top = `-${listHeight}px`;
		} else {
			list.style.top = `${inputHeight}px`;
		}
	}
</script>

<input
	class:hide-arrow={!items.length}
	class:is-loading={loading}
	type="text"
	{id}
	{placeholder}
	{name}
	autocomplete="off"
	required
	bind:this={input}
	bind:value={text}
	on:input={(e) => {
		opened = true;
		dispatch('input', e);
	}}
	on:focus={onFocusInternal}
	on:blur={onBlurInternal}
	on:keydown={onKeyDown}
	on:keypress={onKeyPress}
	data-suggestions-id={uniqueId}
	{...$$restProps}
/>

<ul
	class="autocomplete-list {showList ? '' : 'hidden'}
    is-fullwidth"
	bind:this={list}
	data-suggetions-id={uniqueId}
>
	{#if items && items.length > 0}
		{#each items as item, i}
			<li
				class="autocomplete-list-item"
				class:highlighted={highlightIndex === i}
				class:selected={selected === item}
				on:click={() => {
					selected = item;
					close();
				}}
				on:keypress={(e) => {
					if (e.key === 'Enter') {
						selected = item;
						close();
					}
				}}
				on:pointerenter={() => {
					highlightIndex = i;
				}}
			>
				{item}
			</li>
		{/each}
	{:else if loading}
		<div class="autocomplete-list-item-loading">Chargement…</div>
	{:else}
		<div class="autocomplete-list-item-no-results">Aucun résultat.</div>
	{/if}
</ul>

<svelte:window on:click={onDocumentClick} on:scroll={() => (setPositionOnNextUpdate = true)} />

<style>
	.autocomplete-list {
		background: var(--bg);
		position: absolute;
		width: 100%;
		overflow-y: auto;
		z-index: 10000;
		top: 0;
		left: calc(-1 * var(--border-width));
		border: var(--border-width) solid var(--fg);
		max-height: calc(15 * (1rem + 10px) + 15px);
		list-style: none;
		user-select: none;
		padding: 0;
	}
	.autocomplete-list:empty {
		padding: 0;
	}
	.autocomplete-list-item {
		padding: 0.5em 1em;
		color: var(--fg);
		cursor: pointer;
		line-height: 1;
	}

	.autocomplete-list-item.highlighted {
		background-color: var(--ice);
	}
	.autocomplete-list-item.selected {
		background-color: var(--sky);
		color: #fff;
	}
	.autocomplete-list-item-no-results {
		padding: 5px 15px;
		color: var(--muted);
		line-height: 1;
	}
	.autocomplete-list-item-loading {
		padding: 5px 15px;
		line-height: 1;
	}

	.autocomplete-list.hidden {
		visibility: hidden;
		height: 0;
	}

	input {
		border: none;
		-moz-appearance: textfield;
		appearance: textfield;
		width: 100%;
		background: inherit;
		outline: none;
	}
</style>
