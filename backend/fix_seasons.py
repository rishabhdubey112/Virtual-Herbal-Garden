import sqlite3

def update_seasons():
    conn = sqlite3.connect('herbal_garden.db')
    cursor = conn.cursor()

    updates = [
        ("Monsoon, Spring (Best planted in warm climates)", "Pomegranate"),
        ("Spring, Summer (Requires warm, tropical climate)", "Papaya"),
        ("Spring, Monsoon (Needs full sun and well-drained soil)", "Lemon"),
        ("Summer, Monsoon (Native tropical tree, thrives in rain)", "Jamun")
    ]

    for season, plant_name in updates:
        cursor.execute("UPDATE plants SET season = ? WHERE name LIKE ?", (season, f'%{plant_name}%'))
        print(f"Updated {plant_name} to: {season}")

    conn.commit()
    conn.close()
    print("Seasons updated successfully!")

if __name__ == '__main__':
    update_seasons()
