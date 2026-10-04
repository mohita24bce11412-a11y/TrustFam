import pytesseract
from PIL import Image, ImageOps
import io
from app.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def process_image_ocr(image_bytes: bytes) -> tuple[str, bool]:
    # EXIF stripping & preprocessing
    image = Image.open(io.BytesIO(image_bytes))
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")  # Grayscale conversion

    # Run Tesseract with English + Hindi support
    data = pytesseract.image_to_data(image, lang="eng+hin", output_type=pytesseract.Output.DICT)
    
    texts = []
    confidences = []

    for i in range(len(data["text"])):
        txt = data["text"][i].strip()
        conf = int(data["conf"][i])
        if txt and conf > -1:
            texts.append(txt)
            confidences.append(conf)

    full_text = " ".join(texts)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    low_confidence = avg_confidence < 50.0  # Flag if confidence < 50%

    return full_text, low_confidence