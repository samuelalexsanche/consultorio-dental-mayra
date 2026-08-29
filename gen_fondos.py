"""
Genera las capas de fondo que dan profundidad y alimentan el parallax.
Todas son abstractas y decorativas: no representan al consultorio ni a pacientes,
así que no hay nada que sustituir antes de publicar.
"""
import os, sys, time, json
import requests

API_KEY = os.environ.get("KIE_AI_API_KEY", "775f96224a27a9b7ce2cbc608ab68157")
BASE = "https://api.kie.ai"
MODEL = "nano-banana-pro"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")
HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

COMUN = (
    " Abstract and decorative only, no objects, no people, no teeth, no text, no logos, "
    "no watermark. Extremely soft and low contrast so that text remains readable on top."
)

IMAGENES = [
    {
        # Detrás de la arcada del hero. Fondo oscuro: el hero es teal profundo.
        "archivo": "fondo-hero.jpg",
        "aspect_ratio": "16:9",
        "prompt": (
            "Deep underwater caustic light patterns in dark teal and petrol blue, slow "
            "rippling highlights of pale cyan and mint drifting across a very dark "
            "background, soft volumetric glow, heavy bokeh, dreamy and calm, cinematic "
            "depth. Dark overall exposure, luminous accents concentrated toward the "
            "center right." + COMUN
        ),
    },
    {
        # Banda de parallax detrás de la sección "Proceso" (fondo claro).
        "archivo": "parallax-proceso.jpg",
        "aspect_ratio": "16:9",
        "prompt": (
            "Very light and airy abstract background, porcelain white with the faintest "
            "pale cyan and mint gradients, soft blurred light rays entering from the top "
            "left, delicate lens flare, fine film grain, high key, almost white. Clean "
            "clinical calm." + COMUN
        ),
    },
    {
        # Banda de parallax de la sección de cierre (fondo oscuro).
        "archivo": "parallax-cierre.jpg",
        "aspect_ratio": "16:9",
        "prompt": (
            "Dark abstract gradient background in deep teal and midnight petrol, subtle "
            "diagonal sweep of soft cyan light from the lower left, faint mint particles "
            "suspended like dust in a beam, smooth vignette, elegant and premium. "
            "Very dark overall." + COMUN
        ),
    },
]


def _post(url, payload):
    r = requests.post(url, headers=HEADERS, json=payload, timeout=60)
    r.raise_for_status()
    return r.json()


def _get(url):
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    return r.json()


def create_task(prompt, aspect_ratio):
    d = _post(f"{BASE}/api/v1/jobs/createTask", {
        "model": MODEL,
        "input": {"prompt": prompt, "aspect_ratio": aspect_ratio,
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
    solo = sys.argv[1:] or None
    for img in IMAGENES:
        if solo and img["archivo"] not in solo:
            continue
        print(f"→ {img['archivo']} …", flush=True)
        try:
            url = poll_task(create_task(img["prompt"], img["aspect_ratio"]))
            r = requests.get(url, timeout=180)
            r.raise_for_status()
            destino = os.path.join(OUT, img["archivo"])
            with open(destino, "wb") as f:
                f.write(r.content)
            print(f"  ok  {destino} ({os.path.getsize(destino)//1024} KB)", flush=True)
        except Exception as e:
            print(f"  ERROR  {e}", flush=True)


if __name__ == "__main__":
    main()
