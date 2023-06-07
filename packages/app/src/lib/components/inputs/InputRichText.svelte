<script lang="ts">
	import type { LexicalEditor } from 'lexical';
	import lexical from 'lexical';
	const { createEditor } = lexical;
	import { onMount } from 'svelte';
	import InputRichTextToolbar from './InputRichTextToolbar.svelte';
	import { registerRichText } from '@lexical/rich-text';
	import { registerMarkdownShortcuts } from '@lexical/markdown';
	import lexicalHTML from '@lexical/html';
	import lexicalList from '@lexical/list';
	const { ListNode, ListItemNode } = lexicalList;
	import lexicalLink from '@lexical/link';
	const { LinkNode, AutoLinkNode } = lexicalLink;
	import { browser } from '$app/environment';

	const editor: LexicalEditor = createEditor({
		namespace: 'editor',
		nodes: [LinkNode, AutoLinkNode, ListNode, ListItemNode],
		onError: console.error,
		editable: true
	});

	onMount(() => {
		editor.setRootElement(domEditor);
		registerRichText(editor);
		editor.update(() => {
			const root = lexical['$getRoot']();
			let nodes = lexicalHTML['$generateNodesFromDOM'](
				editor,
				new DOMParser().parseFromString(value, 'text/html')
			);
			nodes.forEach((node) => {
				root.append(node);
			});
		});
		editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				value = lexicalHTML['$generateHtmlFromNodes'](editor, null);
			});
		});
	});

	let domEditor: HTMLElement;
	export let placeholder: string = '';
	export let name: string | undefined = undefined;
	export let value: string = '';
</script>

<div class="wrapper">
	<InputRichTextToolbar {editor} />
	<div class="editor" bind:this={domEditor} contenteditable="true" />
	<input type="hidden" {name} {value} />
</div>

<style>
	.wrapper {
		width: 100%;
		border: var(--border-width) solid var(--fg);
	}

	.editor {
		padding: 0.75rem;
		height: 400px;
		overflow: scroll;
	}
</style>
