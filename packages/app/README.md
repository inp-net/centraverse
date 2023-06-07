# @centraverse/app

This package contains the application of Centraverse. It's a [Progressive Web App](https://en.wikipedia.org/wiki/Progressive_web_app) written in written in [TypeScript](https://www.typescriptlang.org/) and [Svelte](https://svelte.dev/) with [SvelteKit](https://kit.svelte.dev/).

You should read [the API's readme](../api/README.md) first.

## Overview of the technologies used

### Svelte

[Svelte](https://svelte.dev/) is a language that allows creating _declarative_ interfaces. You set variables and you let Svelte update the DOM for you.

Here is what the classic "todo" exercise looks like in Svelte:

```svelte
<script lang="ts">
  // Define some variables
  let value = '';
  let items = ['Learn JS', 'Learn Svelte'];
</script>

<h1>Todo</h1>
<ul>
  <!-- Loop over `items` -->
  {#each items as item, i}
    <li>
      {item}
      <button
        on:click={() => {
          // Changing `items` will update the interface
          items = [...items.slice(0, i), ...items.slice(i + 1)];
        }}
        >❌
      </button>
    </li>
  {/each}
</ul>

<!-- Event listeners can have modifiers -->
<form
  on:submit|preventDefault={() => {
    items = [...items, value];
    value = '';
  }}
>
  <label>
    <!-- Bind `value` to the value of the input -->
    New item: <InputText  bind:value />
    <button type="submit">➕</button>
  </label>
</form>
```

[Edit in the REPL](https://svelte.dev/repl/c38a20bc332a40a6b308f8a34b3862a8?version=3.51.0)

### SvelteKit

[SvelteKit](https://kit.svelte.dev/) is a framework that allows building web applications with Svelte. It handles routing, hydration, server-side rendering, and more.

**+page.ts** is in charge of providing data to the page:

```ts
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    items: ['Learn JS', 'Learn Svelte'],
  };
};
```

**+page.svelte** is in charge of displaying the page:

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<ul>
  {#each data.items as item}
    <li>{item}</li>
  {/each}
</ul>
```

### GraphQL Zeus

[GraphQL Zeus](https://zeus.graphqleditor.com/) is like Prisma for the frontend: it writes GraphQL queries out of JavaScript objects, and produces the proper return types.
