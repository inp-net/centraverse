<script lang="ts">
	import { clamp } from '$lib/utils';
	import Icon from './Icon.svelte';

	export let contain: boolean = false;
	export let cover: boolean = false;
	export let images: string[];
	export let currentIndex: number = 0;

	let touchStart: { x: number; y: number } | null = null;

	function touchStartHandler(event: TouchEvent) {
		if (event.changedTouches.length === 1) {
			touchStart = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY };
		}
	}

	function touchEndHandler(event: TouchEvent) {
		if (!touchStart) return;
		const movement = touchStart.x - event.changedTouches[0].screenX;
		// threshold to prevent mis-swipes
		if (Math.abs(movement) < 10) return;
		currentIndex = clamp(currentIndex + Math.sign(movement), 0, images.length - 1);
	}
</script>

<div
	class="carousel"
	class:single-image={images.length === 1}
	on:touchstart={touchStartHandler}
	on:touchend={touchEndHandler}
>
	<div class="image-gradient-overlay" />
	<nav>
		<button
			aria-hidden={currentIndex <= 0}
			class="prev arrow"
			on:click={() => {
				currentIndex--;
			}}><Icon color="#fff" name="next" flip /></button
		>
		<ul class="dots" aria-hidden={images.length < 2}>
			{#each images as src, i}
				<li>
					<button
						aria-current={currentIndex === i}
						on:click={() => {
							currentIndex = i;
						}}
					/>
				</li>
			{/each}
		</ul>
		<button
			aria-hidden={currentIndex >= images.length - 1}
			class="next arrow"
			on:click={() => {
				currentIndex++;
			}}><Icon color="#fff" name="next" /></button
		>
	</nav>
	<ul class="images">
		{#each images as src, i}
			<li>
				<img
					style:object-fit={contain ? 'contain' : 'cover'}
					aria-hidden={currentIndex !== i}
					{src}
				/>
			</li>
		{/each}
	</ul>
</div>

<style>
	.carousel {
		position: relative;
		width: 100%;
		height: 100%;
	}

	ul {
		list-style: none;
	}

	.image-gradient-overlay {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 2;
		background: linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 20%),
			linear-gradient(-90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 20%),
			linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 20%);
	}

	.single-image .image-gradient-overlay {
		display: none;
	}

	img {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		object-position: center;
	}

	img[aria-hidden='true'] {
		display: none;
	}

	nav {
		display: flex;
		position: absolute;
		justify-content: space-between;
		align-items: center;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		z-index: 10;
		height: 100%;
		width: 100%;
	}

	nav button {
		cursor: pointer;
	}

	.dots {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: row;
		align-items: end;
		justify-content: center;
		gap: 1rem;
		height: 100%;
		transition: all 0.25s ease;
		margin-bottom: 2rem;
	}

	.dots button {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 10000px;
		background: #fff;
		border: none;
		transition: all 0.25s ease;
	}

	.dots button[aria-current='true'] {
		width: 2rem;
	}

	button.arrow {
		z-index: 10;
		height: 5rem;
		width: 5rem;
		background: transparent;
		border: none;
		transition: all 0.25s ease;
		height: 100%;
	}

	button.arrow[aria-hidden='true'],
	.dots[aria-hidden='true'] {
		opacity: 0;
		pointer-events: none;
	}

	.images {
		background-color: #000;
		height: 100%;
		padding-left: 0;
	}
</style>
