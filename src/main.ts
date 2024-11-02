import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initPaperJs } from "manga-renderer";

initPaperJs();

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app