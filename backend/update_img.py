import sqlite3

def update():
    conn = sqlite3.connect('herbal_garden.db')
    c = conn.cursor()
    
    fruits = [
        ("Pomegranate", "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/d/d4/Pomegranate_fruit_with_cut_open_view.jpg&w=800"),
        ("Papaya", "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/8/87/Papaya_cross_section_BNC.jpg&w=800"),
        ("Lemon", "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/e4/Lemon.jpg&w=800"),
        ("Jamun (Black Plum)", "https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/9/90/Syzygium_cumini_1_%282%29.JPG&w=800")
    ]
    
    for name, img in fruits:
        c.execute('UPDATE plants SET image_url=? WHERE name=?', (img, name))
        
    conn.commit()
    conn.close()
    print("Database image URLs updated successfully via proxy.")

if __name__ == '__main__':
    update()
