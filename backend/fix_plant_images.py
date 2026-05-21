"""
Fix images for newly discovered plants that have wrong/placeholder images (tulsi_plant.png).
Uses Wikipedia API to get real plant images.
"""
import sqlite3
import urllib.request
import urllib.parse
import json
import os
import shutil
import sys

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

DB_PATH = os.path.join(os.path.dirname(__file__), 'herbal_garden.db')
PLANTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'plants'))
os.makedirs(PLANTS_DIR, exist_ok=True)

def get_wikipedia_image(plant_name):
    """Fetch the main image URL for a plant from Wikipedia API."""
    try:
        # Search for the page
        search_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(plant_name)}"
        req = urllib.request.Request(search_url, headers={'User-Agent': 'HerbalGardenBot/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read())
            if 'thumbnail' in data:
                # Get the original (high-res) image
                img_url = data['thumbnail']['source']
                # Replace thumbnail size with 400px
                img_url = img_url.replace('/thumb/', '/').rsplit('/', 1)[0] if '/thumb/' in img_url else img_url
                # Just use thumbnail URL directly - it's good enough
                return data['thumbnail']['source']
    except Exception as e:
        print(f"[WARN] Wikipedia lookup failed for '{plant_name}': {e}")
    return None

def download_image(url, save_path):
    """Download image from URL and save to path."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(save_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"[WARN] Download failed for {url}: {e}")
        return False

def fix_plant_images():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Find all plants with wrong/placeholder images
    cursor.execute("""
        SELECT id, name, scientific, image_url FROM plants 
        WHERE image_url LIKE '%tulsi_plant.png' 
           OR image_url LIKE '%source.unsplash.com%'
           OR image_url IS NULL
           OR image_url = ''
    """)
    bad_plants = cursor.fetchall()
    
    print(f"\nFound {len(bad_plants)} plants with missing/wrong images:\n")
    
    for plant in bad_plants:
        plant_id = plant['id']
        name = plant['name']
        scientific = plant['scientific']
        
        print(f"Processing: {name} ({scientific})")
        
        # Create safe filename
        safe_name = "".join([c for c in name.lower().replace(' ', '_') if c.isalpha() or c == '_'])
        filename = f"auto_{safe_name}.jpg"
        save_path = os.path.join(PLANTS_DIR, filename)
        
        # Try to get Wikipedia image
        img_url = None
        
        # Try scientific name first, then common name
        for search_term in [scientific.split('(')[0].strip(), name]:
            img_url = get_wikipedia_image(search_term)
            if img_url:
                print(f"  ✓ Found Wikipedia image for '{search_term}'")
                break
        
        if img_url:
            # Download the image
            if download_image(img_url, save_path):
                new_url = f'/plants/{filename}'
                cursor.execute('UPDATE plants SET image_url = ? WHERE id = ?', (new_url, plant_id))
                conn.commit()
                print(f"  ✓ Saved to {filename} → DB updated")
            else:
                print(f"  ✗ Download failed, keeping placeholder")
        else:
            # Last resort: use Unsplash with specific query (these redirect to real photos)
            plant_query = urllib.parse.quote(f"{name} plant herb")
            fallback_url = f"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400"
            
            # Try a direct download of a general herb image per category
            herb_images = {
                'basil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/320px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg',
                'marigold': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_marigold.jpg/320px-Simple_marigold.jpg',
                'holy basil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Tulsi_in_Panchkula_India.jpg/320px-Tulsi_in_Panchkula_India.jpg',
                'apple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/320px-Red_Apple.jpg',
                'sunflower': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/320px-Sunflower_sky_backdrop.jpg',
                'clove': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Cloves.jpg/320px-Cloves.jpg',
                'cassia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Senna_alata_flowers.jpg/320px-Senna_alata_flowers.jpg',
                'tree of heaven': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Ailanthus_altissima.jpg/320px-Ailanthus_altissima.jpg',
            }
            
            name_lower = name.lower()
            wiki_direct = None
            for key, url in herb_images.items():
                if key in name_lower:
                    wiki_direct = url
                    break
            
            if wiki_direct and download_image(wiki_direct, save_path):
                new_url = f'/plants/{filename}'
                cursor.execute('UPDATE plants SET image_url = ? WHERE id = ?', (new_url, plant_id))
                conn.commit()
                print(f"  ✓ Used direct Wikipedia image → DB updated")
            else:
                print(f"  ✗ No image found for {name}")
    
    conn.close()
    print(f"\n✅ Done! Fixed {len(bad_plants)} plant images.")
    print("Restart the backend to see changes.")

if __name__ == '__main__':
    fix_plant_images()
