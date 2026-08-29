"""
Genera el par ANTES / DESPUÉS del comparador como fotografía intraoral realista.

IMPORTANTE: son imágenes de demostración, NO un caso del consultorio. La página las
etiqueta como tal. Antes de publicar en el dominio real hay que sustituirlas por
fotos de un caso propio con consentimiento firmado del paciente: presentar un
antes/después generado con IA como resultado real es publicidad engañosa
(ver HANDOFF.md, pendiente 1).

El "después" se genera usando el "antes" como imagen de referencia para que el
encuadre, el estilo y los colores sean idénticos y el slider funcione.
"""
import os, sys, time, json
import requests

API_KEY = os.environ.get("KIE_AI_API_KEY", "775f96224a27a9b7ce2cbc608ab68157")
BASE = "https://api.kie.ai"
MODEL = "nano-banana-pro"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")

HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

ESTILO = (
    "Clinical intraoral dental photography, close-up frontal retracted view of upper and "
    "lower front teeth in occlusion, professional dental cheek retractors visible at the "
    "edges, healthy pink gums, sharp focus, even ring-flash lighting typical of a dental "
    "clinic, neutral dark background behind the mouth, no face visible above the upper lip "
    "or below the lower lip, no text, no watermark, no logo. Photorealistic, high detail, "
    "clinical documentation style."
)

ANTES = ESTILO + (
    " BEFORE orthodontic treatment: SEVERE and obvious crowding. The upper central and "
    "lateral incisors are strongly rotated and overlapping each other, one lateral incisor "
    "is clearly pushed behind the arch line, the lower incisors are visibly crooked and "
    "imbricated, the incisal edge line is jagged and asymmetric. Teeth slightly dull and "
    "yellowish with visible plaque near the gumline. The misalignment must be immediately "
    "obvious at a glance."
)

DESPUES = (
    "Use the attached image as an EXACT reference for the mouth: same patient, same lips "
    "and gums, same retractors, same camera distance and angle, same lighting, same "
    "background, same framing and crop. Change ONLY the teeth. "
    + ESTILO +
    " AFTER orthodontic treatment: the SAME mouth with the teeth now perfectly straight and "
    "aligned. Upper and lower incisors evenly spaced with no rotations and no overlaps, a "
    "smooth symmetrical incisal curve, clean healthy enamel, natural bright white shade. "
    "The contrast against the reference image must be dramatic and obvious. Everything "
    "else identical to the reference image."
)


def _post(url, payload):
    r = requests.post(url, headers=HEADERS, json=payload, timeout=60)
    r.raise_for_status()
    return r.json()


def _get(url):
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    return r.json()


def create_task(prompt, refs=None):
    inp = {"prompt": prompt, "aspect_ratio": "16:9",
           "resolution": "2K", "output_format": "png"}
    if refs:
        inp["image_input"] = refs
    d = _post(f"{BASE}/api/v1/jobs/createTask", {"model": MODEL, "input": inp})
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

    print("→ caso-01-antes …", flush=True)
    url_antes = poll_task(create_task(ANTES))
    descargar(url_antes, os.path.join(OUT, "caso-01-antes.jpg"))
    print(f"  ok  {url_antes}")

    print("→ caso-01-despues (encadenado al antes) …", flush=True)
    url_desp = poll_task(create_task(DESPUES, refs=[url_antes]))
    descargar(url_desp, os.path.join(OUT, "caso-01-despues.jpg"))
    print(f"  ok  {url_desp}")


if __name__ == "__main__":
    main()
