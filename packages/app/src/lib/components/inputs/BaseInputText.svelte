<script lang="ts">
  import { SvelteComponent, createEventDispatcher, onMount } from 'svelte';
  import InputWithSuggestions from './InputWithSuggestions.svelte';
  import MajesticonsUndoLine from '~icons/majesticons/undo-line';
  import type { ZodSchema } from 'zod';
  const emit = createEventDispatcher();

  export let type: HTMLInputElement['type'];
  export let value: string | number | Date | null | undefined;
  export let autocomplete: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let initial: string | number | Date | null | undefined = undefined;
  export let leftIcon: typeof SvelteComponent | undefined = undefined;
  export let unit: string = '';
  export let placeholder: string = '';
  export let actionIcon: typeof SvelteComponent | undefined = undefined;
  export let suggestions: string[] | undefined = undefined;
  export let required: boolean = false;
  export let schema: ZodSchema;
  export let closeKeyboardOnEnter: boolean = false;

  let showEmptyErrors: boolean = false;
  let valueString: string =
    type === 'date' && value instanceof Date
      ? value?.toISOString()?.split('T')[0]
      : value?.toString() ?? '';
  $: {
    switch (type) {
      case 'number':
        value = +valueString.replace(',', '.');
        break;
      case 'date':
        value = new Date(valueString);
        if (!value.valueOf()) {
          value = null;
          valueString = '';
        }
        break;
      default:
        value = valueString;
    }
  }

  export let errorMessage: string = '';
  let _errorMessage: string = '';
  export let messageIsWarning: boolean = false;
  $: {
    if (valueString === '' && !showEmptyErrors) {
      _errorMessage = '';
    } else if (errorMessage !== '') {
      _errorMessage = errorMessage;
    } else {
      if (valueString === '' && showEmptyErrors && required) {
        _errorMessage = 'Ce champ est requis';
      } else {
        // Validate string conversion first
        if (type === 'number' && valueString === '' && required) {
          _errorMessage = 'Ce champ doit être un nombre';
        } else {
          if (type === 'date' && value === null) {
            _errorMessage = '';
          } else {
            let parseResult = schema.safeParse(value);
            _errorMessage = parseResult.success
              ? ''
              : parseResult.error.issues.map((e) => e.message).join(', ');
          }
        }
      }
    }
  }

  let errored = false;
  $: errored = _errorMessage !== '';

  let resettable = false;
  $: resettable = typeof initial !== 'undefined' && value !== initial;

  let focused = false;

  let inputContainer: HTMLDivElement;

  onMount(() => {
    inputContainer
      .closest('form')
      ?.querySelector('button[type=submit]')
      ?.addEventListener('click', () => {
        showEmptyErrors = true;
      });
  });
</script>

<div
  class="wrapper base-input typo-paragraph"
  class:errored
  class:focused
  style:--intense="var(--{messageIsWarning ? 'safran' : 'blood'})"
  style:--pale="var(--{messageIsWarning ? 'plaster' : 'rose'})"
>
  <div class="input-area" bind:this={inputContainer}>
    {#if leftIcon}
      <div class="left-icon">
        <svelte:component this={leftIcon} />
      </div>
    {/if}
    {#if suggestions}
      <InputWithSuggestions
        on:close-suggestions
        on:select
        on:input
        {inputContainer}
        {autocomplete}
        items={suggestions}
        {id}
        {required}
        {name}
        bind:text={valueString}
        {placeholder}
        on:keypress={(e) => {
          if (e.key === 'Enter' && closeKeyboardOnEnter) {
            e.target.blur();
          }
        }}
        on:focus={() => (focused = true)}
        on:blur={() => (focused = false)}
        on:input={(e) => {
          if (valueString !== '') showEmptyErrors = true;
          emit('input', e);
        }}
      />
    {:else}
      <input
        on:keyup
        on:keypress={(e) => {
          if (e.key === 'Enter' && closeKeyboardOnEnter) {
            e.target.blur();
          }
        }}
        {type}
        {name}
        value={valueString}
        {required}
        {autocomplete}
        {placeholder}
        on:input={(e) => {
          valueString = e.target?.value;
          if (valueString === undefined) valueString = '';
          if (valueString !== '') showEmptyErrors = true;
          emit('input', e);
        }}
        on:focus={() => (focused = true)}
        on:blur={() => (focused = false)}
      />
    {/if}
    {#if actionIcon}
      <button type="button" class="action" on:click={() => emit('action')}>
        <svelte:component this={actionIcon} />
      </button>
    {/if}
    {#if resettable}
      <button
        type="button"
        class="reset"
        on:click|stopPropagation={() => {
          value = initial;
          valueString =
            type === 'date' && value instanceof Date
              ? value?.toISOString()?.split('T')[0]
              : value?.toString() ?? '';
        }}
      >
        <MajesticonsUndoLine />
      </button>
    {:else}
      <span class="unit">{unit}</span>
    {/if}
  </div>
  {#if errored}
    <div class="error-area">
      <p class="typo-details error-message">{_errorMessage}</p>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    border: var(--border-block) solid var(--border);
    display: flex;
    flex-direction: column;
  }

  .wrapper > div {
    padding: 0.5rem 0.75rem;
  }

  .input-area {
    display: flex;
    align-items: center;
    position: relative;
  }

  input {
    border: none;
    -moz-appearance: textfield;
    appearance: textfield;
    width: 100%;
    outline: none;
    background-color: var(--bg);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }

  button.reset,
  button.action {
    background-color: transparent;
    border: none;
    padding: 0;
    width: 1.5rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .left-icon {
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
  }

  .unit {
    color: var(--sky);
  }

  /** Focused */
  .wrapper:hover,
  .wrapper.focused {
    border-color: var(--sky);
  }

  .wrapper.focused,
  .wrapper.focused input {
    outline: none;
    background: var(--ice);
  }

  /** Errored */
  .wrapper.errored {
    border-color: var(--intense);
  }

  .wrapper.errored .unit {
    color: var(--intense);
  }
  .error-area {
    background-color: var(--intense);
  }
  .error-area p {
    color: #fff;
  }

  /** Both */
  .wrapper.errored.focused,
  .wrapper.errored.focused input {
    background-color: var(--pale);
  }
</style>
