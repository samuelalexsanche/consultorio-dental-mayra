"""
Genera el par ANTES / DESPUÉS del comparador como ILUSTRACIÓN clínica, no como
fotografía de paciente.

Por qué ilustración y no foto: un antes/después fotorrealista generado con IA y
presentado como resultado real es publicidad engañosa (ver HANDOFF.md, pendiente 1).
La ilustración se etiqueta como tal en la página y se sustituye en cuanto la clienta
entregue fotos de un caso propio con consentimiento firmado.

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
    "Flat vector medical illustration, clean editorial style, thin confident outlines, "
    "no shading noise, centered frontal view of a full set of upper and lower dental "
    "arches on a plain background. Palette: porcelain white teeth, pale cyan background "
    "(#EAF4F6), soft mint accents (#7FD9C0), deep teal outlines (#0B2B33). "
    "No gums detail beyond a simple soft pink band, no face, no lips, no person, "
    "no text, no labels, no watermarks, no logos. Symmetrical composition, generous "
    "margins, the arches occupy the central 70 percent of the frame."
)

ANTES = ESTILO + (
    " Show the teeth with MODERATE CROWDING: several incisors visibly rotated and "
    "overlapping each other, an uneven and irregular incisal edge line, one lateral "
    "incisor pushed behind the arch. Clearly misaligned but realistic, not exaggerated."
)

DESPUES = (
    "Use the attached image as an EXACT reference: same illustration style, same line "
    "weight, same colors, same background, same camera framing, same arch size and "
    "position in the frame. Change ONLY the alignment of the teeth. "
    + ESTILO +
    " Show the SAME dental arches now PERFECTLY ALIGNED after orthodontic treatment: "
    "teeth evenly spaced, no rotations, no overlaps, a smooth symmetrical incisal edge "
    "curve. Everything else identical to the reference image."
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
