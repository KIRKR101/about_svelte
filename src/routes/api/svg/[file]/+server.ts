import { json, error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
  const { file } = params;

  if (!file.endsWith('.svg')) {
    throw error(400, 'Not an SVG file');
  }

  try {
    const svgPath = path.join(process.cwd(), 'static', 'posts', file);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    return json({ content: svgContent });
  } catch (err) {
    throw error(404, 'SVG not found');
  }
}
