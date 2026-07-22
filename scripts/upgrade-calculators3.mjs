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
  const m = line.match(/^export function (\w+Calculator|\w+Solver|\w+Checker)\(\) \{$/);
  if (!m) { i++; continue; }

  const funcName = m[1];
  const startLine = i;

  if (skipNames.has(funcName)) { i++; continue; }

  // Find the matching closing brace via depth counting
  let depth = 0;
  let j = i;
  for (; j < lines.length; j++) {
    for (const ch of lines[j]) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
    }
    if (depth === 0) break;
  }
  if (j >= lines.length) { console.log(`UNCLOSED ${funcName}`); i++; continue; }
  const endLine = j;
  i = endLine + 1;

  const block = lines.slice(startLine, endLine + 1);
  const body = block.join('\n');

  // Already done?
  if (body.includes('CalculatorShell')) continue;

  // --- Extract state variables (only useState patterns) ---
  const stateRegex = /const \[(\w+), set\1\] = useState\(/g;
  const deps = [];
  let sm;
  while ((sm = stateRegex.exec(body)) !== null) {
    if (sm[1] !== 'result') deps.push(sm[1]);
  }

  // --- Extract title ---
  const titleM = body.match(/<h1 className=\{headingClass\}>([^<]+)<\/h1>/);
  const title = titleM ? titleM[1].replace(/&amp;/g, '&') : funcName;

  // --- Split into: [state declarations...][calc func...][return block] ---
  const text = body;

  // Find calc function
  const calcMatch = text.match(/(\n\s*const calc = .*?\n\s*\};\s*)(?=\n\s*return )/s);
  //                                                         ^ the calc line(s)
  // Find return block
  const returnMatch = text.match(/(\n\s*return \([\s\S]*?\);\s*)/);

  if (!calcMatch || !returnMatch) {
    console.log(`SKIP ${funcName}: can't find calc or return`);
    continue;
  }

  const calcBlock = calcMatch[1];
  const returnBlock = returnMatch[1];

  // Wrap calc in useCallback
  let newCalcBlock;
  if (calcBlock.includes('useCallback')) {
    newCalcBlock = calcBlock; // already wrapped
  } else {
    newCalcBlock = calcBlock.replace(
      /(const calc = )\(\) => \{/,
      `$1useCallback(() => {`
    );
    // Replace the trailing "};" with "}, [deps]);"
    const lastIdx = newCalcBlock.lastIndexOf('};');
    if (lastIdx !== -1) {
      newCalcBlock = newCalcBlock.slice(0, lastIdx) + `}, [${deps.join(', ')}]);\n  `;
    }
  }

  // Extract input children from return block
  const inputM = returnBlock.match(
    /<div className="space-y-4">\n((?:\s*<div>.*?\n)*)\s*<button onClick=\{calc\}/
  );
  if (!inputM) {
    console.log(`SKIP ${funcName}: can't extract input content`);
    continue;
  }
  const inputContent = inputM[1].replace(/\n\s*$/, '');

  // Extract state declarations (lines before calc)
  const beforeCalc = text.slice(0, text.indexOf(calcMatch[1]));
  const stateLines = beforeCalc.match(/^\s*const \[[^\]]*\] = useState\(.*\);\s*$/gm) || [];

  // Build new function
  const indent = '        ';
  const newLines = [];
  newLines.push(`export function ${funcName}() {`);
  for (const sl of stateLines) {
    newLines.push(sl.replace(/^\s+/, '  ').trim());
  }
  newLines.push('');
  // Remove extra spaces from calcBlock
  const calcTrimmed = newCalcBlock.trim().split('\n').map(l => l.trim()).join('\n  ');
  newLines.push(`  ${calcTrimmed}`);
  newLines.push(`  return (`);
  newLines.push(`    <CalculatorShell title="${title}" result={result} onCalculate={calc}>`);
  for (const cl of inputContent.split('\n')) {
    newLines.push(`        ${cl.trim()}`);
  }
  newLines.push(`    </CalculatorShell>`);
  newLines.push(`  );`);
  newLines.push(`}`);

  upgrades.push({ funcName, startLine, endLine, oldBlock: block, newBlock: newLines });
}

// Apply bottom-up
upgrades.reverse();
for (const u of upgrades) {
  lines.splice(u.startLine, u.endLine - u.startLine + 1, ...u.newBlock);
}

writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Converted ${upgrades.length} calculators`);
