import { readFileSync, writeFileSync } from 'fs';

const filePath = process.argv[2];
let src = readFileSync(filePath, 'utf8');

// Match each calculator function
const funcRegex = /export function (\w+Calculator|\w+Solver|\w+Checker)\(\) \{([^]*?)\n\}(?=\n\nexport function|\n\nexport function|\nconst |\nfunction |\n$)/g;

let match;
const replacements = [];

while ((match = funcRegex.exec(src)) !== null) {
  const fullMatch = match[0];
  const funcName = match[1];
  const body = match[2];

  // Skip already-upgraded ones
  if (fullMatch.includes('CalculatorShell')) continue;
  if (funcName === 'ScientificCalculator') continue;

  // Extract state variable names (excluding 'result')
  const stateRegex = /const \[(\w+), set\1\] = useState\(/g;
  const deps = [];
  let sm;
  while ((sm = stateRegex.exec(body)) !== null) {
    if (sm[1] !== 'result') deps.push(sm[1]);
  }

  // Already useCallback'd?
  const hasUseCallback = body.includes('useCallback(');

  // Extract the heading text
  const headingMatch = body.match(/<h1 className={headingClass}>(.+?)<\/h1>/);
  const heading = headingMatch ? headingMatch[1] : funcName;

  // Build replacement
  let newBody = body;

  // 1. Wrap calc in useCallback
  if (!hasUseCallback) {
    newBody = newBody.replace(
      /  const calc = \(\) => \{/,
      `  const calc = useCallback(() => {`
    );
    // Find the closing of calc function and add deps
    const calcEnd = newBody.lastIndexOf('  };');
    if (calcEnd !== -1) {
      newBody = newBody.slice(0, calcEnd) + `  }, [${deps.join(', ')}]);\n` + newBody.slice(calcEnd + 4);
    }
  }

  // 2. Replace return block
  const returnStart = newBody.indexOf('  return (');
  if (returnStart === -1) continue;

  const returnBlock = newBody.slice(returnStart);

  // Extract the input children (everything between heading and the </div>\n      </div> closing)
  const inputContentMatch = returnBlock.match(
    /<h1 className={headingClass}>.*?<\/h1>\n\s*<div className="space-y-4">\n([\s\S]*?)\n\s*<button onClick=\{calc\} className=\{btnClass\}>Calculate<\/button>\n\s*\{result && <pre className=\{resultClass\}>\{result\}<\/pre>\}\n\s*<\/div>\n\s*<\/div>/
  );

  if (!inputContentMatch) {
    console.log(`SKIP ${funcName}: couldn't parse return block`);
    continue;
  }

  const inputContent = inputContentMatch[1];

  const newReturn = `  return (
    <CalculatorShell title="${heading}" result={result} onCalculate={calc}>
${inputContent}
    </CalculatorShell>
  );`;

  newBody = newBody.slice(0, returnStart) + newReturn;

  const newFunc = `export function ${funcName}() {${newBody}\n}`;

  replacements.push({ from: fullMatch, to: newFunc });
}

// Apply all replacements
for (const { from, to } of replacements) {
  src = src.replace(from, to);
}

writeFileSync(filePath, src, 'utf8');
console.log(`Converted ${replacements.length} calculators`);
