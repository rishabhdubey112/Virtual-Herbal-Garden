import sqlite3, os
conn = sqlite3.connect('herbal_garden.db')
rows = conn.execute('SELECT id, name, category FROM plants').fetchall()
print(f"Total plants: {len(rows)}")
for r in rows:
    print(f"  [{r[0]}] {r[1]} ({r[2]})")
conn.close()
