import fitz   # PyMuPDF
from docx import Document as DocxDocument

def parse_pdf(file_path: str) -> tuple[str, int]:
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text, len(doc)

def parse_docx(file_path: str) -> tuple[str, int]:
    doc = DocxDocument(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text, 0   # page count not available for docx

def parse_txt(file_path: str) -> tuple[str, int]:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read(), 0

def parse_file(file_path: str) -> tuple[str, int]:
    if file_path.endswith(".pdf"):
        return parse_pdf(file_path)
    elif file_path.endswith(".docx"):
        return parse_docx(file_path)
    else:
        return parse_txt(file_path)