<script lang="ts">
  export let href: string | undefined = undefined;
  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let disabled = false;
  export let loading = false;
  export let smaller: boolean = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {href}
  class="button-primary typo-big-button"
  class:smaller
  class:loading
  disabled={disabled || loading}
  on:click
  {type}
  {...$$restProps}
>
  <slot />
</svelte:element>

<style>
  .button-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;

    background: var(--primary-bg);
    color: var(--primary-text);
    --fg: var(--primary-text);

    border: none;
    border-radius: 1000px;

    cursor: pointer;
  }

  .button-primary.smaller {
    padding: 0.75rem 1.5rem;
  }

  :global(.icon) {
    height: 2em;
    margin-right: 0.5em;
  }

  .smaller :global(.icon) {
    height: 1.2em;
  }

  .button-primary:hover,
  .button-primary:focus {
    background: var(--primary-hover-bg); 
	color: var(--primary-hover-text);
	--fg: var(--primary-hover-text);
  }
</style>
