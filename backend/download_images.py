import requests
import os
import time

images = {
    'tulsi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Tulsi_%28Holy_Basil%29_plant.jpg',
    'aloe_vera.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Aloe_vera_flower_inset.png',
    'ginger.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Ginger_root.jpg',
    'ashwagandha.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/25/Ashwagandha_Plant.jpg',
    'turmeric.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Turmeric-2009.jpg',
    'neem.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Neem_A_Ayurvedic.jpg',
    'peppermint.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Mentha_x_piperita_003.JPG',
    'lavender.jpg': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Matorrales_de_lavanda.jpg',
    'chamomile.jpg': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Matricaria_sp._2009.07.18_11.58.54-p7180044.jpg',
    'giloy.jpg': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Tinospora_cordifolia.jpg',
    'moringa.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Moringa_oleifera_Blanco2.388.png',
    'amla.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Amla.JPG',
    'brahmi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Bacopa_monnieri_4.jpg',
    'triphala.jpg': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Terminalia_chebula_fruits.jpg',
    'shatavari.jpg': 'https://upload.wikimedia.org/wikipedia/commons/7/79/Asparagus_racemosus_Willd.jpg',
    'fenugreek.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Fenugreek_Leaves_Fenugreek_seeds.jpg'
}

out_dir = r"c:\Users\deepa\OneDrive\Desktop\coding\New folder\virtual-herbal-garden\frontend\public\plants"
os.makedirs(out_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

for name, url in images.items():
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            with open(os.path.join(out_dir, name), 'wb') as f:
                f.write(res.content)
            print(f"Downloaded {name}")
        else:
            print(f"Failed to download {name}: {res.status_code}")
    except Exception as e:
        print(f"Error downloading {name}: {e}")
    time.sleep(0.5)
