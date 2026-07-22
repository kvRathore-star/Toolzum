import { readFileSync, writeFileSync } from 'fs';

const filePath = process.argv[2];
const lines = readFileSync(filePath, 'utf8').split('\n');

const skipNames = new Set([
  'ScientificCalculator', 'MortgageCalculator', 'CompoundInterestCalculator',
  'CarLoanCalculator', 'DiscountCalculator', 'InflationCalculator',
  'RetirementCalculator', 'BodyFatPercentageCalculator', 'CalorieCalculator',
  'SimpleInterestCalculator', 'SavingsCalculator', 'TaxCalculator',
]);

const upgrades = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const m = line.match(/^export function (\w+)\(\) \{$/);
  if (!m) { i++; continue; }
  const funcName = m[1];
  if (!funcName.endsWith('Calculator') && !funcName.endsWith('Solver') && !funcName.endsWith('Checker')) { i++; continue; }
  const startLine = i;
  if (skipNames.has(funcName)) { i++; continue; }

  // Find matching close brace
  let depth = 0, j = i;
  for (; j < lines.length; j++) {
    for (const ch of lines[j]) { if (ch === '{') depth++; if (ch === '}') depth--; }
    if (depth === 0) break;
  }
  if (j >= lines.length) { console.log(`UNCLOSED ${funcName}`); i++; continue; }
  const endLine = j;
  i = endLine + 1;

  const block = lines.slice(startLine, endLine + 1);
  const body = block.join('\n');
  if (body.includes('CalculatorShell')) continue;

  // Extract deps from useState calls
  const deps = [...body.matchAll(/const \[(\w+), set\1\] = useState\(/g)].map(m => m[1]).filter(d => d !== 'result');

  // Extract title from h1
  const title = body.match(/<h1 className=\{headingClass\}>([^<]+)<\/h1>/)?.[1] || funcName;

  // 1. Wrap calc in useCallback if not already
  let newBody = body;
  const hasUseCallback = body.includes('useCallback(');
  if (!hasUseCallback) {
    newBody = newBody.replace(/(const calc = )\(\) => \{/, '$1useCallback(() => {');
    // Find the calc's closing }; and add deps
    // Strategy: find "};" that is followed by whitespace/newline then "return" (or end of line before return)
    const calcEndMatch = newBody.match(/(\n\s*\}\;\s*)(?=\n\s*return)/);
    if (calcEndMatch) {
      const oldEnd = calcEndMatch[1];
      const newEnd = oldEnd.replace('};', `}, [${deps.join(', ')}]);`);
      newBody = newBody.replace(oldEnd, newEnd);
    }
  }

  // 2. Replace return div with CalculatorShell
  // Match from <div className={cardClass}> to </div> at end
  newBody = newBody.replace(
    /<div className=\{cardClass\}>\n[\s\S]*?<h1 className=\{headingClass\}>[^<]+<\/h1>\n\s*<div className="space-y-4">\n([\s\S]*?)\n\s*<button onClick=\{calc\} className=\{btnClass\}>Calculate<\/button>\n\s*\{result && <pre className=\{resultClass\}>\{result\}<\/pre>\}\n\s*<\/div>\n\s*<\/div>/,
    (match, inputContent) => {
      return `<CalculatorShell title="${title}" result={result} onCalculate={calc}>\n${inputContent}\n    </CalculatorShell>`;
    }
  );

  // Check if replacement happened
  if (body === newBody) {
    console.log(`SKIP ${funcName}: no replacement`);
    continue;
  }

  upgrades.push({ funcName, startLine, endLine, oldBlock: block, newBlock: newBody });
}

// Apply bottom-up
upgrades.reverse();
for (const u of upgrades) {
  lines.splice(u.startLine, u.endLine - u.startLine + 1, ...u.newBlock.split('\n'));
}

writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Converted ${upgrades.length} calculators`);
