<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
</script>

<Meta title="Default styles" />

<Story name="Common elements">
  <h1>Heading level 1</h1>
  <h2>Heading level 2</h2>
  <h3>Heading level 3</h3>
  <h4>Heading level 4</h4>
  <h5>Heading level 5</h5>
  <h6>Heading level 6</h6>
  <p>
    <strong>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</strong>
    <em>Eaque quibusdam aut delectus facilis perferendis aspernatur consequatur sint.</em>
    <a href={'#'}>
      Nulla quibusdam quam mollitia assumenda dolorum molestias! Vitae deleniti inventore sequi est
      ducimus?
    </a>
  </p>
  <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias animi nobis in iusto debitis.
    Sapiente maxime alias, dignissimos facilis veritatis distinctio doloremque harum quaerat optio
    non laborum atque illum mollitia!
  </p>
</Story>

<Story name="Forms">
  <p>
    <label>Text: <InputText  value="value" /></label>
    <button type="button">Button</button>
  </p>
  <p>
    <label>Disabled: <InputText  value="value" disabled /></label>
    <button type="button" disabled>Button</button>
  </p>
  <p>
    <label>
      Textarea:
      <textarea cols="50" rows="8" class="block" />
    </label>
  </p>
</Story>
