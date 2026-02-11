<script lang="ts">
  import { marked } from 'marked';
  import footnote from 'marked-footnote';

  const { content } = $props();

  const renderer = new marked.Renderer();

  renderer.image = ({ href, title, text }) => {
    const titleHtml = title ? ` title="${title}"` : '';
    return `<img src="${href || ''}" alt="${text}"${titleHtml}/>`;
  };

  marked.use(footnote());

  let parsedContent = marked(content, { renderer });
</script>

<div class="text-sans prose prose-invert max-w-none prose-sm sm:prose-base">
  {@html parsedContent}
</div>
