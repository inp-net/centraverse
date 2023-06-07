<script lang="ts">
	import ButtonCircle from './ButtonCircle.svelte';
	import Icon from './Icon.svelte';
	import SortableList from './SortableList.svelte';
	import { tooltip } from '../../tooltip';
	import type { Photo } from './types';
	import { photoURL } from './photos';
	import { getDataURL } from './utils';

	export let name: string | undefined = undefined;
	export let sizeLimit: number = 0; // in bytes
	export let appartmentId: string;
	export let value: Photo[] = [];
	export let previewURLs: Record<string, string> = Object.fromEntries(
		value.map((v) => [v.filename, photoURL(v)])
	);
	export let fileObjects: Record<string, File> = Object.fromEntries(
		value.map((v) => [
			v.filename,
			new File([], v.filename, {
				type: v.contentType
			})
		])
	);
	let empty: boolean;
	let dragging: boolean = false;
	let draggingOverDropzone: boolean = false;
	let inputDom: HTMLInputElement;

	function updateDOM(target: HTMLInputElement, fileObjects: Record<string, File>) {
		if (!target) return;
		target.files = fileListOf(Object.values(fileObjects));
	}

	$: empty = value.length === 0;
	$: updateDOM(inputDom, fileObjects);

	function fileListOf(files: File[]): FileList {
		const filelist = new DataTransfer();
		files.forEach((file) => filelist.items.add(file));
		return filelist.files;
	}

	async function addPhotos(files: FileList) {
		value = [
			...value,
			...(
				await Promise.all(
					[...files].map(async (file) => {
						const photo = {
							appartmentId,
							contentType: file.type,
							filename: file.name
						};

						if (value.some((v) => v.filename === photo.filename)) {
							return null;
						}

						if (!Object.keys(previewURLs).some((k) => k === photo.filename)) {
							previewURLs[photo.filename] = await getDataURL(file);
						}

						if (!Object.keys(fileObjects).some((k) => k === photo.filename)) {
							fileObjects[photo.filename] = file;
						}

						return photo;
					})
				)
			).filter((v) => v !== null)
		];
	}

	async function deletePhoto(photo: Photo) {
		value = value.filter((p) => p.filename !== photo.filename);
		delete previewURLs[photo.filename];
		delete fileObjects[photo.filename];
		updateDOM(inputDom, fileObjects);
	}
</script>

<!-- TODO styles when dragging file -->

<label
	class="dropzone"
	class:empty
	class:dragging
	class:dragging-over-dropzone={draggingOverDropzone}
>
	<input
		type="file"
		multiple
		{name}
		bind:this={inputDom}
		on:change={(e) => {
			addPhotos(e.target.files);
		}}
		accept="image/*"
	/>

	<input
		type="hidden"
		name="{name}Order"
		value={JSON.stringify(value.map((photo) => photo.filename))}
	/>

	{#if empty}
		<p>
			Cliquez dans cette zone ou <br />
			Glissez-déposer vos fichiers ici
		</p>
	{:else}
		<SortableList bind:list={value} key="filename" let:item={photo} let:index>
			<li class="image-item">
				<button
					type="button"
					class="drag"
					use:tooltip={'Glissez pour réordonner les images'}
				>
					<Icon name="drag-handle" />
				</button>
				<span class="position">{index + 1}</span>
				<img src={previewURLs[photo.filename]} />
				<span class="name typo-paragraph">
					{photo.filename}
				</span>
				<ButtonCircle on:click={() => deletePhoto(photo)} icon="delete" />
			</li>
		</SortableList>
	{/if}
	<div class="icon">
		<svg
			width="133"
			height="158"
			viewBox="0 0 133 158"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M29.5 100.21H5.5V5.71045H127.5V100.21H110"
				stroke="var(--fg)"
				stroke-width="10"
			/>
			<path
				d="M66.5 157.29L66.5 42.1953M66.5 42.1953L101.5 77.5576M66.5 42.1953L31.5 77.5576"
				stroke="var(--fg)"
				stroke-width="10"
			/>
		</svg>
	</div>
</label>

{#if sizeLimit > 0}
	<div class="warning-size-limit">
		<span class="icon">
			<Icon name="password-strength-weak" />
		</span>
		Les photos doivent peser moins de {sizeLimit < 1e6
			? sizeLimit / 1e3 + 'ko'
			: sizeLimit / 1e6 + 'Mo'}.
	</div>
{/if}

<style>
	.dropzone {
		min-height: 10rem;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
	}

	.icon {
		transition: all 0.25s ease;
	}

	.dropzone.empty {
		border: var(--border-width) dashed var(--fg);
		text-align: center;
	}

	.warning-size-limit .icon {
		height: 1.75em;
	}

	.dropzone.empty .icon {
		height: 3rem;
	}

	.dropzone:not(.empty) {
		border: var(--border-width) solid var(--fg);
	}

	input {
		height: 100%;
		width: 100%;
		position: absolute;
		overflow: hidden;
		opacity: 0;
		cursor: pointer;
	}


	.icon svg {
		height: 100%;
		width: 100%;
	}

	.image-item {
		display: grid;
		grid-template-columns: 2rem 2rem 5rem auto 3rem;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		z-index: 10;
		width: 100%;
		padding: 0.5rem;
		/* margin-bottom: 1rem; */
	}

	.image-item .position {
		font-size: 1.5rem;
		font-weight: bold;
		text-align: center;
	}

	.image-item span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.image-item img {
		height: 4rem;
		width: 5rem;
		object-fit: cover;
		border-radius: 0.75rem;
		border: var(--border-width) solid var(--fg);
	}

	.image-item button.drag {
		border: none;
		background-color: transparent;
		height: 2rem;
		width: 2rem;
		cursor: grab;
	}

	.dropzone:not(.empty) .icon {
		height: 2rem;
	}

	/** Dragging somewhere */
	.dropzone.dragging {
		border-style: solid;
	}

	.dropzone.dragging-over-dropzone {
		border-color: var(--sky);
	}

	.warning-size-limit {
		margin-top: 0.5rem;
		gap: 0.25em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
