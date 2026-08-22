import os
from PIL import Image

def process_assets():
    os.makedirs('public/assets', exist_ok=True)
    
    # 1. Floor plan
    if os.path.exists('converted_assets/plano.png'):
        img = Image.open('converted_assets/plano.png')
        img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        img.save('public/assets/plano_map.png', 'PNG', optimize=True)
        print("Floor plan saved.")

    # 2. Guillo Character Texture & Portrait
    if os.path.exists('converted_assets/IMG_2245.png'):
        img = Image.open('converted_assets/IMG_2245.png')
        # Full character cutout/standee
        img_full = img.copy()
        img_full.thumbnail((800, 1200), Image.Resampling.LANCZOS)
        img_full.save('public/assets/guillo_full.png', 'PNG')
        
        # Face crop
        w, h = img.size
        # Guillo's face is roughly in upper 25%-45% center
        face_crop = img.crop((int(w*0.35), int(h*0.30), int(w*0.62), int(h*0.48)))
        face_crop.thumbnail((400, 400), Image.Resampling.LANCZOS)
        face_crop.save('public/assets/guillo_face.png', 'PNG')

        # Heart balloon crop
        balloon_crop = img.crop((int(w*0.36), int(h*0.38), int(w*0.58), int(h*0.50)))
        balloon_crop.thumbnail((300, 300), Image.Resampling.LANCZOS)
        balloon_crop.save('public/assets/heart_balloon.png', 'PNG')
        print("Guillo assets saved.")

    # 3. Carpet texture
    if os.path.exists('converted_assets/IMG_4354.png'):
        img = Image.open('converted_assets/IMG_4354.png')
        w, h = img.size
        # Bottom carpet area
        carpet_crop = img.crop((int(w*0.3), int(h*0.6), int(w*0.7), int(h*0.95)))
        carpet_crop = carpet_crop.resize((512, 512), Image.Resampling.LANCZOS)
        carpet_crop.save('public/assets/carpet_texture.jpg', 'JPEG', quality=85)
        
        # Cubicle fabric
        cubicle_crop = img.crop((int(w*0.35), int(h*0.4), int(w*0.45), int(h*0.65)))
        cubicle_crop = cubicle_crop.resize((512, 512), Image.Resampling.LANCZOS)
        cubicle_crop.save('public/assets/cubicle_fabric.jpg', 'JPEG', quality=85)

        # Whiteboard
        wb_crop = img.crop((int(w*0.465), int(h*0.335), int(w*0.53), int(h*0.43)))
        wb_crop = wb_crop.resize((512, 384), Image.Resampling.LANCZOS)
        wb_crop.save('public/assets/whiteboard.png', 'PNG')
        print("Office textures saved.")

    # 4. Birthday Banner
    if os.path.exists('converted_assets/IMG_9457.png'):
        img = Image.open('converted_assets/IMG_9457.png')
        w, h = img.size
        banner_crop = img.crop((int(w*0.35), int(h*0.53), int(w*0.66), int(h*0.64)))
        banner_crop.save('public/assets/birthday_banner.png', 'PNG')
        print("Birthday banner saved.")

    # 5. Snacks Table
    if os.path.exists('converted_assets/IMG_2843.png'):
        img = Image.open('converted_assets/IMG_2843.png')
        img_thumb = img.copy()
        img_thumb.thumbnail((800, 800), Image.Resampling.LANCZOS)
        img_thumb.save('public/assets/snacks_table.png', 'PNG')
        print("Snacks table saved.")

if __name__ == '__main__':
    process_assets()
