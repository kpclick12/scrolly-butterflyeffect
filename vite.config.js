import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves this as a project site under /scrolly-butterflyeffect/.
  // `vite preview` resolves with command === 'serve', so isPreview is
  // checked too — otherwise the previewed build's baked-in absolute
  // asset paths (from the build-time base) 404 against a preview server
  // rooted at '/'.
  base: command === 'build' || isPreview ? '/scrolly-butterflyeffect/' : '/',
  plugins: [svelte()],
}))
