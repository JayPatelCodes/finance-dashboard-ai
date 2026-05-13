import pandas as pd
from io import BytesIO

REQUIRED = {"Date", "Description", "Amount"}
MAX_DESCRIPTION_LENGTH = 200
MAX_ROWS = 10_000


def parse_csv(bytes_data: bytes) -> pd.DataFrame:
    df = pd.read_csv(BytesIO(bytes_data))

    missing = REQUIRED - set(df.columns)
    if missing:
        raise ValueError(f"CSV missing required columns: {', '.join(sorted(missing))}")

    if len(df) > MAX_ROWS:
        raise ValueError(f"CSV exceeds maximum row limit of {MAX_ROWS:,} rows.")

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"])

    df["Amount"] = (
        df["Amount"]
        .astype(str).str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
        .astype(float)
    )

    # Truncate descriptions to prevent oversized Gemini prompts
    df["Description"] = (
        df["Description"]
        .astype(str)
        .str.strip()
        .str[:MAX_DESCRIPTION_LENGTH]
    )

    return df
