"""
Genera el retrato de la sección "Quién te atiende" (assets/img/doctora.jpg).

IMPORTANTE: es una imagen de demostración. La persona NO existe y NO es la clienta.
La sección lleva su nombre y dos números de cédula profesional debajo, así que esta
foto debe sustituirse por una foto real de la doctora antes de publicar en el dominio
propio. Mientras tanto la página la etiqueta como imagen de demostración y el sitio
va con noindex.
"""
import os, time, json
import requests

API_KEY = os.environ.get("KIE_AI_API_KEY", "775f96224a27a9b7ce2cbc608ab68157")
BASE = "https://api.kie.ai"
MODEL = "nano-banana-pro"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")

HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

PROMPT = (
    "Professional corporate portrait of a Mexican woman dentist in her early forties, "
    "vertical three-quarter length framing from mid-torso up, standing and facing the "
    "camera, warm confident closed-lip smile, dark hair tied back neatly. "
    "She wears a crisp white medical coat over a soft mint scrub top, no name embroidery, "
    "no badge, no lanyard, no text of any kind on the clothing. "
    "Plain seamless light background in porcelain white with a very subtle pale cyan tint, "
    "soft even studio lighting from the front left, gentle falloff, shallow depth of field. "
    "Calm and premium medical aesthetic, natural skin texture, no heavy retouching, "
    "no props, no dental instruments, no logos, no watermark. "
    "Photorealistic editorial portrait, high detail, vertical composition with headroom."
)


def _post(url, payload):
    r = requests.post(url, headers=HEADERS, json=payload, timeout=60)
    r.raise_for_status()
    return r.json()


def _get(url):
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    return r.json()


def create_task(prompt):
    d = _post(f"{BASE}/api/v1/jobs/createTask", {
        "model": MODEL,
        "input": {"prompt": prompt, "aspect_ratio": "4:5",
                  "resolution": "2K", "output_format": "png"},
    })
    if d.get("code") != 200:
        raise RuntimeError(f"createTask: {d}")
    return d["data"]["taskId"]


def poll_task(task_id, max_wait=420, interval=8):
    waited = 0
    while waited < max_wait:
        d = _get(f"{BASE}/api/v1/jobs/recordInfo?taskId={task_id}")
        state = (d.get("data") or {}).get("state")
        if state == "success":
            return json.loads(d["data"]["resultJson"])["resultUrls"][0]
        if state == "fail":
            raise RuntimeError(f"fail: {(d.get('data') or {}).get('failMsg')}")
        time.sleep(interval)
        waited += interval
    raise TimeoutError(f"timeout tras {max_wait}s")


def main():
    os.makedirs(OUT, exist_ok=True)
    print("→ doctora.jpg …", flush=True)
    url = poll_task(create_task(PROMPT))
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    with open(os.path.join(OUT, "doctora.jpg"), "wb") as f:
        f.write(r.content)
    print(f"  ok  {url}")


if __name__ == "__main__":
    main()
