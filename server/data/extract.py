import fitz  # PyMuPDF
import re
import json

FILE_NAMES = ["alt", "ci", "der", "eco",
              "equ", "eth", "fi", "fsa", "pm", "qua"]


def extract_questions():
  for name in FILE_NAMES:
    with fitz.open(f"./data/pdf/questions/{name}.pdf") as doc:
      cleaned_text = []

      for page in doc:
        # (x0, y0, x1, y1, text, block_no, block_type)
        blocks = page.get_text("blocks")
        page_height = page.rect.height

        for b in blocks:
          x0, y0, x1, y1, text, *_ = b

          # Skip small blocks near top (header) or bottom (footer)
          if y0 < 0.05 * page_height or y1 > 0.95 * page_height:
            continue

          paragraphs = text.split("\n")
          cleaned_paragraphs = [
              re.sub(r"\s+", " ", p).strip() for p in paragraphs if p.strip()
          ]

          print(" ".join(cleaned_paragraphs))

          print("===")

          cleaned_text.append(" ".join(cleaned_paragraphs))

    with open(f"./data/extract/questions/{name}.json", "w") as file:
      json.dump(cleaned_text, file, indent=2)


def extract_solutions():
  for name in FILE_NAMES:
    with fitz.open(f"./data/pdf/solutions/{name}.pdf") as doc:
      cleaned_text = []

      for page in doc:
          # (x0, y0, x1, y1, text, block_no, block_type)
        blocks = page.get_text("blocks")
        page_height = page.rect.height

        for b in blocks:
          x0, y0, x1, y1, text, *_ = b

          # Skip small blocks near top (header) or bottom (footer)
          if y0 < 0.05 * page_height or y1 > 0.95 * page_height:
            continue

          paragraphs = text.split("\n")
          cleaned_paragraphs = [
              re.sub(r"\s+", " ", p).strip() for p in paragraphs if p.strip()
          ]

          cleaned_text.append(" ".join(cleaned_paragraphs))

    with open(f"./data/extract/solutions/{name}.json", "w") as file:
      json.dump(cleaned_text, file, indent=2)
