import os
import shutil
import re
from pathlib import Path

# Frontend directory
src_dir = Path(r"d:\scanner-x\scannerX-frontend\src")

# Directories to create and files to move
directories = {
    "components": ["AlertToast.jsx", "LanguageSwitcher.jsx", "StrategyInfoDialog.jsx", "components.jsx"],
    "features": ["BacktestPanel.jsx", "CandlestickChart.jsx", "IndexIndicatorPanel.jsx", "OptionChainWidget.jsx", "RealtimePanel.jsx", "ScanResultsPanel.jsx"],
    "utils": ["utils.js"],
    "styles": ["theme.js", "App.css", "index.css"]
}

# Create directories
for d in directories.keys():
    (src_dir / d).mkdir(parents=True, exist_ok=True)

# Generate a mapping for file locations
file_locations = {}
for module_dir, files in directories.items():
    for f in files:
        basename = os.path.splitext(f)[0]
        file_locations[basename] = module_dir
        # CSS files might be imported with exact extension
        file_locations[f] = module_dir

# Move files
moved_files = {}
for module_dir, files in directories.items():
    for f in files:
        src = src_dir / f
        dest = src_dir / module_dir / f
        if src.exists():
            print(f"Moving {src} to {dest}")
            shutil.move(src, dest)
            moved_files[f] = dest

# We also have files left in src/: App.jsx, App.css (moved), main.jsx, i18n.js
all_js_files = []
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.js') or f.endswith('.jsx'):
            all_js_files.append(Path(root) / f)

def get_new_import_path(current_file_path, target_file_basename):
    # Determine directory of current file relative to src
    current_rel_dir = current_file_path.parent.relative_to(src_dir).as_posix()
    target_dir = file_locations.get(target_file_basename)
    
    if not target_dir:
        # If target didn't move, it's in src/
        if current_rel_dir == '.':
            return f"./{target_file_basename}"
        else:
            return f"../{target_file_basename}"
            
    # Target moved
    if current_rel_dir == '.':
        return f"./{target_dir}/{target_file_basename}"
    elif current_rel_dir == target_dir:
        return f"./{target_file_basename}"
    else:
        return f"../{target_dir}/{target_file_basename}"

def process_file_imports(filepath):
    print(f"Processing imports in {filepath}")
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content
    
    # We will search for all old imports. Old imports were all like import X from './Y' or import './Y.css'
    # Find all matches of: from './(Something)' or import './(Something)'
    
    # Pattern 1: from './filename' or from "./filename"
    def replace_from(match):
        imported_item = match.group(2) # e.g. theme
        if imported_item in file_locations or imported_item + '.jsx' in moved_files or imported_item + '.js' in moved_files:
            # We found a moved file
            new_path = get_new_import_path(filepath, imported_item)
            return f"{match.group(1)}'{new_path}'"
        return match.group(0) # unchanged
        
    new_content = re.sub(r'(from\s+)[\'"]\.\/([a-zA-Z0-9_-]+)[\'"]', replace_from, new_content)
    
    # Pattern 2: import './filename.css'
    def replace_import_css(match):
        imported_item = match.group(2) # e.g. App.css
        if imported_item in file_locations:
            new_path = get_new_import_path(filepath, imported_item)
            return f"{match.group(1)}'{new_path}'"
        return match.group(0)
        
    new_content = re.sub(r'(import\s+)[\'"]\.\/([a-zA-Z0-9_-]+\.css)[\'"]', replace_import_css, new_content)

    # Some imports might include extension like from './utils.js'
    def replace_with_ext(match):
        imported_item = match.group(2) # e.g. utils
        ext = match.group(3) # e.g. js
        full_name = imported_item + ext
        # file_locations handles basenames mostly except css
        if imported_item in file_locations:
            new_path = get_new_import_path(filepath, imported_item)
            return f"{match.group(1)}'{new_path}{ext}'"
        return match.group(0)
    
    new_content = re.sub(r'(from\s+)[\'"]\.\/([a-zA-Z0-9_-]+)(\.(?:js|jsx))[\'"]', replace_with_ext, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"  -> Updated imports in {filepath.name}")

for f_path in all_js_files:
    process_file_imports(f_path)

print("Frontend refactoring script completed.")
