import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from model import predict_from_text
result = predict_from_text("tulsi")
print("=== LIVE GEMINI TEST ===")
for k, v in result.items():
    print(f"  {k}: {v}")
