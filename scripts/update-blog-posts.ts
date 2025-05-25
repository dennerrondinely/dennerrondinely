import * as fs from 'fs';
import fetch from 'node-fetch';

interface BlogPost {
  title: string;
  url: string;
}

const README_PATH = 'README.md';
const API_URL = 'https://www.dennerrondinely.dev/api/posts';
const START_MARKER = '<!-- BLOG-POSTS:START -->';
const END_MARKER = '<!-- BLOG-POSTS:END -->';

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.statusText}`);
  }
  return (await res.json()) as BlogPost[];
}

function generateMarkdown(posts: BlogPost[]): string {
  return posts
    .map((post) => `- [${post.title}](${post.url})`)
    .join('\n');
}

async function updateReadme() {
  const posts = await fetchBlogPosts();
  const markdown = generateMarkdown(posts);

  const readme = fs.readFileSync(README_PATH, 'utf-8');
  const updated = readme.replace(
    new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'g'),
    `${START_MARKER}\n${markdown}\n${END_MARKER}`
  );

  fs.writeFileSync(README_PATH, updated);
  console.log('✅ README.md updated with latest blog posts');
}

updateReadme().catch((err) => {
  console.error(err);
  process.exit(1);
});
