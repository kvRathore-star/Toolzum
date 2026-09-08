// HISTORICAL one-off: codemod replacing hardcoded colors with CSS vars across tool modules.
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../src/components/tools/modules');
const files = fs.readdirSync(modulesDir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(modulesDir, f));

// Add specific other files that need theme refactoring
files.push(path.join(__dirname, '../src/app/page.tsx'));
files.push(path.join(__dirname, '../src/components/tools/ToolLayout.tsx'));

console.log(`Scanning and refactoring ${files.length} files...`);

const colorfulBgKeywords = [
  'bg-blue', 'bg-indigo', 'bg-emerald', 'bg-green', 'bg-red', 'bg-purple', 
  'bg-violet', 'bg-amber', 'bg-rose', 'bg-pink', 'bg-cyan', 'bg-teal',
  'from-blue', 'from-indigo', 'from-emerald', 'from-green', 'from-red', 'from-purple',
  'from-violet', 'from-amber', 'from-rose', 'from-pink', 'from-cyan', 'from-teal',
  'bg-gradient'
];

let refactoredCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace bg classes
  // Ensure we match whole words in className strings (e.g.bg-zinc-900 but not dark:bg-zinc-900)
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-zinc-900\b(?!\/)/g, 'bg-white dark:bg-zinc-900');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-zinc-900\/50\b/g, 'bg-zinc-50 dark:bg-zinc-900/50');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-zinc-900\/30\b/g, 'bg-zinc-50/50 dark:bg-zinc-900/30');
  
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-black\b(?!\/)/g, 'bg-white dark:bg-black');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-black\/50\b/g, 'bg-zinc-50/50 dark:bg-black/50');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-black\/60\b/g, 'bg-white/60 dark:bg-zinc-900/60');
  
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-zinc-800\b/g, 'bg-zinc-150 dark:bg-zinc-800');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bbg-zinc-950\b/g, 'bg-zinc-100 dark:bg-zinc-950');

  // Replace borders
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bborder-white\/10\b/g, 'border-zinc-200 dark:border-white/10');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bborder-white\/5\b/g, 'border-zinc-200 dark:border-white/5');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bborder-zinc-800\b/g, 'border-zinc-200 dark:border-zinc-800');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\bborder-zinc-700\b/g, 'border-zinc-300 dark:border-zinc-700');

  // Replace text colors
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\btext-zinc-100\b/g, 'text-zinc-900 dark:text-zinc-100');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\btext-zinc-200\b/g, 'text-zinc-800 dark:text-zinc-200');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\btext-zinc-300\b/g, 'text-zinc-700 dark:text-zinc-300');
  content = content.replace(/(?<!dark:|active:|hover:|focus-within:|focus:)\btext-zinc-400\b/g, 'text-zinc-650 dark:text-zinc-400');
  
  // Custom text-white handling
  // Match text-white inside class attribute double/single quotes or template literals
  // className="... text-white ..."
  content = content.replace(/(className\s*=\s*["']|className\s*=\s*\{\s*`)([^"']*?)("|\}`|`)/g, (match, prefix, classList, suffix) => {
    // If it has text-white and does not have colorful backgrounds, replace text-white with text-zinc-900 dark:text-white
    if (classList.includes('text-white') && !colorfulBgKeywords.some(keyword => classList.includes(keyword))) {
      const updatedList = classList.replace(/\btext-white\b/g, 'text-zinc-900 dark:text-white');
      return `${prefix}${updatedList}${suffix}`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    refactoredCount++;
  }
});

console.log(`Refactored ${refactoredCount} files successfully!`);
