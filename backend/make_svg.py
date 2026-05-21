import os
import sqlite3

def make_svg(name, color):
    # Using a 4:3 ratio standard SVG
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="{color}"/>
      <text x="400" y="300" font-family="sans-serif, Arial" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">{name}</text>
      <text x="400" y="380" font-family="sans-serif, Arial" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">Botanical Illustration Pending</text>
    </svg>'''

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'plants'))
os.makedirs(frontend_dir, exist_ok=True)

conn = sqlite3.connect('herbal_garden.db')
c = conn.cursor()

p_svg = make_svg('Pomegranate', '#c1121f')
with open(os.path.join(frontend_dir, 'pomegranate_fruit.svg'), 'w', encoding='utf-8') as f:
    f.write(p_svg)
c.execute("UPDATE plants SET image_url=? WHERE name=?", ('/plants/pomegranate_fruit.svg', 'Pomegranate'))

j_svg = make_svg('Jamun fruit', '#4a0e4e')
with open(os.path.join(frontend_dir, 'jamun_fruit.svg'), 'w', encoding='utf-8') as f:
    f.write(j_svg)
c.execute("UPDATE plants SET image_url=? WHERE name=?", ('/plants/jamun_fruit.svg', 'Jamun (Black Plum)'))

# Wait, Lemon was successfully downloaded by my python script earlier!
# Output was: "Successfully downloaded and linked Lemon"
# So I ONLY need to replace Pomegranate and Jamun.

conn.commit()
conn.close()
print("SVG Placeholders injected successfully.")
