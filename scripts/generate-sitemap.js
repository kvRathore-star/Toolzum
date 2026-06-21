const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://gotoolhub.com';
const TOOLS_REGISTRY_PATH = path.join(__dirname, '../src/registry/tools.ts');
const PUBLIC_DIR = path.join(__dirname, '../public');

function parseToolsRegistry() {
  const content = fs.readFileSync(TOOLS_REGISTRY_PATH, 'utf-8');

  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  const categoryRegex = /category:\s*['"]([^'"]+)['"]/g;
  const nameRegex = /name:\s*['"]([^'"]+)['"]/g;

  const slugs = [];
  const categories = [];
  const names = [];

  let m;
  while ((m = slugRegex.exec(content)) !== null) slugs.push(m[1]);
  while ((m = categoryRegex.exec(content)) !== null) categories.push(m[1]);
  while ((m = nameRegex.exec(content)) !== null) names.push(m[1]);

  const tools = [];
  const count = Math.min(slugs.length, categories.length, names.length);

  for (let i = 0; i < count; i++) {
    tools.push({
      name: names[i],
      slug: slugs[i],
      category: categories[i],
    });
  }

  return tools;
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

function generateSitemap() {
  console.log('Generating sitemap from tools registry...');

  const tools = parseToolsRegistry();

  const seen = new Set();
  const uniqueTools = [];
  for (const tool of tools) {
    const key = tool.slug;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTools.push(tool);
    }
  }

  const staticPages = [
    '', 'about', 'ai-hub', 'api', 'blog', 'careers', 'changelog',
    'contact', 'dashboard', 'extension', 'pricing', 'privacy',
    'product', 'roadmap', 'status', 'terms', 'tools',
  ];

  const uniqueCategories = [...new Set(uniqueTools.map(t => slugify(t.category)))];

  const allUrls = [];

  // Static pages
  for (const page of staticPages) {
    allUrls.push({ loc: page ? `${BASE_URL}/${page}` : BASE_URL, changefreq: 'daily', priority: page === '' ? '1.0' : '0.8' });
  }

  // Category pages
  for (const category of uniqueCategories.sort()) {
    allUrls.push({ loc: `${BASE_URL}/${category}`, changefreq: 'weekly', priority: '0.7' });
  }

  // Tool pages
  for (const tool of uniqueTools) {
    const categorySlug = slugify(tool.category);
    allUrls.push({ loc: `${BASE_URL}/${categorySlug}/${tool.slug}`, changefreq: 'weekly', priority: '0.6' });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const lastmod = new Date().toISOString().split('T')[0];

  for (const url of allUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`Sitemap generated at ${outputPath} with ${allUrls.length} URLs`);
}

generateSitemap();
