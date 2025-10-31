<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { marked } from 'marked';
  import footnote from 'marked-footnote';

  const { content } = $props();

  let parsedContent = $state('');

  const svgCache: Record<string, string> = {};

  const fetchSvg = async (fileName: string): Promise<string | null> => {
    if (svgCache[fileName]) {
      return svgCache[fileName];
    }
    try {
      const response = await fetch(`/api/svg/${fileName}`);
      if (response.ok) {
        const data = await response.json();
        const svgContent = data.content;
        svgCache[fileName] = svgContent;
        return svgContent;
      }
    } catch (error) {
      console.error('Error fetching SVG:', error);
    }
    return null;
  };

  onMount(async () => {
    const renderer = new marked.Renderer();
    const originalImage = renderer.image;

    renderer.image = ({ href, title, text }) => {
      if (typeof href === 'string' && href.startsWith('posts/') && href.endsWith('.svg')) {
        const fileName = href.replace('posts/', '');
        return `<div data-svg-file="${fileName}"></div>`;
      }
      const titleHtml = title ? ` title="${title}"` : '';
      return `<img src="${href || ''}" alt="${text}"${titleHtml}/>`;
    };

    marked.use(footnote());

    parsedContent = await marked(content, { renderer });

    await tick();

    const divs = document.querySelectorAll('[data-svg-file]');
    for (const div of divs) {
      const fileName = div.getAttribute('data-svg-file');
      if (fileName) {
        const svgContent = await fetchSvg(fileName);
        if (svgContent) {
          div.innerHTML = svgContent;
        }
      }
    }
  });
</script>

<div class="prose prose-invert max-w-none prose-sm sm:prose-base" style="font-family: 'SuisseIntl-Regular', system-ui, -apple-system, sans-serif;">
  {@html parsedContent}
</div>
