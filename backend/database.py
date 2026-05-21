import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'herbal_garden.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS plants (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            scientific  TEXT,
            description TEXT,
            uses        TEXT,
            benefits    TEXT,
            category    TEXT,
            image_url   TEXT,
            season      TEXT DEFAULT 'All Seasons'
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            plant_name  TEXT NOT NULL,
            action_type TEXT NOT NULL,
            timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER,
            items          TEXT NOT NULL,
            total_price    REAL NOT NULL,
            status         TEXT DEFAULT 'Processing',
            address        TEXT,
            payment_method TEXT,
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')


    cursor.execute('SELECT COUNT(*) FROM plants')
    count = cursor.fetchone()[0]

    if count == 0:
        seed_data = [
            (
                'Holy Basil (Tulsi)',
                'Ocimum sanctum',
                'Holy Basil, known as Tulsi in India, is a sacred herb revered in Ayurveda for over 3,000 years. It is a small aromatic shrub with green or purple leaves that grows across Southeast Asia. The plant emits a pleasant clove-like fragrance and is commonly found in Hindu households as a sacred plant.',
                'Leaves are brewed into herbal tea, crushed for juice, used in oil extraction, and added to kadha (decoction). Fresh leaves are chewed daily for health benefits. Tulsi drops are added to water for purification.',
                'Boosts immunity, relieves cough and cold, reduces stress and anxiety, lowers blood sugar, has anti-inflammatory and antibacterial properties, supports respiratory health.',
                'Immunity',
                '/plants/tulsi_plant.png',
                'Summer, Monsoon (Thrives best in warm climates)'
            ),
            (
                'Aloe Vera',
                'Aloe barbadensis miller',
                'Aloe Vera is a succulent plant species that originated in the Arabian Peninsula but now grows wild in tropical, semi-tropical, and arid climates worldwide. It has thick, fleshy, green-to-grey green leaves with serrated margins. The gel-like substance found inside the leaves is 99% water and is known for its remarkable healing properties.',
                'Gel is applied topically on burns, sunburns, and wounds. Consumed as Aloe Vera juice for digestive health. Used in cosmetics, creams, lotions, and shampoos. Acts as a natural laxative when taken in small doses.',
                'Soothes skin irritation and burns, accelerates wound healing, reduces constipation, controls blood sugar, has antioxidant and antibacterial properties, supports dental health.',
                'Skin Care',
                '/plants/aloe_vera.png',
                'Summer, Spring (Needs bright indirect sunlight and minimal water)'
            ),
            (
                'Ginger',
                'Zingiber officinale',
                'Ginger is a flowering plant whose rhizome (underground stem) is widely used as a spice and folk medicine worldwide. It is a herbaceous perennial that grows to about 1 meter tall and is native to Southeast Asia. The root has a warm, spicy, pungent taste and has been used in traditional medicine for thousands of years.',
                'Used fresh, dried, powdered, or as oil and juice. Added to teas, cooking, and digestive tonics. Ginger candy and ginger ale are popular remedies for nausea. Ginger essential oil is used in aromatherapy.',
                'Treats nausea and motion sickness, aids digestion, reduces muscle pain and soreness, has powerful anti-inflammatory effects, helps fight infections, lowers blood sugar levels.',
                'Digestion',
                '/plants/ginger_plant.png',
                'Monsoon, Autumn (Prefers warm, humid environments and rich soil)'
            ),
            (
                'Ashwagandha',
                'Withania somnifera',
                'Ashwagandha is one of the most important herbs in Ayurveda, classified as an adaptogen — meaning it helps the body manage stress. It is a small shrub with yellow flowers that is native to India and North Africa. The root and berries of the plant are used medicinally and have a distinctive horse-like smell, hence the Sanskrit name meaning "smell of horse."',
                'Root powder consumed with warm milk and honey. Available as capsules, tablets, and liquid extracts. Used in traditional Ayurvedic formulations for rejuvenation. Root oil is applied for joint pain.',
                'Reduces stress and anxiety, improves brain function and memory, boosts testosterone and fertility in men, enhances physical performance, reduces inflammation, improves sleep quality.',
                'Stress Relief',
                '/plants/ashwagandha_plant.png',
                'Autumn, Winter (Best planted in late monsoon, harvested in dry season)'
            ),
            (
                'Turmeric',
                'Curcuma longa',
                'Turmeric is a rhizomatous herbaceous perennial plant native to the Indian subcontinent and Southeast Asia. It requires temperatures between 20°C and 30°C and significant rainfall to thrive. The bright yellow-orange powder derived from its dried rhizome is one of the most widely used herbal supplements in the world, famous for its active compound curcumin.',
                'Used in cooking as a spice and color agent (curry). Consumed as golden milk with warm milk. Applied topically as a face pack for glowing skin. Used in wound healing pastes. Available as capsules and supplements.',
                'Powerful anti-inflammatory and antioxidant, improves brain function, lowers risk of heart disease, helps prevent and treat cancer, beneficial in arthritis, delays cognitive decline.',
                'Immunity',
                '/plants/turmeric_plant.png',
                'Monsoon (Requires heavy rainfall and hot climate)'
            ),
            (
                'Neem',
                'Azadirachta indica',
                'Neem is a fast-growing evergreen tree native to the Indian subcontinent. It can grow up to 15–20 meters tall and has been used in Ayurvedic medicine for more than 4,000 years. Every part of the neem tree — leaves, bark, seeds, flowers, and fruit — has medicinal properties. It has a distinctly bitter taste and a strong odor.',
                'Leaves used for skin conditions, dental care (neem twigs as toothbrush), and blood purification. Neem oil applied for hair and scalp health. Bark decoction used for fever and pain. Seed oil used as natural pesticide.',
                'Powerful antibacterial and antifungal, treats skin disorders (acne, psoriasis, eczema), supports dental health, acts as natural pesticide, detoxifies blood, boosts immunity.',
                'Skin Care',
                '/plants/neem_plant.png',
                'Summer (Extremely drought-resistant, thrives in hot weather)'
            ),
            (
                'Peppermint',
                'Mentha piperita',
                'Peppermint is a hybrid mint — a cross between watermint and spearmint. It is a fast-growing, aromatic perennial herb with dark green leaves and purple-tinged stems. Native to Europe and the Middle East, it is now cultivated worldwide. The primary active component is menthol, which gives peppermint its characteristic cooling sensation.',
                'Peppermint tea is consumed for digestion and headaches. Peppermint oil is applied to the temples for tension headaches. Used in toothpaste, chewing gum, and candy. Essential oil is used in aromatherapy.',
                'Relieves headaches and migraines, soothes digestive issues (IBS, bloating, gas), freshens breath, improves energy and alertness, relieves nasal congestion, reduces nausea.',
                'Digestion',
                '/plants/peppermint_plant.png',
                'Spring, Summer (Needs moist soil and partial shade)'
            ),
            (
                'Lavender',
                'Lavandula angustifolia',
                'Lavender is a flowering plant in the mint family native to the Mediterranean region. It is an evergreen shrub that produces violet-blue flowers on slender, branching stems. Known for its beautiful fragrance, lavender has been used for centuries in perfumes, sachets, and medicine. The name lavender comes from the Latin word "lavare" meaning to wash.',
                'Essential oil used in aromatherapy for relaxation. Lavender tea consumed before sleep. Oil applied topically for cuts, burns, and insect bites. Used in bath products, pillows, and sachets. Flowers used in cooking and baking.',
                'Reduces anxiety and emotional stress, helps with insomnia and sleep disorders, relieves pain and headaches, heals skin conditions including acne, anti-inflammatory effects, natural antidepressant.',
                'Stress Relief',
                '/plants/lavender_plant.png',
                'Summer (Blooms from early to late summer, loves full sun)'
            ),
            (
                'Chamomile',
                'Matricaria chamomilla',
                'Chamomile is one of the most ancient medicinal herbs known to mankind. It is a daisy-like plant belonging to the Asteraceae family, native to Europe and Western Asia. It has feathery green leaves and white flowers with bright yellow centers. Chamomile is the world\'s most popular single herb tea, consumed by millions daily.',
                'Widely consumed as herbal tea for relaxation and sleep. Chamomile oil used in aromatherapy. Applied topically as cream for skin inflammation. Used in hair rinses for natural highlights. Available as tinctures and supplements.',
                'Promotes sleep and treats insomnia, reduces anxiety and promotes calm, treats cold symptoms, soothes stomach issues (gas, bloating), reduces inflammation, promotes skin health, relieves menstrual pain.',
                'Stress Relief',
                '/plants/chamomile_plant.png',
                'Spring, Early Summer (Requires cool conditions, blooms quickly)'
            ),
            (
                'Giloy (Guduchi)',
                'Tinospora cordifolia',
                'Giloy, also known as Guduchi or Amrita (Sanskrit for "nectar of immortality"), is a climbing shrub native to India. It is a large, deciduous, extensively climbing shrub with greenish-yellow flowers and heart-shaped leaves. In Ayurveda, Giloy is considered one of the most divine herbs and is used to treat a wide range of conditions.',
                'Consumed as juice, powder, or decoctions. Giloy tablets are available as immunity supplements. The stem is the most widely used part. Giloy kadha (decoction) is popular during fever and dengue recovery.',
                'Powerful immunity booster, treats chronic fever and dengue, reduces inflammation and arthritis pain, improves digestion, manages diabetes by regulating blood sugar, acts as an adaptogen for stress.',
                'Immunity',
                '/plants/giloy_plant.png',
                'Monsoon (Climber plant, needs support and warm rain to grow)'
            ),
            (
                'Moringa',
                'Moringa oleifera',
                'Moringa oleifera, commonly known as the drumstick tree or miracle tree, is a fast-growing, drought-resistant tree native to South Asia. It is considered one of the most nutritious plants discovered, as almost every part of the tree — leaves, pods, seeds, and flowers — can be consumed. The leaves are exceptionally rich in vitamins and minerals.',
                'Leaves consumed fresh in salads or cooked as vegetables. Moringa powder added to smoothies and drinks. Seed oil (ben oil) used in cooking and cosmetics. Leaf extract available as supplements. Pods cooked in curries.',
                'Highly nutritious (rich in vitamins A, C, E and minerals), reduces inflammation, lowers blood sugar, lowers cholesterol, protects against arsenic toxicity, antibacterial properties, improves heart health.',
                'Immunity',
                '/plants/moringa_plant.png',
                'Spring, Summer (Fast-growing, highly drought resistant)'
            ),
            (
                'Amla (Indian Gooseberry)',
                'Phyllanthus emblica',
                'Amla, or Indian Gooseberry, is a deciduous tree native to tropical and subtropical regions of South and Southeast Asia. The fruit is small, green, and translucent with a bitter, sour, and astringent taste. It is one of the richest natural sources of Vitamin C in the world, containing 20 times more Vitamin C than an orange. It is fundamental to Ayurvedic medicine.',
                'Consumed fresh, dried, pickled, or as chyawanprash. Amla juice is consumed daily for health benefits. Used in hair oils and shampoos for hair growth. Amla powder used in cooking and as supplements.',
                'Richest natural source of Vitamin C, powerful antioxidant, boosts immunity, improves hair growth and prevents greying, enhances digestion, rejuvenates cells, controls diabetes, liver tonic.',
                'Immunity',
                '/plants/amla_plant.png',
                'Autumn, Winter (Fruits mature from autumn to winter)'
            ),
            (
                'Brahmi',
                'Bacopa monnieri',
                'Brahmi is a non-aromatic herb native to wetlands of South and East Asia, Australia, Europe, Africa, and the Americas. It is a creeping herb with succulent leaves and small white flowers. It thrives in wet soil and can grow in shallow water. In Ayurveda, Brahmi is considered the most important herb for brain and nervous system health.',
                'Consumed as powder with milk or honey. Brahmi oil applied on scalp for memory and hair growth. Available as capsules, liquid extracts, and teas. Used in traditional tonics for children\'s brain development.',
                'Significantly enhances memory and brain function, reduces anxiety and stress, treats ADHD, acts as a powerful antioxidant, reduces inflammation, may help prevent Alzheimer\'s, improves hair health.',
                'Stress Relief',
                '/plants/brahmi_plant.png',
                'Monsoon (Wetland plant, thrives in heavily soaked soil)'
            ),
            (
                'Triphala',
                'Terminalia chebula / Emblica / Belerica',
                'Triphala is a traditional Ayurvedic herbal formulation consisting of three dried fruits — Amalaki (Amla), Bibhitaki, and Haritaki. It has been used in Ayurvedic medicine for thousands of years and is one of the most widely used formulations in the Ayurvedic system. The name means "three fruits" in Sanskrit and represents a balanced combination of tastes.',
                'Taken as powder with warm water before bed. Available as tablets and capsules. Used as colon cleanse in detox programs. Triphala ghrita used for eye health. Applied externally for wounds.',
                'Improves digestion and bowel movements, powerful antioxidant combination, promotes dental health, natural laxative for constipation, supports eye health, helps in weight management, reduces inflammation.',
                'Digestion',
                '/plants/triphala_plant.png',
                'All Seasons (Dried fruit blend formulation)'
            ),
            (
                'Shatavari',
                'Asparagus racemosus',
                'Shatavari is a species of asparagus native to India and the Himalayas. It is a climbing plant with modified leaves called cladodes and small white fragrant flowers. The name translates to "she who possesses 100 husbands" in Sanskrit, indicating its powerful effects on female reproductive health. It is the most important Ayurvedic herb for women.',
                'Root powder consumed with milk and ghee. Available as tablets, capsules, and liquid extracts. Added to herbal formulations for women\'s health. Used in traditional recipes for lactating mothers.',
                'Boosts female reproductive health and fertility, increases breast milk production, reduces symptoms of menopause, adaptogenic herb for stress, improves digestive health, boosts immunity, anti-ulcer properties.',
                'Immunity',
                '/plants/shatavari_plant.png',
                'Summer, Autumn (Roots are harvested in early winter)'
            ),
            (
                'Fenugreek',
                'Trigonella foenum-graecum',
                'Fenugreek is an annual plant in the family Fabaceae that is native to Asia and the Mediterranean region. It grows to about 60–90 cm tall with small white flowers and long pods containing 10–20 golden-brown seeds. It has a distinctive sharp, maple-syrup-like aroma. It is used both as an herb (dried or fresh leaves) and as a spice (seeds).',
                'Seeds used as a spice in cooking (curry powders, spice blends). Leaves used fresh and dried in cooking. Seeds soaked overnight consumed as a health tonic. Fenugreek tea consumed for blood sugar. Applied as paste for hair conditioning.',
                'Controls blood sugar and manages diabetes, boosts testosterone and sperm count, enhances milk production in breastfeeding mothers, reduces cholesterol, aids weight loss, anti-inflammatory properties.',
                'Digestion',
                '/plants/fenugreek_plant.png',
                'Winter, Spring (Cool season crop, sown in late autumn)'
            ),
        ]

        cursor.executemany('''
            INSERT INTO plants (name, scientific, description, uses, benefits, category, image_url, season)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_data)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized with 16 herbal plants.")
