import os
import time
from functools import lru_cache
from google import genai
from google.genai import types

DEFAULT_LABELS = [
    "Groceries", "Dining", "Transportation", "Utilities",
    "Rent", "Entertainment", "Other"
]

KEYWORD_MAP = {
    # Groceries
    "trader joe": "Groceries",
    "whole foods": "Groceries",
    "safeway": "Groceries",
    "walmart": "Groceries",
    "costco": "Groceries",
    "kroger": "Groceries",
    "aldi": "Groceries",
    "publix": "Groceries",
    "food lion": "Groceries",
    "stop & shop": "Groceries",
    "metro grocery": "Groceries",
    "supermarket": "Groceries",
    "grocery": "Groceries",
    "market": "Groceries",
    "walgreens": "Groceries",
    "cvs": "Groceries",
    "pharmacy": "Groceries",
    "target": "Groceries",

    # Dining
    "restaurant": "Dining",
    "chipotle": "Dining",
    "mcdonald": "Dining",
    "starbucks": "Dining",
    "doordash": "Dining",
    "uber eats": "Dining",
    "grubhub": "Dining",
    "pizza": "Dining",
    "sushi": "Dining",
    "cafe": "Dining",
    "diner": "Dining",
    "five guys": "Dining",
    "olive garden": "Dining",
    "applebee": "Dining",
    "chili's": "Dining",
    "wendy": "Dining",
    "burger king": "Dining",
    "taco bell": "Dining",
    "subway": "Dining",
    "panera": "Dining",
    "dunkin": "Dining",
    "tim horton": "Dining",
    "popeyes": "Dining",
    "kfc": "Dining",
    "domino": "Dining",
    "papa john": "Dining",
    "wing": "Dining",
    "bbq": "Dining",
    "grill": "Dining",
    "bistro": "Dining",
    "thai": "Dining",
    "indian": "Dining",
    "chinese": "Dining",
    "japanese": "Dining",
    "mexican": "Dining",
    "italian": "Dining",
    "steakhouse": "Dining",
    "food delivery": "Dining",
    "split dinner": "Dining",
    "dinner": "Dining",
    "lunch": "Dining",
    "breakfast": "Dining",
    "brunch": "Dining",

    # Transportation
    "uber": "Transportation",
    "lyft": "Transportation",
    "metro": "Transportation",
    "transit": "Transportation",
    "gas station": "Transportation",
    "shell": "Transportation",
    "chevron": "Transportation",
    "exxon": "Transportation",
    "bp ": "Transportation",
    "parking": "Transportation",
    "toll": "Transportation",
    "via ride": "Transportation",
    "presto": "Transportation",
    "ttc": "Transportation",
    "go train": "Transportation",
    "amtrak": "Transportation",
    "greyhound": "Transportation",
    "airline": "Transportation",
    "delta": "Transportation",
    "united air": "Transportation",
    "air canada": "Transportation",
    "southwest": "Transportation",

    # Utilities
    "electric": "Utilities",
    "coned": "Utilities",
    "hydro": "Utilities",
    "internet": "Utilities",
    "xfinity": "Utilities",
    "rogers": "Utilities",
    "bell ": "Utilities",
    "water bill": "Utilities",
    "phone bill": "Utilities",
    "verizon": "Utilities",
    "at&t": "Utilities",
    "t-mobile": "Utilities",
    "telus": "Utilities",
    "gas bill": "Utilities",
    "enbridge": "Utilities",
    "national gas": "Utilities",
    "wifi": "Utilities",
    "icloud": "Utilities",
    "google one": "Utilities",
    "dropbox": "Utilities",

    # Rent
    "rent": "Rent",
    "mortgage": "Rent",
    "lease": "Rent",
    "property": "Rent",

    # Entertainment
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "hulu": "Entertainment",
    "disney": "Entertainment",
    "apple music": "Entertainment",
    "youtube premium": "Entertainment",
    "steam": "Entertainment",
    "cinema": "Entertainment",
    "theatre": "Entertainment",
    "theater": "Entertainment",
    "amc": "Entertainment",
    "concert": "Entertainment",
    "festival": "Entertainment",
    "ticket": "Entertainment",
    "ticketmaster": "Entertainment",
    "stubhub": "Entertainment",
    "eventbrite": "Entertainment",
    "amazon prime": "Entertainment",
    "hbo": "Entertainment",
    "paramount": "Entertainment",
    "crunchyroll": "Entertainment",
    "twitch": "Entertainment",
    "playstation": "Entertainment",
    "xbox": "Entertainment",
    "nintendo": "Entertainment",
    "gym": "Entertainment",
    "planet fitness": "Entertainment",
    "goodlife": "Entertainment",
    "equinox": "Entertainment",

    # Other / pass-through
    "atm": "Other",
    "withdrawal": "Other",
    "transfer": "Other",
    "zelle": "Other",
}


@lru_cache(maxsize=1)
def get_labels() -> tuple:
    raw = os.getenv("CATEGORIES")
    if raw:
        labels = [x.strip() for x in raw.split(",") if x.strip()]
        return tuple(labels) if labels else tuple(DEFAULT_LABELS)
    return tuple(DEFAULT_LABELS)


def _keyword_match(description: str) -> str | None:
    desc_lower = description.lower()
    for keyword, category in KEYWORD_MAP.items():
        if keyword in desc_lower:
            return category
    return None


def categorize_text(description: str) -> str:
    keyword_result = _keyword_match(description)
    if keyword_result:
        return keyword_result

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return "Other"

    labels = get_labels()
    labels_list = "\n".join(f"- {l}" for l in labels)

    for attempt in range(3):
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=(
                    f"You are a bank transaction categorizer.\n"
                    f"Pick exactly one category from this list for the transaction below.\n"
                    f"Reply with ONLY the category name — no punctuation, no explanation.\n\n"
                    f"Categories:\n{labels_list}\n\n"
                    f"Transaction: {description}"
                ),
                config=types.GenerateContentConfig(
                    max_output_tokens=10,
                    temperature=0,
                ),
            )
            result = response.text.strip().rstrip('.')

            for label in labels:
                if label.lower() == result.lower():
                    return label
            for label in labels:
                if label.lower() in result.lower() or result.lower() in label.lower():
                    return label
            return "Other"

        except Exception as e:
            err = str(e).lower()
            if "429" in err or "quota" in err or "rate" in err:
                time.sleep(2 ** attempt)
                continue
            return "Other"

    return "Other"
