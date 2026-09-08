#!/usr/bin/env python3
# HISTORICAL one-off: old-path to new-path mapping for the module move. See module docstring.
"""Build old-path -> new-path mapping for the 400 module files.
Pulls slug->category from tools chunks and slug->filename from DynamicModuleWrapper.
Outputs a machine-readable JSON mapping for use by the move script.
"""
import re, json, os
from glob import glob

ROOT = "src"

# 1. Collect all module files (exclude barrels/shared that are already refactored)
SHARED_FILES = {
    'Calculators.tsx', 'ApiTools.tsx', 'MiscellaneousTools1.tsx',
    'FinanceCalculators.tsx', 'MathCalculators.tsx', 'HealthCalculators.tsx',
    'DateTimeCalculators.tsx',
    'ApiRestTools.tsx', 'ApiSecurityTools.tsx', 'ApiGraphqlTools.tsx',
    'ApiSpecAndMiscTools.tsx',
    'MiscTextAndColorTools.tsx', 'MiscFunTools.tsx', 'MiscNumberMathTools.tsx',
    'MiscHealthTools.tsx', 'MiscDateTimeAndConverterTools.tsx',
    'Calculators.shared.ts', 'ApiTools.shared.ts',
    'miscToolColors.ts', 'MiscToolsShared.tsx',
    'DynamicModuleWrapper.tsx', 'shared',
}

module_files = {}
for f in glob(f"{ROOT}/components/tools/modules/*.tsx") + glob(f"{ROOT}/components/tools/modules/*.ts"):
    name = os.path.basename(f)
    if name in SHARED_FILES:
        continue
    if name.startswith('Calculators.tsx') or name.startswith('ApiTools.tsx') or name.startswith('MiscellaneousTools1.tsx'):
        continue
    module_files[name.replace('.tsx', '').replace('.ts', '')] = f

# 2. Extract slug -> category from tools chunk files
slug_to_category = {}
for chunk in sorted(glob(f"{ROOT}/registry/tools-chunk-*.ts")):
    with open(chunk) as f:
        content = f.read()
    slugs = re.findall(r'slug:\s*"([^"]+)"', content)
    cats = re.findall(r'category:\s*"([^"]+)"', content)
    for s, c in zip(slugs, cats):
        slug_to_category[s] = c

# 3. Extract slug -> module file name from DynamicModuleWrapper
with open(f"{ROOT}/components/tools/modules/DynamicModuleWrapper.tsx") as f:
    wrapper_content = f.read()

slug_to_modname = {}
pattern = r"'([a-z0-9-]+)'\s*:\s*dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*'@/components/tools/modules/([^']+)'"
for m in re.finditer(pattern, wrapper_content):
    slug = m.group(1)
    module_path = m.group(2)
    base_name = module_path.split('/')[-1]
    slug_to_modname[slug] = base_name

# 4. Build modname -> category mapping
modname_to_category = {}
for slug, category in slug_to_category.items():
    if slug in slug_to_modname:
        mod_name = slug_to_modname[slug].replace('.tsx', '').replace('.ts', '')
        if mod_name not in modname_to_category:
            modname_to_category[mod_name] = category

# 5. Build the full mapping
mapping = {}
unmapped = []

for mod_name, filepath in sorted(module_files.items()):
    filename = os.path.basename(filepath)
    if mod_name in modname_to_category:
        cat = modname_to_category[mod_name]
        dir_name = cat.lower().replace(' & ', '-').replace(' ', '-')
        new_path = f"{dir_name}/{filename}"
        mapping[filename] = {"category": cat, "directory": dir_name, "new_path": new_path}
    else:
        unmapped.append(filename)

# 6. Output summary by directory
print("=== CATEGORY DIRECTORIES ===")
dir_counts = {}
for _, info in mapping.items():
    d = info["directory"]
    dir_counts[d] = dir_counts.get(d, 0) + 1
for d, c in sorted(dir_counts.items()):
    print(f"  {d}/  ({c} files)")

print(f"\n=== UNMAPPED ({len(unmapped)} files) ===")
for m in sorted(unmapped):
    print(f"  {m}")

# 7. Write machine-readable mapping JSON
output = {
    "mapped": {f: info for f, info in mapping.items()},
    "unmapped": sorted(unmapped),
    "directory_counts": dict(sorted(dir_counts.items())),
    "total_mapped": len(mapping),
    "total_unmapped": len(unmapped),
}
with open("/tmp/module-mapping.json", "w") as f:
    json.dump(output, f, indent=2)
print(f"\nMapping written to /tmp/module-mapping.json")

# Also write a human-readable list
with open("/tmp/module-mapping.txt", "w") as f:
    for filename, info in sorted(mapping.items()):
        f.write(f"  {filename}  ->  {info['new_path']}\n")
    for m in sorted(unmapped):
        f.write(f"  {m}  ->  [UNMAPPED]\n")
print(f"Human-readable list written to /tmp/module-mapping.txt")
