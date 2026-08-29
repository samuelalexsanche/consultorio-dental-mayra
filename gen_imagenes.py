"""
Genera las imágenes ambientales del sitio con Kie AI (nano-banana-pro).
Ver HANDOFF.md, pendiente 1.

NO genera: doctora.jpg (persona real) ni caso-01-antes/despues.jpg
(fotos clínicas de paciente — no se generan con IA, ver advertencia del handoff).
"""
import os, sys, time, json
import requests

API_KEY = os.environ.get("KIE_AI_API_KEY", "775f96224a27a9b7ce2cbc608ab68157")
BASE = "https://api.kie.ai"
MODEL = "nano-banana-pro"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")

IMAGENES = [
    {
        "archivo": "og-consultorio-dental-mayra.jpg",
        "aspect_ratio": "16:9",
        "prompt": (
            "Clean minimal dental clinic interior, soft natural daylight, porcelain white "
            "and pale cyan color palette, modern dental chair slightly out of focus in "
            "background, shallow depth of field, negative space on the left third for text "
            "overlay, calm and premium medical aesthetic, no people, no logos, no text. "
            "Photorealistic, high detail."
        ),
    },
    {
        "archivo": "consultorio-01.jpg",
        "aspect_ratio": "4:3",
        "prompt": (
            "Modern boutique dental office interior in Guadalajara Mexico, white and soft "
            "mint surfaces, warm wood accent, large window with diffused light, plants, "
            "spotless and uncluttered, wide angle, architectural photography, no people, "
            "no text, no branding. Photorealistic, high detail."
        ),
    },
    {
        "archivo": "textura-esmalte.jpg",
        "aspect_ratio": "16:9",
        "prompt": (
            "Abstract macro texture of polished tooth enamel, iridescent pale cyan and mint "
            "highlights on white, soft caustic light reflections, extremely subtle, high key, "
            "minimal, no objects, no text. Suitable as a very light background overlay."
        ),
    },
]


HEADERS = {"Content-Type": "application/json",
           "Authorization": f"Bearer {API_KEY}"}


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
        "input": {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "resolution": "2K",
            "output_format": "png",
        },
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


def descargar(url, destino):
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    with open(destino, "wb") as f:
        f.write(r.content)


def main():
    os.makedirs(OUT, exist_ok=True)
    solo = sys.argv[1:] or None
    for img in IMAGENES:
        if solo and img["archivo"] not in solo:
            continue
        print(f"→ {img['archivo']} …", flush=True)
        try:
            tid = create_task(img["prompt"], img["aspect_ratio"])
            url = poll_task(tid)
            destino = os.path.join(OUT, img["archivo"])
            descargar(url, destino)
            print(f"  ok  {destino}  ({os.path.getsize(destino)//1024} KB)")
        except Exception as e:
            print(f"  ERROR  {e}")


if __name__ == "__main__":
    main()
