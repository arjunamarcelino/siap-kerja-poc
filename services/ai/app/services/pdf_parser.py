import logging
from io import BytesIO

import pdfplumber

logger = logging.getLogger(__name__)

MAX_PAGES = 10


class PDFParseError(Exception):
    """Raised when PDF text extraction fails."""

    def __init__(self, reason: str) -> None:
        self.reason = reason
        super().__init__(reason)


def extract_text_from_pdf(pdf_bytes: bytes, *, max_pages: int = MAX_PAGES) -> str:
    """Extract all text from a PDF file, limited to first max_pages pages.

    Raises PDFParseError if the file cannot be parsed or yields no text.
    """
    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            if len(pdf.pages) == 0:
                raise PDFParseError("PDF contains no pages")

            pages_text: list[str] = []
            for page in pdf.pages[:max_pages]:
                text = page.extract_text(
                    layout=True,
                    x_tolerance=3,
                    y_tolerance=3,
                ) or ""

                tables = page.extract_tables()
                table_text = _tables_to_text(tables)
                if table_text and table_text not in text:
                    text += "\n" + table_text

                pages_text.append(text.strip())

    except PDFParseError:
        raise
    except Exception as exc:
        raise PDFParseError(f"Failed to parse PDF: {exc}") from exc

    full_text = "\n\n".join(pages_text).strip()

    if len(full_text) < 50:
        raise PDFParseError(
            "Could not extract text from this PDF. "
            "It may be a scanned image. "
            "Please upload a text-based PDF (exported from Word, Google Docs, etc.)."
        )

    return full_text


def _tables_to_text(tables: list) -> str:
    """Convert extracted tables to readable text."""
    if not tables:
        return ""
    lines: list[str] = []
    for table in tables:
        for row in table:
            if row:
                cells = [str(cell).strip() if cell else "" for cell in row]
                lines.append(" | ".join(cells))
        lines.append("")
    return "\n".join(lines)
