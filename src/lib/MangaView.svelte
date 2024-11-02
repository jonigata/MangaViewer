<script lang="ts">
  import { onMount } from "svelte";
  import { readEnvelope, buildRenderer, Renderer, listFonts, isLocalFont, localFonts, loadGoogleFontForCanvas, type Book } from "manga-renderer";
  import AutoSizeCanvas from "./AutoSizeCanvas.svelte";
  import leftIcon from "../assets/left.png";
  import rightIcon from "../assets/right.png";
  import { Range } from 'flowbite-svelte';
  import { NumberInput } from 'flowbite-svelte';

  let canvas: HTMLCanvasElement;
  let renderer: Renderer;
  let pageIndex = 1;
  let min = 1;
  let max = 4;
  let book: Book;

  $: onRPageIndexChange(rPageIndex);
  function onRPageIndexChange(rPageIndex: number) {
    pageIndex = max - rPageIndex + 1;
  }
  $: rPageIndex = max - pageIndex + 1;

  $: onPageIndexChange(pageIndex);
  function onPageIndexChange(pageIndex: number) {
    if (!book) return;
    renderer = buildRenderer(canvas, book, pageIndex-1, 1);
    renderer.focusToPage(0, 0.98);
  }

  function onResize(e: CustomEvent) {
    // if (!layeredCanvas || !$viewport) { return; }
    // $viewport.dirty = true;
    // layeredCanvas.redraw();
  }

  function prev() {
    if (pageIndex > min) {
      pageIndex--;
    }
  }

  function next() {
    if (pageIndex < max) {
      pageIndex++;
    }
  }

  async function loadEnvelope() {
    try {
      const response = await fetch('/manga1.envelope');
      if (!response.ok) {
        throw new Error('Failed to fetch manga.envelope');
      }
      const fileContent = await response.blob();
      const book = await readEnvelope(fileContent);
      return book;
    } catch (error) {
      console.error('Error loading file:', error);
    }
  }

  onMount(async () => {
    book = (await loadEnvelope())!;
    max = book.pages.length;

    const fonts = listFonts(book);
    console.log(fonts);
    for (const font of fonts) {
      const {family, weight} = font

      if (isLocalFont(family)) {
        const localFile = localFonts[family];
        const url = `/fonts/${localFile}.woff2`;
        const font = new FontFace(family, `url(${url}) format('woff2')`, { style: 'normal', weight });
        document.fonts.add(font);
        await font.load();
      } else {
        console.log("loading google font", family, weight);
        await loadGoogleFontForCanvas(family, [weight]);
      }
    }

    renderer = buildRenderer(canvas, book, 0, 1);
    renderer.focusToPage(0, 0.98);
  });

</script>

<div class="w-full h-full flex flex-col">
  <div class="w-full h-full relative flex-grow">
    <AutoSizeCanvas bind:canvas={canvas} on:resize={onResize}>
      <!--
        {#if bubbleLayer?.defaultBubble}
        <p style={getFontStyle2(bubbleLayer.defaultBubble.fontFamily, "400")}>あ</p> <!- 事前読み込み、ローカルフォントだと多分エラー出る ->
        {/if}
      -->
    </AutoSizeCanvas>
    <button class="absolute left-1 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-lg" on:click={next}>
      <img src={leftIcon} alt="left"/>
    </button>
    <button class="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-lg" on:click={prev}>
      <img src={rightIcon} alt="right"/>
    </button>
  </div>
  <div class="pager w-full p-4 flex flex-row items-center">
    <Range id="range-minmax" min={min} max={max} bind:value={rPageIndex} class="mr-4" />
    <NumberInput min={min} max={max} bind:value={pageIndex} class="w-16 text-right"/>
  </div>
</div>
