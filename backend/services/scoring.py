from typing import Dict
import random


def predict_lead_score(features: Dict) -> float:
    """Simple placeholder scoring function.

    Returns a score in [0, 1]. Replace with a real ML model later.
    """
    base = 0.5
    industry = (features.get("industry") or "").lower()
    title = (features.get("title") or "").lower()

    # Industry-based scoring
    if "technology" in industry or "saas" in industry:
        base += 0.25
    elif "finance" in industry or "banking" in industry:
        base += 0.15
    elif "healthcare" in industry or "pharma" in industry:
        base += 0.1
    elif "education" in industry:
        base -= 0.05 # Slightly lower for education in this example

    # Keyword-based scoring (example)
    if "enterprise" in title or "corporate" in title:
        base += 0.1

    # Add a small random component for variability
    base += random.uniform(-0.05, 0.05)

    return max(0.0, min(1.0, base))


