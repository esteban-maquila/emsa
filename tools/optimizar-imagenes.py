"""Genera las imagenes que usa la web a partir de los originales de `img/`.

Uso:
    pip install Pillow
    python tools/optimizar-imagenes.py

Lee `img/` y escribe en `assets/img/` una version WebP (la que sirve el
navegador) y una JPEG de respaldo, redimensionadas al ancho maximo que la
pagina necesita. Los originales no se modifican.
"""
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "img"
DESTINO = RAIZ / "assets" / "img"

# nombre del archivo original -> ancho maximo de salida en pixeles
ANCHOS = {
    "logo": 600,
    "body1": 1200,
    "body2": 1200,
    "body3": 1200,
    "botas1": 1400,
    "boras2": 1200,
    "botas3": 1400,
    "pantalon1": 1200,
    "pantalon2": 1200,
    "pantalon3": 1200,
}

# el original viene con el nombre mal escrito; en la web se publica corregido
RENOMBRAR = {"boras2": "botas2"}

CALIDAD_WEBP = 82
CALIDAD_JPEG = 80


def optimizar(origen: Path) -> None:
    if origen.stem not in ANCHOS:
        print(f"  (omitido, sin ancho definido) {origen.name}")
        return

    ancho_max = ANCHOS[origen.stem]
    nombre = RENOMBRAR.get(origen.stem, origen.stem)

    with Image.open(origen) as imagen:
        imagen = imagen.convert("RGB")
        if imagen.width > ancho_max:
            alto = round(imagen.height * ancho_max / imagen.width)
            imagen = imagen.resize((ancho_max, alto), Image.LANCZOS)

        webp = DESTINO / f"{nombre}.webp"
        jpg = DESTINO / f"{nombre}.jpg"
        imagen.save(webp, "WEBP", quality=CALIDAD_WEBP, method=6)
        imagen.save(jpg, "JPEG", quality=CALIDAD_JPEG, optimize=True, progressive=True)

    kb = lambda p: p.stat().st_size / 1024
    print(
        f"  {origen.name:16} {kb(origen):7.0f} KB  ->  "
        f"{webp.name} {kb(webp):6.0f} KB | {jpg.name} {kb(jpg):6.0f} KB"
    )


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    print(f"Optimizando {ORIGEN} -> {DESTINO}")

    for archivo in sorted(ORIGEN.iterdir()):
        if archivo.suffix.lower() in {".png", ".jpg", ".jpeg"}:
            optimizar(archivo)

    print("Listo.")


if __name__ == "__main__":
    main()
