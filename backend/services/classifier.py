from transformers import pipeline
from functools import lru_cache
import os

DEFAULT_LABELS = [
    "Groceries", "Dining", "Transportation", "Utilities",
    "Rent", "Entertainment", "Other"
]

@lru_cache(maxsize=1)
def get_labels():
    raw = os.getenv("CATEGORIES")
    if raw:
        labels = [x.strip() for x in raw.split(",") if x.strip()]
        return labels or DEFAULT_LABELS
    return DEFAULT_LABELS

@lru_cache(maxsize=1)
def get_classifier():
    # Loads once per process
    return pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def categorize_text(description: str) -> str:
    clf = get_classifier()
    labels = get_labels()
    out = clf(description, candidate_labels=labels)
    return out["labels"][0]