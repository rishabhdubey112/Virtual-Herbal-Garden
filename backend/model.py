"""
Virtual Herbal Garden — OpenRouter API Identification
================================================
Uses OpenRouter (with user's OpenRouter-generated key) for advanced vision and text processing.
Powered by LLaMA Vision and NVIDIA Nemotron via OpenAI-compatible endpoints.
"""

import os
import json
import base64
from dotenv import load_dotenv

load_dotenv()

_PROMPT = """You are a STRICT expert botanist and Ayurvedic herbalist. Your job is to identify REAL, PHYSICAL herbal/medicinal plants only.

Analyse the {input_type} carefully.

BEFORE identifying, ask yourself:
1. Is this a REAL photograph of an actual plant taken in the real world?
2. Is the main subject a living botanical plant (not a decorative pattern, illustration, logo, or symbol)?

Respond with ONLY a valid JSON object — no markdown, no extra text:
{{
  "is_herbal":       <boolean true or false>,
  "plant":           "<common name, or 'Not a Herbal Plant'>",
  "scientific_name": "<scientific / botanical name, or 'N/A'>",
  "benefits":        "<3-5 key medicinal benefits, comma-separated, or 'None'>",
  "confidence":      <integer 0-100 indicating certainty>,
  "habitat":         "<native region and preferred environment, or 'N/A'>",
  "key_features":    "<2-3 distinguishing visual features>",
  "growing_season":  "<season or time of year when the plant grows best, e.g., 'Summer, Monsoon' or 'All Seasons'>",
  "analysis_note":   "<one sentence explaining your identification reasoning>"
}}

STRICT REJECTION RULES — You MUST set "is_herbal" to false and "plant" to "Not a Herbal Plant" if the image is ANY of the following:
- A logo, emblem, badge, seal, or institutional symbol (college logos, company logos, etc.)
- A cartoon, drawing, illustration, painting, or digital artwork of a plant
- A screenshot, computer display, user interface, or web page
- A person, human face, or body part
- An animal, insect, or bird
- A random object, food (packaged), building, or vehicle
- Any non-photographic representation (even if it looks like a flower or leaf)
- An image with text overlays, watermarks, or stamps as primary content
- A flag, poster, flyer, or printed material

CONFIDENCE RULE: If you are less than 60% confident it is a real medicinal plant, you MUST set "is_herbal" to false.

IMPORTANT: A circle with petals, a yellow/green color, or a flower-like shape in a LOGO does NOT make it a plant. Be very strict.
"""

def _parse_response(text: str, model_name: str) -> dict:
    import re
    text = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    
    result = None
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text_json = match.group(0)
            result = json.loads(text_json.strip())
        else:
            result = json.loads(text.strip())
    except Exception as e:
        print(f"[WARN] Failed to parse JSON. Falling back to text mode: {text}")
        # Graceful fallback if the AI outputs conversation instead of JSON
        result = {
            "plant": "Potential Match",
            "scientific_name": "Needs verification",
            "benefits": "AI provided a conversational response rather than structured data.",
            "confidence": 45,
            "habitat": "Unknown",
            "key_features": "See analysis note.",
            "growing_season": "All Seasons",
            "analysis_note": text.strip()[:400] + ("..." if len(text) > 400 else "")
        }

    defaults = {
        "is_herbal": True, 
        "plant": "Unknown Plant", "scientific_name": "Species unknown",
        "benefits": "Not determined", "confidence": 50,
        "habitat": "Not determined", "key_features": "Not determined",
        "growing_season": "All Seasons",
        "analysis_note": "Identified by AI."
    }
    for k, v in defaults.items():
        result.setdefault(k, v)

    result["method"] = f"AI Vision ({model_name})"
    return result


