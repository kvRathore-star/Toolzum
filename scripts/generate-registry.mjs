/** Rebuilds registry chunk files from tool metadata. Run after adding/removing tools, before building. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const csvPath = path.join(rootDir, 'tools_list.csv');
const registryPath = path.join(rootDir, 'src', 'registry', 'tools.ts');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read CSV
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split('\n').filter(line => line.trim().length > 0);
const headers = lines[0].split(',').map(h => h.trim());

const tools = [];
for (let i = 1; i < lines.length; i++) {
  // Simple CSV parser handling quotes
  const line = lines[i];
  let inQuotes = false;
  let currentVal = '';
  const values = [];
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  values.push(currentVal.trim());
  
  if (values.length < headers.length) continue;
  
  const tool = {
    id: values[0],
    name: values[1],
    slug: values[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: values[2],
    description: values[3].replace(/^"|"$/g, ''), // Remove surrounding quotes
    monthlySearches: values[4].replace(/,/g, '').replace(/^"|"$/g, ''),
    opportunity: values[5],
    status: values[6],
    dependenciesRaw: values[7]
  };
  tools.push(tool);
}

// Generate Registry
fs.mkdirSync(path.join(rootDir, 'src', 'registry'), { recursive: true });

const registryContent = `// Automatically generated from tools_list.csv

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  dependencies: string;
}

export const toolsRegistry: ToolMetadata[] = [
${tools.map(t => `  {
    id: "${t.id}",
    name: "${t.name}",
    slug: "${t.slug}",
    category: "${t.category}",
    description: ${JSON.stringify(t.description)},
    dependencies: "${t.dependenciesRaw}"
  }`).join(',\n')}
];

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category);
`;

fs.writeFileSync(registryPath, registryContent);
console.log('Registry generated at src/registry/tools.ts');

// Update package.json
const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Intelligent mapping of CSV dependencies to actual NPM packages
const edgeCompatiblePackages = {
  "@capacitor/core": "^6.0.0",
  "@capacitor/ios": "^6.0.0",
  "@capacitor/android": "^6.0.0",
  "browser-image-compression": "^2.0.2",
  "fabric": "^5.3.0",
  "@ffmpeg/ffmpeg": "^0.12.10",
  "@ffmpeg/util": "^0.12.1",
  "date-fns": "^3.6.0",
  "heic2any": "^0.0.4",
  "pdfjs-dist": "^4.2.67",
  "pptxgenjs": "^3.12.0",
  "@tensorflow/tfjs": "^4.19.0",
  "qrcode": "^1.5.3",
  "xlsx": "^0.18.5",
  "jspdf": "^2.5.1",
  "react-cropper": "^2.3.3",
  "cropperjs": "^1.6.2",
  "diff-match-patch": "^1.0.5",
  "exifr": "^7.1.3",
  "piexifjs": "^1.0.6",
  "jsonlint-mod": "^1.6.1",
  "cheerio": "^1.0.0-rc.12",
  "papaparse": "^5.4.1",
  "zxcvbn": "^4.4.2",
  "terser": "^5.31.0",
  "gif.js.optimized": "^1.0.1",
  "ibantools": "^4.3.4",
  "mermaid": "^10.9.1",
  "reactflow": "^11.11.3",
  "sql-formatter": "^15.3.1",
  "uuid": "^9.0.1",
  "clean-css": "^5.3.3",
  "marked": "^12.0.2",
  "crypto-js": "^4.2.0",
  "html-minifier-terser": "^7.2.0",
  "jsbarcode": "^3.11.6",
  "openpgp": "^5.11.1",
  "turndown": "^7.2.0",
  "xml2js": "^0.6.2",
  "svgo": "^3.3.2"
};

const devPackages = {
  "@capacitor/cli": "^6.0.0"
};

pkgData.dependencies = {
  ...pkgData.dependencies,
  ...edgeCompatiblePackages
};

pkgData.devDependencies = {
  ...pkgData.devDependencies,
  ...devPackages
};

// Sort dependencies alphabetically
pkgData.dependencies = Object.keys(pkgData.dependencies).sort().reduce((acc, key) => {
  acc[key] = pkgData.dependencies[key];
  return acc;
}, {});

pkgData.devDependencies = Object.keys(pkgData.devDependencies).sort().reduce((acc, key) => {
  acc[key] = pkgData.devDependencies[key];
  return acc;
}, {});

fs.writeFileSync(packageJsonPath, JSON.stringify(pkgData, null, 2) + '\n');
console.log('package.json updated with Edge/Capacitor dependencies.');
