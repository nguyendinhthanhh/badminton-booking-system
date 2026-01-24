import xml.etree.ElementTree as ET
import re

# Read the XML file
with open('SBA301( Management badmintoon court).drawio.xml', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse XML
root = ET.fromstring(content)

# Find all table definitions
tables = {}
current_table = None
current_fields = []

# Find all mxCell elements
for cell in root.iter('mxCell'):
    value = cell.get('value', '')
    style = cell.get('style', '')
    
    # Check if it's a table header
    if 'shape=table' in style and value:
        if current_table and current_fields:
            tables[current_table] = current_fields
        current_table = value
        current_fields = []
    
    # Check if it's a field (partialRectangle with value)
    elif 'shape=partialRectangle' in style and value and current_table:
        parent = cell.get('parent', '')
        # Skip type columns (int, varchar, etc.)
        if value not in ['int', 'varchar', 'decimal', 'date', 'time', 'datetime', 'timestamp', 'boolean', 'text']:
            # Skip constraint columns (PK, FK, Unique)
            if value not in ['PK', 'FK', 'Unique', '']:
                current_fields.append(value)

# Add last table
if current_table and current_fields:
    tables[current_table] = current_fields

# Print results
for table_name, fields in tables.items():
    print(f"\nTable {table_name}:")
    for field in fields:
        print(f"  - {field}")
