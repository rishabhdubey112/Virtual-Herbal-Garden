import os
import sqlite3
import requests
import shutil

FRUITS_TO_ADD = [
    {
        "name": "Pomegranate",
        "scientific": "Punica granatum",
        "intro": "Pomegranate is a fruit-bearing deciduous shrub. The fruit is packed with hundreds of edible seeds called arils.",
        "uses": "Consumed fresh, juiced, or used as a garnish. The rind and bark are also used in Ayurvedic decoctions.",
        "benefits": "Rich in antioxidants, lowers blood pressure, improves heart health, reduces inflammation, and boosts immunity.",
        "category": "Heart Health",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Pomegranate_fruit_with_cut_open_view.jpg/800px-Pomegranate_fruit_with_cut_open_view.jpg",
        "filename": "pomegranate_fruit.jpg"
    },
    {
        "name": "Papaya",
        "scientific": "Carica papaya",
        "intro": "Papaya is a tropical fruit tree known for its sweet, vibrant orange flesh and black seeds. Both the fruit and leaves have strong medicinal properties.",
        "uses": "Fruit is eaten fresh; papaya leaf juice is famously used to increase platelet count during Dengue fever.",
        "benefits": "Improves digestion (contains papain enzyme), boosts immunity, reduces inflammation, and speeds up wound healing.",
        "category": "Digestive Health",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Papaya_cross_section_BNC.jpg/800px-Papaya_cross_section_BNC.jpg",
        "filename": "papaya_fruit.jpg"
    },
    {
        "name": "Lemon",
        "scientific": "Citrus limon",
        "intro": "Lemon is a small evergreen tree widely known for its bright yellow, highly acidic and vitamin C-rich fruits.",
        "uses": "Juice is widely used in culinary dishes, beverages, and traditional home remedies with warm water and honey.",
        "benefits": "Immunity booster, aids digestion, promotes hydration, supports weight loss, and prevents kidney stones.",
        "category": "Immunity",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Lemon.jpg/800px-Lemon.jpg",
        "filename": "lemon_fruit.jpg"
    },
    {
        "name": "Jamun (Black Plum)",
        "scientific": "Syzygium cumini",
        "intro": "Jamun is an evergreen tropical tree bearing dark purple to almost black, sweet and subtly astringent berries.",
        "uses": "Eaten fresh, used in juices, vinegar, and jams. The seeds are dried and powdered for diabetic supplements.",
        "benefits": "Highly effective for diabetes management, improves hemoglobin count, keeps heart healthy, and treats digestive disorders.",
        "category": "Metabolic Health",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Syzygium_cumini_1_%282%29.JPG/800px-Syzygium_cumini_1_%282%29.JPG",
        "filename": "jamun_fruit.jpg"
    }
]

def download_image(url, filename):
    print(f"Downloading {url}")
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'plants'))
    os.makedirs(frontend_dir, exist_ok=True)
    save_path = os.path.join(frontend_dir, filename)
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, f)
            print(f"  [+] Saved {filename}")
            return f"/plants/{filename}"
        else:
            print(f"  [x] HTTP {response.status_code}")
    except Exception as e:
        print(f"  [x] Failed: {e}")
    return "/plants/tulsi_plant.png"

def inject_fruits():
    conn = sqlite3.connect('herbal_garden.db')
    cursor = conn.cursor()
    
    added_count = 0
    for fruit in FRUITS_TO_ADD:
        cursor.execute("SELECT id FROM plants WHERE name=?", (fruit['name'],))
        if cursor.fetchone():
            print(f"[-] {fruit['name']} already exists.")
            continue
            
        image_url = download_image(fruit['url'], fruit['filename'])
        
        cursor.execute(
            'INSERT INTO plants (name, scientific, description, uses, benefits, category, image_url) VALUES (?,?,?,?,?,?,?)',
            (fruit['name'], fruit['scientific'], fruit['intro'], fruit['uses'], fruit['benefits'], fruit['category'], image_url)
        )
        added_count += 1
        
    conn.commit()
    conn.close()
    print(f"Added {added_count} new fruits.")

if __name__ == '__main__':
    inject_fruits()
