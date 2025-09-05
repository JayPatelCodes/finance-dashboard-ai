import pandas as pd
from io import BytesIO

REQUIRED = {"Date", "Description", "Amount"}

def parse_csv(bytes_data: bytes) -> pd.DataFrame:
    df = pd.read_csv(BytesIO(bytes_data))

    missing = REQUIRED - set(df.columns)
    if missing:
        raise ValueError(f"CSV missing required columns: {', '.join(sorted(missing))}")

    # Normalize
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"])

    # Clean amounts like "$1,234.56"
    df["Amount"] = (
        df["Amount"]
        .astype(str).str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
        .astype(float)
    )

    df["Description"] = df["Description"].astype(str).str.strip()
    return df