import sqlite3

def update_all_seasons():
    conn = sqlite3.connect('herbal_garden.db')
    cursor = conn.cursor()

    plant_seasons = {
        'Tulsi': 'Summer, Monsoon (Thrives best in warm climates)',
        'Aloe Vera': 'Summer, Spring (Needs bright indirect sunlight)',
        'Ginger': 'Monsoon, Autumn (Prefers warm, humid environments)',
        'Ashwagandha': 'Autumn, Winter (Best planted in late monsoon)',
        'Turmeric': 'Monsoon (Requires heavy rainfall and hot climate)',
        'Neem': 'Summer (Extremely drought-resistant, thrives in hot weather)',
        'Peppermint': 'Spring, Summer (Needs moist soil and partial shade)',
        'Lavender': 'Summer (Blooms from early to late summer, loves full sun)',
        'Chamomile': 'Spring, Early Summer (Requires cool conditions)',
        'Giloy': 'Monsoon (Climber plant, needs support and warm rain)',
        'Moringa': 'Spring, Summer (Fast-growing, highly drought resistant)',
        'Amla': 'Autumn, Winter (Fruits mature from autumn to winter)',
        'Brahmi': 'Monsoon (Wetland plant, thrives in heavily soaked soil)',
        'Triphala': 'All Seasons (Dried fruit blend formulation)',
        'Shatavari': 'Summer, Autumn (Roots are harvested in early winter)',
        'Fenugreek': 'Winter, Spring (Cool season crop, sown in late autumn)',
        'Guava': 'Monsoon, Winter (Needs warm tropical conditions)',
        'Pomegranate': 'Monsoon, Spring (Best planted in warm climates)',
        'Papaya': 'Spring, Summer (Requires warm, tropical climate)',
        'Lemon': 'Spring, Monsoon (Needs full sun and well-drained soil)',
        'Jamun': 'Summer, Monsoon (Native tropical tree, thrives in rain)',
        'Clove': 'Monsoon (Requires humid tropical climate)',
        'Cassia fistula': 'Summer (Blooms brightly in peak heat)',
        'Apple': 'Winter, Spring (Requires cold chilling hours)',
        'Marigold': 'Winter, Spring (Blooms best in cool dry weather)',
        'Holy Basil': 'Summer, Monsoon (Thrives best in warm climates)',
        'Mango Leaf': 'Summer, Monsoon (Tropical evergreen tree)'
    }

    # Iterate over all plants in the db
    cursor.execute('SELECT id, name FROM plants')
    plants = cursor.fetchall()
    
    updated_count = 0
    for p_id, p_name in plants:
        # Match plant_name to keys in plant_seasons
        matched_season = "All Seasons"
        for key, season in plant_seasons.items():
            if key.lower() in p_name.lower():
                matched_season = season
                break
        
        # Only update if necessary or to re-apply the correct logic
        cursor.execute("UPDATE plants SET season = ? WHERE id = ?", (matched_season, p_id))
        updated_count += 1
        print(f"Set '{p_name}' -> {matched_season}")

    conn.commit()
    conn.close()
    print(f"\nUpdated seasons for {updated_count} plants successfully!")

if __name__ == '__main__':
    update_all_seasons()
