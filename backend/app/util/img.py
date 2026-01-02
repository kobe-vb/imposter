import asyncio
from fastapi import APIRouter, UploadFile, Form, HTTPException
from app.services.phases.Lobby import Lobby
from PIL import Image
import io, os

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
THUMBNAIL_SIZES = {
    "sm": (48, 48),
    "md": (96, 96),
    "lg": (192, 192),
}

async def check_valid_image(photo: UploadFile | None) -> bytes | None:
    if not photo:
        return None
    content = await photo.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large (max 5MB)")
    
    ext = os.path.splitext(photo.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
    
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
    except Exception:
        raise HTTPException(400, "Invalid image file")
    
    return content

def generate_thumbnails(original_path: str, player_id: str, game_code: str):
    try:
        with Image.open(original_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            thumb_dir = f"uploads/{game_code}/thumbs"
            os.makedirs(thumb_dir, exist_ok=True)

            for size_name, (width, height) in THUMBNAIL_SIZES.items():
                img_copy = img.copy()
                min_dimension = min(img_copy.size)
                left = (img_copy.width - min_dimension) // 2
                top = (img_copy.height - min_dimension) // 2
                right = left + min_dimension
                bottom = top + min_dimension
                img_square = img_copy.crop((left, top, right, bottom))
                img_resized = img_square.resize((width, height), Image.Resampling.LANCZOS)

                thumb_path = f"{thumb_dir}/{player_id}_{size_name}.jpg"
                img_resized.save(thumb_path, "JPEG", quality=85, optimize=True)
    except Exception as e:
        print(f"✗ Error bij genereren thumbnails: {e}")

async def generate_thumbnails_async(photo: UploadFile, content: bytes, player_id: str, game_code: str, phase: Lobby):
    
    if photo and content:
        game_dir = f"uploads/{game_code}"
        os.makedirs(game_dir, exist_ok=True)
        safe_filename = f"{player_id}.jpg"
        photo_path = f"{game_dir}/{safe_filename}"
        with open(photo_path, "wb") as f:
            f.write(content)

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, generate_thumbnails, photo_path, player_id, game_code)

        phase.update_player_photo(player_id, f"{game_code}/{player_id}.jpg")
        await phase.on_reconnect(player_id)

@router.post("/join/{code}")
async def join_lobby(
    code: str,
    name: str = Form(...),
    photo: UploadFile | None = None,
    phase: Lobby = None
):
    content = await check_valid_image(photo)
    player_id = await phase.add_player(name, "")
    await generate_thumbnails_async(photo, content, player_id, code, phase)
    
    return {"player_id": player_id}