def _encode_image(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


# ─────────────────────────────────────────────────────────────
# OpenRouter API Integration
# ─────────────────────────────────────────────────────────────
def _call_openrouter(prompt: str, image_path: str = None) -> dict:
    import urllib.request
    import urllib.error

    api_key = os.getenv("NVIDIA_API_KEY") # Still using the var name they populated
    if not api_key:
        raise ValueError("Missing NVIDIA_API_KEY in .env file")

    messages = []
    
    if image_path:
        base64_image = _encode_image(image_path)
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        })
        model_name = "meta-llama/llama-3.2-11b-vision-instruct"
    else:
        messages.append({
            "role": "user",
            "content": prompt
        })
        model_name = "nvidia/llama-3.1-nemotron-70b-instruct" # Since they want Nvidia!

    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = json.dumps({
        "model": model_name,
        "messages": messages,
        "max_tokens": 600,
        "temperature": 0.2
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Virtual Herbal Garden"
    }

    request = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=60) as resp:
            response_text = resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        error_body = err.read().decode("utf-8")
        raise RuntimeError(f"OpenRouter HTTP {err.code}: {error_body}") from err
    except Exception as err:
        raise RuntimeError(f"OpenRouter connection failed: {err}") from err

    response_json = json.loads(response_text)
    content = response_json['choices'][0]['message']['content']
    return _parse_response(content, "AI Vision (LLaMA/NVIDIA)")


def _call_openrouter_text(prompt: str) -> str:
    import urllib.request
    import urllib.error
    import os

    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise ValueError("Missing NVIDIA_API_KEY in .env file")

    payload = json.dumps({
        "model": "nvidia/llama-3.1-nemotron-70b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 600,
        "temperature": 0.2
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Virtual Herbal Garden"
    }

    request = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as resp:
            response_text = resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        error_body = err.read().decode("utf-8")
        raise RuntimeError(f"OpenRouter HTTP {err.code}: {error_body}") from err
    except Exception as err:
        raise RuntimeError(f"OpenRouter connection failed: {err}") from err

    response_json = json.loads(response_text)
    return response_json["choices"][0]["message"]["content"]

# ─────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────

def predict_plant(image_path: str) -> dict:
    """Identify a plant using the OpenRouter API."""
    prompt = _PROMPT.format(input_type="image of a plant")
    try:
        return _call_openrouter(prompt, image_path)
    except Exception as e:
        print(f"[ERR] Model Image Error: {e}")
        return _error_response(str(e))


def predict_from_text(text_query: str) -> dict:
    """Identify a plant from text using the OpenRouter API."""
    prompt = _PROMPT.format(input_type="text description of a plant") + f'\n\nUser input: "{text_query}"'
    try:
        return _call_openrouter(prompt)
    except Exception as e:
        print(f"[ERR] Model Text Error: {e}")
        return _error_response(str(e))


def _error_response(err_msg: str) -> dict:
    msg = "Could not identify this image. Try another clear photo of the plant."
    if "NVIDIA_API_KEY" in err_msg or "401" in err_msg:
        msg = "Ready to accept your API Key. Please ensure it is valid in .env."
        
    return {
        "plant": "Identification Failed",
        "scientific_name": "Please Try Again",
        "benefits": msg,
        "confidence": 0,
        "habitat": "N/A",
        "key_features": "N/A",
        "analysis_note": f"Error Log: {err_msg}",
        "method": "System Error"
    }

_REMEDY_PROMPT = """You are an expert Ayurvedic doctor and herbalist.
A patient has reported the following symptoms/issues:
"{symptoms}"

You have a limited dispensary. You may ONLY recommend plants from the following list of available herbs in our shop:
{available_plants}

Select 1 to 3 plants from the available list that best treat these symptoms.
Respond with ONLY a valid JSON object — no markdown, no extra text:
{{
  "recommendations": [
    {{
      "plant_name": "<exact name from the available list>",
      "reason": "<1-2 sentences explaining why it helps these specific symptoms>",
      "usage": "<how to consume or use it safely>"
    }}
  ]
}}
"""

def predict_remedy(symptoms: str, available_plants: list) -> dict:
    """Consult the AI using user symptoms and available DB plants."""
    plants_str = "\n".join([f"- {p['name']}: {p['benefits']}" for p in available_plants])
    prompt = _REMEDY_PROMPT.format(symptoms=symptoms, available_plants=plants_str)
    
    try:
        import re
        text = _call_openrouter_text(prompt)
        text = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)

        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text_json = match.group(0)
            return json.loads(text_json.strip())
        return json.loads(text.strip())

    except Exception as e:
        print(f"[ERR] Remedy Text Error: {e}")
        raise RuntimeError(f"AI remedy generation failed: {e}") from e

