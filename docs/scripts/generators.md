# Table Generators

Scripts in this category are responsible for generating LaTeX tables from raw data, such as CSV files exported from survey tools.

## generate_item_tables.py

This script reads survey data and generates LaTeX tables for each construct.

### Functionality

1.  **Reads Data**: Loads survey items from a CSV file.
2.  **Groups Items**: Groups items by their construct (e.g., PUF, EOU, XAIT).
3.  **Generates Tables**: Creates a separate `.tex` file for each construct containing a formatted table.
4.  **Master Table**: Generates a master table containing all items.

### Output

The generated tables are saved to `content/resources/tables/`.
