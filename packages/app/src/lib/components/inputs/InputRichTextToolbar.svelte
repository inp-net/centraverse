<script lang="ts">
	import ButtonSecondary from './ButtonSecondary.svelte';
	import type { LexicalEditor } from 'lexical';
	import { createEditor, FORMAT_TEXT_COMMAND, UNDO_COMMAND } from 'lexical';
	import { INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
	import InputText from './InputText.svelte';
	import ButtonCircle from './ButtonCircle.svelte';

	export let editor: LexicalEditor;

	let addingLink: boolean = false;
	let currentLinkUrl: string = '';
	let currentLinkName: string = '';

	let blockType = 'paragraph';

	function openLinkEditor() {
		addingLink = true;
	}

	const format = (value: TextFormatType) => () => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, value);
		editor.focus();
	};

	const bulletList = () => {
		if (blockType === 'paragraph') {
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
		}
		editor.focus();
	};
</script>

<div class="toolbar">
	<ul class="row-1">
		<li>
			<ButtonSecondary on:click={format('bold')}>G</ButtonSecondary>
		</li>
		<li>
			<ButtonSecondary on:click={format('italic')}>I</ButtonSecondary>
		</li>
		<!-- <li>
			<ButtonSecondary on:click={bulletList} icon="editor-list">liste</ButtonSecondary>
		</li>
		<li>
			<ButtonSecondary on:click={openLinkEditor} icon="editor-link">lien</ButtonSecondary>
		</li> -->
	</ul>

	{#if addingLink}
		<ul class="row-2">
			<li>
				<InputText placeholder="Texte du lien" bind:value={currentLinkName} />
			</li>
			<li>
				<InputText placeholder="Addresse" bind:value={currentLinkUrl} />
			</li>
			<li>
				<ButtonCircle icon="add" />
			</li>
		</ul>
	{/if}
</div>

<style>
	.toolbar {
		border-bottom: var(--border-width) solid var(--fg);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.row-1,
	.row-2 {
		padding: 0;
		background: var(--bg);
		display: flex;
		list-style: none;
		gap: 0.5rem;
		align-items: center;
	}
</style>
