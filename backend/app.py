from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_db, get_db_connection
from model import predict_plant, predict_from_text, predict_remedy
import os
import shutil
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Allow requests from the React dev server and production
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "https://virtual-herbal-garden-chi.vercel.app"])
# Initialize the database on startup
init_db()

# Custom migration for new tables without wiping DB
conn = get_db_connection()
conn.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_name TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
''')
conn.commit()
conn.close()

def _auto_add_plant(result, image_temp_path=None):
    if not result.get('is_herbal', True) or result.get('plant') in ['Not a Herbal Plant', 'Identification Failed', 'Identification Offline']:
        return result
        
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if exists
    cursor.execute('SELECT id FROM plants WHERE name LIKE ? OR scientific LIKE ?', 
                   (result['plant'], result['scientific_name']))
    existing = cursor.fetchone()
    
    if not existing and result.get('plant') not in ['Unknown Plant', None, '']:
        # Save image permanently — try uploaded image first
        image_url = None

        if image_temp_path and os.path.exists(image_temp_path):
            import string
            safe_name = "".join([c for c in result['plant'].lower().replace(' ', '_') if c.isalpha() or c == '_'])
            filename = f"auto_{safe_name}.jpg"
            frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'plants'))
            os.makedirs(frontend_dir, exist_ok=True)
            save_path = os.path.join(frontend_dir, filename)
            try:
                shutil.copy2(image_temp_path, save_path)
                image_url = f'/plants/{filename}'
                print(f"[INFO] Auto-saved plant image: {filename}")
            except Exception as e:
                print(f"[WARN] Failed to copy image for auto-add: {e}")

        # For text queries or if copy failed — use Unsplash with plant name search
        if not image_url:
            plant_query = result['plant'].replace(' ', '+').lower()
            image_url = f"https://source.unsplash.com/400x300/?{plant_query},plant,herb"
            print(f"[INFO] Using Unsplash fallback image for: {result['plant']}")

        desc = f"{result.get('analysis_note', '')}\n\nKey Features: {result.get('key_features', '')}\nHabitat: {result.get('habitat', '')}"
        try:
            cursor.execute(
                'INSERT INTO plants (name, scientific, description, uses, benefits, category, image_url, season) VALUES (?,?,?,?,?,?,?,?)',
                (result['plant'], result['scientific_name'], desc, 
                 'Identified and sourced from independent user upload.', result['benefits'], 'Newly Discovered', image_url, result.get('growing_season', 'All Seasons'))
            )
            conn.commit()
            result['added_to_library'] = True
            print(f"[INFO] Plant auto-added: {result['plant']}")
        except Exception as e:
            print(f"[ERR] Failed DB insert for auto-add: {e}")
            result['added_to_library'] = False
    else:
        result['added_to_library'] = False
        
    conn.close()
    return result

# ====================== PLANT ENDPOINTS ======================

@app.route('/plants', methods=['GET'])
def get_plants():
    conn = get_db_connection()
    cursor = conn.cursor()

    category = request.args.get('category')
    search = request.args.get('search')

    query = 'SELECT * FROM plants WHERE 1=1'
    params = []

    if category:
        query += ' AND category = ?'
        params.append(category)

    if search:
        query += ' AND (name LIKE ? OR scientific LIKE ? OR uses LIKE ? OR benefits LIKE ?)'
        s = f'%{search}%'
        params.extend([s, s, s, s])

    cursor.execute(query, params)
    plants = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({"success": True, "plants": plants})


@app.route('/plant/<path:name>', methods=['GET'])
def get_plant_by_name(name):
    conn = get_db_connection()
    cursor = conn.cursor()
    name = name.replace('-', ' ')
    cursor.execute('SELECT * FROM plants WHERE name LIKE ?', (f'%{name}%',))
    plant = cursor.fetchone()
    conn.close()
    if plant:
        return jsonify({"success": True, "plant": dict(plant)})
    return jsonify({"success": False, "message": "Plant not found"}), 404


@app.route('/add-plant', methods=['POST'])
def add_plant():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO plants (name, scientific, description, uses, benefits, category, image_url, price) VALUES (?,?,?,?,?,?,?,?)',
            (data.get('name', ''), data.get('scientific', ''), data.get('description', ''),
             data.get('uses', ''), data.get('benefits', ''), data.get('category', ''), data.get('image_url', ''), data.get('price', 200))
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "message": "Plant added", "id": new_id}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/update-plant/<int:id>', methods=['PUT'])
def update_plant(id):
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE plants SET name=?, scientific=?, description=?, uses=?, benefits=?, category=?, image_url=?, price=? WHERE id=?',
            (data.get('name', ''), data.get('scientific', ''), data.get('description', ''),
             data.get('uses', ''), data.get('benefits', ''), data.get('category', ''), data.get('image_url', ''), data.get('price', 200), id)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Plant updated"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/delete-plant/<int:id>', methods=['DELETE'])
def delete_plant(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM plants WHERE id=?', (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Plant deleted"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ====================== AUTH ENDPOINTS ======================

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                       (name, email, hashed_password))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({
            "success": True, 
            "message": "Registration successful", 
            "user": {"id": new_id, "name": name, "email": email}
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Missing email or password"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user['password'], password):
        return jsonify({
            "success": True, 
            "message": "Login successful", 
            "user": {"id": user['id'], "name": user['name'], "email": user['email']}
        }), 200
    else:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

# ====================== USER ACTIVITY ENDPOINTS ======================

def log_user_action(user_id, plant_name, action_type):
    if not user_id or not plant_name:
        return
    try:
        conn = get_db_connection()
        conn.execute('INSERT INTO user_history (user_id, plant_name, action_type) VALUES (?, ?, ?)',
                     (user_id, plant_name, action_type))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging user action: {e}")

@app.route('/user/stats/<int:user_id>', methods=['GET'])
def user_stats(user_id):
    try:
        conn = get_db_connection()
        searches = conn.execute("SELECT COUNT(*) FROM user_history WHERE user_id = ? AND action_type = 'search'", (user_id,)).fetchone()[0]
        saves = conn.execute("SELECT COUNT(*) FROM user_history WHERE user_id = ? AND action_type = 'save'", (user_id,)).fetchone()[0]
        conn.close()
        return jsonify({"success": True, "searches": searches, "saves": saves})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/user/save', methods=['POST'])
def save_plant():
    data = request.json
    user_id = data.get('userId')
    plant_name = data.get('plantName')
    if not user_id or not plant_name:
         return jsonify({"success": False, "message": "Missing fields"}), 400
    try:
        conn = get_db_connection()
        existing = conn.execute("SELECT id FROM user_history WHERE user_id = ? AND plant_name = ? AND action_type = 'save'", (user_id, plant_name)).fetchone()
        if existing:
            conn.close()
            return jsonify({"success": True, "message": "Already saved"})
        
        conn.execute("INSERT INTO user_history (user_id, plant_name, action_type) VALUES (?, ?, 'save')", (user_id, plant_name))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Saved successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ====================== AI PREDICT ENDPOINTS ======================

@app.route('/predict', methods=['POST'])
def predict():
    # --- Image Upload ---
    if 'image' in request.files:
        file = request.files['image']
        user_id = request.form.get('userId')
        if file.filename != '':
            temp_path = os.path.join(os.path.dirname(__file__), f'temp_{file.filename}')
            file.save(temp_path)
            
            # Make a backup copy so auto_add_plant can always access the image
            backup_path = temp_path + '_backup.jpg'
            try:
                shutil.copy2(temp_path, backup_path)
            except:
                backup_path = temp_path

            result = predict_plant(temp_path)
            result = _auto_add_plant(result, backup_path)
            
            # Fix: use result['plant'] not result['name'] for search tracking
            plant_name = result.get('plant', '')
            if user_id and plant_name and plant_name not in ['Unknown Plant', 'Not a Herbal Plant', 'Identification Failed', 'Identification Offline', '']:
                log_user_action(user_id, plant_name, 'search')
                
            # Cleanup both temp files
            for p in [temp_path, backup_path]:
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except:
                        pass

            if result.get('plant') in ['Identification Failed', 'Identification Offline']:
                return jsonify({"success": False, "message": result.get('analysis_note', 'Identification failed.'), "prediction": result})

            return jsonify({"success": True, "prediction": result})

    # --- Text Query ---
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()
    user_id = data.get('userId')
    if text:
        result = predict_from_text(text)
        result = _auto_add_plant(result, None)
        
        # Fix: use result['plant'] not result['name'] for search tracking
        plant_name = result.get('plant', '')
        if user_id and plant_name and plant_name not in ['Unknown Plant', 'Not a Herbal Plant', 'Identification Failed', 'Identification Offline', '']:
            log_user_action(user_id, plant_name, 'search')
             
        if result.get('plant') in ['Identification Failed', 'Identification Offline']:
            return jsonify({"success": False, "message": result.get('analysis_note', 'Identification failed.'), "prediction": result})

        return jsonify({"success": True, "prediction": result})

    return jsonify({"success": False, "message": "Provide an image file or text query"}), 400

# ====================== AI REMEDY EXPERT =====================

@app.route('/consult', methods=['POST'])
def consult_remedy():
    data = request.get_json(silent=True) or {}
    symptoms = data.get('symptoms', '').strip()
    
    if not symptoms:
        return jsonify({"success": False, "message": "Please describe your symptoms"}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM plants")
        all_plants = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        ai_response = predict_remedy(symptoms, all_plants)
        recommendations = ai_response.get("recommendations")
        if not isinstance(recommendations, list):
            raise ValueError("AI returned invalid remedy format.")
        if len(recommendations) == 0:
            return jsonify({"success": False, "message": "AI could not generate any remedies right now. Please check your symptoms or the backend AI configuration."}), 500
        
        enriched = []
        for rec in recommendations:
            plant_name = rec.get("plant_name", "").strip().lower()
            matched = next((p for p in all_plants if plant_name and (
                plant_name in p["name"].lower()
                or p["name"].lower() in plant_name
                or plant_name in p.get("scientific", "").lower()
                or p.get("scientific", "").lower() in plant_name
            )), None)
            if matched:
                rec["plant_details"] = matched
            enriched.append(rec)
                
        return jsonify({"success": True, "recommendations": enriched})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ====================== ORDER ENDPOINTS ======================

@app.route('/place-order', methods=['POST'])
def place_order():
    data = request.json
    user_id = data.get('userId')  # can be None for guest
    items = data.get('items')     # stringified JSON of items
    total_price = data.get('totalPrice')
    address = data.get('address')
    payment_method = data.get('paymentMethod')

    if not items or total_price is None:
        return jsonify({"success": False, "message": "Missing items or total price"}), 400

    try:
        conn = get_db_connection()
        conn.execute('INSERT INTO orders (user_id, items, total_price, address, payment_method) VALUES (?, ?, ?, ?, ?)',
                     (user_id, items, total_price, str(address) if address else None, payment_method))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Order placed successfully"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/user/orders/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
        orders = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "orders": orders}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ====================== REVIEW ENDPOINTS =====================

@app.route('/reviews', methods=['POST'])
def add_review():
    data = request.json
    plant_name = data.get('plantName')
    user_name = data.get('userName')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not all([plant_name, user_name, rating]):
        return jsonify({"success": False, "message": "Missing required review fields"}), 400

    try:
        conn = get_db_connection()
        conn.execute('INSERT INTO reviews (plant_name, user_name, rating, comment) VALUES (?, ?, ?, ?)',
                     (plant_name, user_name, rating, comment))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Review added successfully!"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/reviews/<plant_name>', methods=['GET'])
def get_reviews(plant_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM reviews WHERE plant_name = ? ORDER BY created_at DESC', (plant_name,))
        reviews = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "reviews": reviews}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
