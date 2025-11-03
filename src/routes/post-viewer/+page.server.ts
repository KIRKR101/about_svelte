import { error } from '@sveltejs/kit';

export const prerender = false;

export async function load({ fetch, url }) {
  const postName = url.searchParams.get('name');
  if (!postName) throw error(400, 'No post specified');

  const manifestRes = await fetch('/posts/manifest.json');
  if (!manifestRes.ok) throw error(404, 'Manifest not found');
  const manifest = await manifestRes.json();

  const postMeta = manifest.find((p: any) => p.file === postName);
  if (!postMeta) throw error(404, 'Post not found');

  const postRes = await fetch(`/posts/${postName}.md`);
  if (!postRes.ok) throw error(404, 'Post not found');
  const markdownContent = await postRes.text();

  return { meta: postMeta, content: markdownContent };
}
