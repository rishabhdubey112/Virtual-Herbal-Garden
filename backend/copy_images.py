import os
import shutil
import glob

brain_dir = r"C:\Users\deepa\.gemini\antigravity\brain\3801d5d0-84d2-4694-9013-293df7e3716a"
target_dir = r"c:\Users\deepa\OneDrive\Desktop\coding\New folder\virtual-herbal-garden\frontend\public\plants"
os.makedirs(target_dir, exist_ok=True)

for file in glob.glob(os.path.join(brain_dir, "*_plant_*.png")) + glob.glob(os.path.join(brain_dir, "aloe_vera_*.png")):
    # Extract the base name (e.g. tulsi_plant from tulsi_plant_12345.png)
    basename = os.path.basename(file)
    name_parts = basename.split('_')
    # Reconstruct name without timestamp
    final_name = "_".join(name_parts[:-1]) + ".png" if name_parts[-1].endswith(".png") and name_parts[-1][:-4].isdigit() else basename
    
    # Actually, aloe_vera_12345.png -> aloe_vera.png
    if final_name == ".png": final_name = basename # fallback
    
    shutil.copy(file, os.path.join(target_dir, final_name))
    print(f"Copied {final_name}")
