import sqlite3
import shutil
import os

source_dir = r'C:\Users\deepa\.gemini\antigravity\brain\3801d5d0-84d2-4694-9013-293df7e3716a'
dest_dir = r'c:\Users\deepa\OneDrive\Desktop\coding\New folder\virtual-herbal-garden\frontend\public\plants'

files = {
    'Pomegranate': 'pomegranate_fruit_1774897467113.png',
    'Papaya': 'papaya_fruit_1774897482136.png',
    'Jamun': 'jamun_fruit_1774897499996.png'
}

conn = sqlite3.connect('herbal_garden.db')
cursor = conn.cursor()

for plant_name, img_file in files.items():
    src_path = os.path.join(source_dir, img_file)
    dest_path = os.path.join(dest_dir, img_file)
    
    # Copy file if it exists
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f'Copied {img_file}')
        
        # Update URL in DB
        url = f'/plants/{img_file}'
        cursor.execute("UPDATE plants SET image_url = ? WHERE name LIKE ?", (url, f'%{plant_name}%'))
        print(f'Updated DB for {plant_name}')
    else:
        print(f'Source file not found: {src_path}')

conn.commit()
conn.close()
