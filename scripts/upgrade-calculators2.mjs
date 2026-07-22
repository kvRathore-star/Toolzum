import { readFileSync, writeFileSync } from 'fs';

const filePath = process.argv[2];
const lines = readFileSync(filePath, 'utf8').split('\n');

const shouldSkip = name => {
  if (name === 'ScientificCalculator') return true;
  // Already upgraded check
  return false;
};

const upgrades = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const m = line.match(/^export function (\w+Calculator|\w+Solver|\w+Checker)\(\) \{$/);
  if (!m) { i++; continue; }

  const funcName = m[1];
  const startLine = i;

  // Find the matching closing brace
  let depth = 0;
  let j = i;
  for (; j < lines.length; j++) {
    for (const ch of lines[j]) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
    }
    if (depth === 0) break;
  }

  if (j >= lines.length) {
    console.log(`UNCLOSED ${funcName} at line ${startLine}`);
    i++;
    continue;
  }

  const endLine = j;
  const block = lines.slice(startLine, endLine + 1);
  const body = block.join('\n');

  i = endLine + 1;

  // Already upgraded?
  if (body.includes('CalculatorShell')) continue;

  // Skip ScientificCalculator
  if (funcName === 'ScientificCalculator') continue;

  // Extract state variable deps (excluding 'result')
  const stateRegex = /const \[(\w+), set\1\] = useState\(/g;
  const deps = [];
  let sm;
  while ((sm = stateRegex.exec(body)) !== null) {
    if (sm[1] !== 'result') deps.push(sm[1]);
  }

  // Extract title from h1
  const titleM = body.match(/<h1 className=\{headingClass\}>([^<]+)<\/h1>/);
  const title = titleM ? titleM[1] : funcName;

  // Extract input content (everything between <div className="space-y-4"> and the button line)
  const linesArr = block;
  let inputStart = -1, inputEnd = -1;
  for (let k = 0; k < linesArr.length; k++) {
    if (linesArr[k].includes('<div className="space-y-4">')) inputStart = k + 1;
    if (inputStart !== -1 && linesArr[k].includes('<button onClick={calc} className={btnClass}>Calculate</button>')) {
      inputEnd = k; // exclusive
      break;
    }
  }

  if (inputStart === -1 || inputEnd === -1) {
    console.log(`SKIP ${funcName}: can't find input block`);
    continue;
  }

  const inputLines = linesArr.slice(inputStart, inputEnd);
  // Remove leading and trailing empty lines
  while (inputLines.length && inputLines[0].trim() === '') inputLines.shift();
  while (inputLines.length && inputLines[inputLines.length - 1].trim() === '') inputLines.pop();

  const indent = '        '; // 8 spaces for input content inside CalculatorShell

  // Build the new function
  const newLines = [];
  newLines.push(`export function ${funcName}() {`);

  // Add state variables (copy from original, stripping indent)
  let inStateBlock = false;
  for (const line of block) {
    if (line.includes('const [')) {
      inStateBlock = true;
      newLines.push(`  ${line.trim()}`);
    } else if (inStateBlock) {
      if (line.trim().startsWith('const ') || line.trim().startsWith('let ') || line.trim().startsWith('var ')) {
        newLines.push(`  ${line.trim()}`);
      } else {
        inStateBlock = false;
      }
    }
    if (inStateBlock && line.includes('useState(') && line.includes(')')) {
      inStateBlock = false;
    }
  }

  // Wrap calc in useCallback
  const calcBody = body.match(/const calc = \(\) => \{([\s\S]*?)\n  \};/);
  if (calcBody) {
    newLines.push(`  const calc = useCallback(() => {${calcBody[1]}\n  }, [${deps.join(', ')}]);`);
  } else {
    // Try other patterns
    console.log(`  ${funcName}: no calc found, skipping useCallback`);
    // Just copy original calc
    const calcline = body.match(/const calc = .+?;/);
    if (calcline) newLines.push(`  ${calcline[0]}`);
  }

  // Return with CalculatorShell
  newLines.push(`  return (`);
  newLines.push(`    <CalculatorShell title="${title}" result={result} onCalculate={calc}>`);
  for (const line of inputLines) {
    newLines.push(`${indent}${line.trim()}`);
  }
  newLines.push(`    </CalculatorShell>`);
  newLines.push(`  );`);
  newLines.push(`}`);

  upgrades.push({
    funcName,
    startLine,
    endLine,
    oldBlock: block,
    newBlock: newLines,
  });
}

// Apply replacements from bottom to top to preserve line numbers
upgrades.reverse();
for (const u of upgrades) {
  const startIdx = u.startLine;
  const endIdx = u.endLine;
  lines.splice(startIdx, endIdx - startIdx + 1, ...u.newBlock);
}

writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Converted ${upgrades.length} calculators`);
