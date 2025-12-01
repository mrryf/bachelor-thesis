import csv
import os
import sys

def generate_latex_tables(csv_path, output_dir):
    """
    Reads items.csv and generates LaTeX tables for each construct and a master table.
    """
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    items_by_construct = {}
    all_items = []

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

    # Generate individual tables
    for construct, items in items_by_construct.items():
        filename = os.path.join(output_dir, f"table_{construct}.tex")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(create_latex_table(items, caption=f"Items for Construct: {construct}", label=f"tab:{construct}"))
        print(f"Generated {filename}")

    # Generate master table
    master_filename = os.path.join(output_dir, "table_master.tex")
    with open(master_filename, 'w', encoding='utf-8') as f:
        f.write(create_latex_table(all_items, caption="All Survey Items", label="tab:master_items"))
    print(f"Generated {master_filename}")

def create_latex_table(items, caption, label):
    """
    Creates a LaTeX table string from a list of items.
    """
    # APA7 style table using tabularx
    latex = []
    latex.append("\\begin{table}[ht]")
    latex.append("\\centering")
    latex.append("\\begin{threeparttable}")
    latex.append(f"\\caption{{{caption}}}")
    latex.append(f"\\label{{{label}}}")
    # Adjust columns based on content. 
    # Columns: Construct (if master), Original, Adapted, Scaling, Source
    # Let's make it flexible.
    
    latex.append("\\begin{tabularx}{\\textwidth}{l X X l l}")
    latex.append("\\toprule")
    latex.append("\\textbf{Construct} & \\textbf{Original Item} & \\textbf{Adapted Item} & \\textbf{Scaling} & \\textbf{Source} \\\\")
    latex.append("\\midrule")
    
    current_construct = ""
    for item in items:
        construct = item['Construct']
        original = escape_latex(item['Item_Original'])
        adapted = escape_latex(item['Item_Adapted'])
        scaling = escape_latex(item['Scaling'])
        source = escape_latex(item['Source'])
        
        # Grouping visual aid: only show construct name on first occurrence or change
        display_construct = construct if construct != current_construct else ""
        current_construct = construct
        
        latex.append(f"{display_construct} & {original} & {adapted} & {scaling} & {source} \\\\")
        # Add a small space between constructs if it changes, but not after the last one
        # This logic is a bit complex for a simple script, let's stick to simple rows for now.
        # Or add \addlinespace if construct changes
    
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
    CSV_PATH = os.path.join(PROJECT_ROOT, "content", "thesis", "survey", "construct_items", "items.csv")
    OUTPUT_DIR = os.path.join(PROJECT_ROOT, "content", "thesis", "survey", "construct_items", "generated")
    
    generate_latex_tables(CSV_PATH, OUTPUT_DIR)
