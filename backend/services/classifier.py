import os
from google import genai
from google.genai import types

DEFAULT_LABELS = [
    "Groceries", "Dining", "Transportation", "Utilities",
    "Rent", "Entertainment", "Other"
]


def get_labels() -> list:
    raw = os.getenv("CATEGORIES")
    if raw:
        labels = [x.strip() for x in raw.split(",") if x.strip()]
        return labels if labels else DEFAULT_LABELS
    return DEFAULT_LABELS


def categorize_batch(descriptions: list[str]) -> list[str]:
    """Categorize a list of transaction descriptions in a single API call."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return ["Other"] * len(descriptions)

    labels = get_labels()
    labels_str = ", ".join(labels)

    numbered = "\n".join(f"{i+1}. {desc}" for i, desc in enumerate(descriptions))

    prompt = (
        f"Categorize each bank transaction below into exactly one of these categories: {labels_str}\n\n"
        f"Rules:\n"
        f"- Reply with a numbered list only, one category per line\n"
        f"- Use only the exact category names listed above\n"
        f"- No explanations, no punctuation after the category\n\n"
        f"Transactions:\n{numbered}"
    )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=2048,
                temperature=0,
            ),
        )
        lines = response.text.strip().split("\n")
        results = []
        for line in lines:
            # Strip numbering like "1. " or "1) "
            line = line.strip()
            for sep in [". ", ") ", "- "]:
                if sep in line:
                    line = line.split(sep, 1)[-1].strip()
                    break
            line = line.rstrip('.')

            # Match to known label
            matched = "Other"
            for label in labels:
                if label.lower() == line.lower():
                    matched = label
                    break
                if label.lower() in line.lower():
                    matched = label
                    break
            results.append(matched)

        # Pad or trim to match input length in case Gemini returns wrong count
        if len(results) < len(descriptions):
            results += ["Other"] * (len(descriptions) - len(results))
        return results[:len(descriptions)]

    except Exception:
        return ["Other"] * len(descriptions)


def categorize_text(description: str) -> str:
    """Single transaction fallback — used if needed."""
    return categorize_batch([description])[0]
