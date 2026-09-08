#!/usr/bin/env python3
# HISTORICAL one-off: import-path rewrite for the module move. See module docstring.
"""Rewrite all import paths referencing the old flat modules/ layout.
Uses the same mapping JSON as the move script — single source of truth.
Fails loudly on any file it can't read/write.
"""
import json, os, re, sys

# Load mapping
with open("/tmp/module-mapping-final.json") as f:
    data = json.load(f)
mapping = data["mapping"]  # filename -> {new_path, directory, category}

# Build lookup: old_path_suffix -> new_path_suffix
# e.g. '@/components/tools/modules/PdfMerger' -> '@/components/tools/modules/pdf/PdfMerger'
# Imports may or may not include the .tsx extension
rewrites = {}
for filename, info in mapping.items():
    base = filename.replace('.tsx', '').replace('.ts', '')
    ext = '.tsx' if filename.endswith('.tsx') else '.ts'
    # With extension
    old_suffix = f"@/components/tools/modules/{filename}"
    new_suffix = f"@/components/tools/modules/{info['new_path']}"
    rewrites[old_suffix] = new_suffix
    # Without extension (for import() statements)
    old_suffix_noext = f"@/components/tools/modules/{base}"
    new_suffix_noext = f"@/components/tools/modules/{info['directory']}/{base}"
    if old_suffix_noext != new_suffix_noext:
        rewrites[old_suffix_noext] = new_suffix_noext

# Ensure the barrel files (Calculators, ApiTools, etc.) are NOT rewritten
# They stayed at the old path, so references to them must NOT change
barrel_files = [
    'Calculators.tsx', 'ApiTools.tsx', 'MiscellaneousTools1.tsx',
    'FinanceCalculators.tsx', 'MathCalculators.tsx', 'HealthCalculators.tsx',
    'DateTimeCalculators.tsx',
    'ApiRestTools.tsx', 'ApiSecurityTools.tsx', 'ApiGraphqlTools.tsx',
    'ApiSpecAndMiscTools.tsx',
    'MiscTextAndColorTools.tsx', 'MiscFunTools.tsx', 'MiscNumberMathTools.tsx',
    'MiscHealthTools.tsx', 'MiscDateTimeAndConverterTools.tsx',
    'Calculators.shared.ts', 'ApiTools.shared.ts',
    'miscToolColors.ts', 'MiscToolsShared.tsx',
    'DynamicModuleWrapper.tsx',
]
for b in barrel_files:
    old_suffix = f"@/components/tools/modules/{b}"
    if old_suffix in rewrites:
        del rewrites[old_suffix]

# Also skip shared/ paths
rewrites = {k: v for k, v in rewrites.items() if '/shared/' not in k}

print(f"Path rewrites to apply: {len(rewrites)}")

# Collect all source files (only .ts, .tsx, .js, .jsx — skip node_modules, .next, out, mapping files)
src_files = []
for root, dirs, files in os.walk("src"):
    # Skip dirs
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', '__pycache__')]
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
            src_files.append(os.path.join(root, f))

print(f"Scanning {len(src_files)} source files...")

total_replacements = 0
files_modified = []

for filepath in sorted(src_files):
    with open(filepath) as f:
        content = f.read()
    
    new_content = content
    file_changed = False
    
    # Try each rewrite
    for old_suffix, new_suffix in sorted(rewrites.items(), key=lambda x: -len(x[0])):
        # Match the full path pattern in import/require statements
        # Also handle .tsx vs .ts extension variations
        old_path = old_suffix
        new_path = new_suffix
        
        if old_path in new_content:
            new_content = new_content.replace(old_path, new_path)
            file_changed = True
    
    if file_changed:
        with open(filepath, 'w') as f:
            f.write(new_content)
        # Count replacements
        count = sum(1 for old, new in rewrites.items() if old in content)
        total_replacements += count
        files_modified.append((filepath, count))
        print(f"  {filepath} ({count} replacements)")

print(f"\nFiles modified: {len(files_modified)}")
print(f"Total path replacements: {total_replacements}")

# Sanity check: verify no old paths remain in modified files
print("\n=== Sanity check: remaining old paths ===")
remaining = 0
for filepath in src_files:
    with open(filepath) as f:
        content = f.read()
    for old_suffix in rewrites:
        if old_suffix in content and filepath not in [f[0] for f in files_modified]:
            # Only report if this file path wasn't supposed to be modified
            # (modified files might have partial matches)
            pass
        if old_suffix in content:
            # Print first few chars of context
            idx = content.index(old_suffix)
            start = max(0, idx - 30)
            end = min(len(content), idx + len(old_suffix) + 30)
            context = content[start:end]
            if old_suffix not in context:
                continue
            remaining += 1
            if remaining <= 5:
                print(f"  REMAINING in {filepath}: ...{context.strip()}...")

if remaining == 0:
    print("  None — all clean!")
else:
    print(f"  {remaining} old paths remain (may be in non-source dirs or false positives)")
