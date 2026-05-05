import os
from functools import lru_cache
from google import genai
from google.genai import types

DEFAULT_LABELS = [
    "Groceries", "Dining", "Transportation", "Utilities",
    "Rent", "Entertainment", "Other"
]

@lru_cache(maxsize=1)
def get_labels() -> tuple:
    raw = os.getenv("CATEGORIES")
    if raw:
        labels = [x.strip() for x in raw.split(",") if x.strip()]
        return tuple(labels) if labels else tuple(DEFAULT_LABELS)
    return tuple(DEFAULT_LABELS)


def categorize_text(description: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return "Other"

    labels = get_labels()
    labels_str = ", ".join(labels)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f'Categorize this bank transaction into exactly one of these categories: {labels_str}\n\nTransaction: "{description}"\n\nReply with only the category name, nothing else.',
            config=types.GenerateContentConfig(
                max_output_tokens=10,
                temperature=0,
            ),
        )
        result = response.text.strip()
        # Validate the response is one of the known labels
        for label in labels:
            if label.lower() == result.lower():
                return label
        return "Other"
    except Exception:
        return "Other"
