<script lang="ts">
	import { marked } from 'marked';
	import footnote from 'marked-footnote';

	const { content } = $props();

	const renderer = new marked.Renderer();

	renderer.image = ({ href, title, text }) => {
		const titleHtml = title ? ` title="${title}"` : '';
		return `<img src="${href || ''}" alt="${text}"${titleHtml}/>`;
	};

	renderer.code = ({ text, lang }) => {
		if (lang === 'html') {
			return `<div class="html-block">${text}</div>`;
		}
		const langAttr = lang ? ` class="language-${lang}"` : '';
		return `<pre><code${langAttr}>${text}</code></pre>`;
	};

	marked.use(footnote());

	let parsedContent = marked(content, { renderer });
</script>

<div class="prose prose-invert prose-sm sm:prose-base max-w-none font-sans">
	{@html parsedContent}
</div>
