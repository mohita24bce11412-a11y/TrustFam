from io import BytesIO

from PIL import Image
import pytesseract


def process_image_ocr(contents: bytes) -> tuple[str, bool]:
    """
    Extract text from an uploaded image.

    Returns:
        extracted_text: OCR-extracted text
        low_confidence: whether the OCR result appears unreliable
    """
    try:
        image = Image.open(BytesIO(contents))
        image = image.convert("RGB")

        extracted_text = pytesseract.image_to_string(
            image,
            config="--psm 6",
        ).strip()

        low_confidence = len(extracted_text) < 10

        return extracted_text, low_confidence

    except Exception as exc:
        raise ValueError(f"Unable to process image: {exc}") from exc
