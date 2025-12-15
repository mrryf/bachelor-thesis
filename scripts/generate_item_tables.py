import csv
import os
import sys

def generate_latex_tables(csv_path, output_dir):
    """
    Reads items.csv and generates LaTeX tables for each construct and a master table.
    Also generates a CSV with only adapted items for survey use.
    """
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    items_by_construct = {}
    all_items = []
    adapted_items_only = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            construct = row['Construct'].strip()
            # Clean up construct name for filename (remove special chars if any)
            safe_construct = "".join([c for c in construct if c.isalnum() or c in (' ', '-', '_')]).strip().replace(' ', '_')
            
            if safe_construct not in items_by_construct:
                items_by_construct[safe_construct] = []
            
            items_by_construct[safe_construct].append(row)
            all_items.append(row)
            
            # Collect adapted items for CSV export
            adapted_item = row['Angepasstes_Item'].strip()
            if adapted_item and adapted_item != '-':
                adapted_items_only.append({'Angepasstes_Item': adapted_item})

    # Generate individual tables
    for construct, items in items_by_construct.items():
        filename = os.path.join(output_dir, f"table_{construct}.tex")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(create_latex_table(items, caption=f"Items für Konstrukt: {construct}", label=f"tab:{construct}"))
        print(f"Generated {filename}")

    # Generate master table
    master_filename = os.path.join(output_dir, "table_master.tex")
    with open(master_filename, 'w', encoding='utf-8') as f:
        f.write(create_latex_table(all_items, caption="Alle Fragebogen-Items", label="tab:master_items"))
    print(f"Generated {master_filename}")
    
    # Generate adapted items only CSV
    adapted_csv_path = os.path.join(os.path.dirname(csv_path), "adapted_items_only.csv")
    with open(adapted_csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['Angepasstes_Item'])
        writer.writeheader()
        writer.writerows(adapted_items_only)
    print(f"Generated {adapted_csv_path}")

def create_latex_table(items, caption, label):
    """
    Creates a LaTeX table string from a list of items.
    Now generates 2-column tables: Item and Angepasstes Item
    """
    latex = []
    latex.append("\\begin{table}[ht]")
    latex.append("\\centering")
    latex.append("\\begin{threeparttable}")
    latex.append(f"\\caption{{{caption}}}")
    latex.append(f"\\label{{{label}}}")
    
    # 2-column table: Item and Angepasstes Item
    latex.append("\\begin{tabularx}{\\textwidth}{X X}")
    latex.append("\\toprule")
    latex.append("\\textbf{Item} & \\textbf{Angepasstes Item} \\\\")
    latex.append("\\midrule")
    
    for item in items:
        original = escape_latex(item['Item'])
        adapted = escape_latex(item['Angepasstes_Item'])
        
        latex.append(f"{original} & {adapted} \\\\")
    
    latex.append("\\bottomrule")
    latex.append("\\end{tabularx}")
    
    # Add notes if needed
    # latex.append("\\begin{tablenotes}")
    # latex.append("\\small")
    # latex.append("\\item Note. ...")
    # latex.append("\\end{tablenotes}")
    
    latex.append("\\end{threeparttable}")
    latex.append("\\end{table}")
    
    return "\n".join(latex)

def escape_latex(text):
    """
    Escapes special LaTeX characters.
    """
    if not text:
        return "-"
    chars = {
        '&': '\\&',
        '%': '\\%',
        '$': '\\$',
        '#': '\\#',
        '_': '\\_',
        '{': '\\{',
        '}': '\\}',
        '~': '\\textasciitilde',
        '^': '\\textasciicircum',
        '\\': '\\textbackslash',
    }
    return "".join(chars.get(c, c) for c in text)

if __name__ == "__main__":
    # Paths are relative to project root usually
    PROJECT_ROOT = os.getcwd()
    CSV_PATH = os.path.join(PROJECT_ROOT, "content", "resources", "data", "items.csv")
    OUTPUT_DIR = os.path.join(PROJECT_ROOT, "content", "resources", "tables")
    
    generate_latex_tables(CSV_PATH, OUTPUT_DIR)
