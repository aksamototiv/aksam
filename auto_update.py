"""
Aksam Otomotiv - Otomatik Guncelleme Scripti v2
================================================
Gorselleri GitHub'a yukler (hotlink korumasini asar)
"""

import asyncio
import json
import re
import os
import subprocess
from pathlib import Path
from datetime import datetime
from urllib.parse import urljoin

BASE_URL = "https://aksamoto.com.tr"
SCRIPT_DIR = Path(__file__).parent
APP_JS_PATH = SCRIPT_DIR / "app.js"
JSON_PATH = SCRIPT_DIR / "aksamoto_ilanlar.json"
IMG_DIR = SCRIPT_DIR / "aksamoto_galeri"


async def scrape_and_download():
    """aksamoto.com.tr'den ilanlari ve gorselleri cek"""
    from playwright.async_api import async_playwright

    IMG_DIR.mkdir(exist_ok=True)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Scraper baslatiliyor...")

    vehicles = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        await page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)

        for _ in range(10):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await page.wait_for_timeout(500)
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(500)

        links = await page.query_selector_all('a[href*="/detay/"]')
        print(f"  {len(links)} link bulundu")

        for link in links:
            href = await link.get_attribute("href") or ""
            m = re.search(r'/detay/(\d+)/(.+)', href)
            if not m:
                continue

            arac_no = m.group(1)
            slug = m.group(2)

            if arac_no not in vehicles:
                slug_parts = slug.replace("hasarli-oto-", "").split("-")
                yil = slug_parts[0] if slug_parts and slug_parts[0].isdigit() else ""
                vehicles[arac_no] = {
                    "arac_no": arac_no,
                    "baslik": "",
                    "yil": yil,
                    "slug": slug,
                    "gorsel_url": "",
                    "detay_url": urljoin(BASE_URL, href),
                }

            entry = vehicles[arac_no]
            text = (await link.inner_text()).strip()
            if text and text != "\u0130ncele" and text != "Incele" and len(text) > len(entry["baslik"]):
                entry["baslik"] = text

            img = await link.query_selector("img")
            if img and not entry["gorsel_url"]:
                src = await img.get_attribute("src") or ""
                if src and "logo" not in src.lower() and "brand" not in src.lower() and "placeholder" not in src.lower():
                    entry["gorsel_url"] = urljoin(BASE_URL, src)

        # Gorselleri Playwright uzerinden indir (Referer header ile)
        print(f"\n  Gorseller indiriliyor...")
        downloaded = 0
        for v in vehicles.values():
            if not v["gorsel_url"]:
                continue
            filepath = IMG_DIR / f"arac_{v['arac_no']}.jpg"
            if filepath.exists() and filepath.stat().st_size > 5000:
                # Zaten indirilmis, tekrar indirme
                downloaded += 1
                continue
            try:
                response = await page.request.get(v["gorsel_url"])
                if response.ok:
                    img_bytes = await response.body()
                    with open(filepath, "wb") as f:
                        f.write(img_bytes)
                    downloaded += 1
            except Exception:
                pass

        print(f"  {downloaded} gorsel hazir")
        await browser.close()

    # Bos basliklari duzelt
    result = []
    for v in vehicles.values():
        if not v["baslik"]:
            s = v["slug"].replace("hasarli-oto-", "").replace("-", " ").upper()
            s = re.sub(r'^\d{4}\s+', '', s)
            v["baslik"] = s.strip() or "Bilinmiyor"
        result.append(v)

    print(f"  {len(result)} benzersiz arac bulundu")
    return result


def extract_brand_model(baslik):
    known_brands = [
        "VOLKSWAGEN", "BMW", "MERCEDES", "FORD", "TOYOTA", "HYUNDAI",
        "RENAULT", "FIAT", "PEUGEOT", "CITROEN", "OPEL", "SKODA",
        "DACIA", "VOLVO", "SEAT", "HONDA", "NISSAN", "SUZUKI",
        "KIA", "MAZDA", "AUDI", "PORSCHE", "MINI", "TOFAS-FIAT",
        "LAND ROVER", "RANGE ROVER", "JEEP", "CHEVROLET", "MITSUBISHI",
        "BYD", "CHERY", "TOGG", "CUPRA", "MG", "TESLA", "SUBARU",
        "ALFA ROMEO", "LEXUS", "INFINITI", "SMART", "ISUZU", "DODGE",
        "FOTON", "MOTORSIKLET",
    ]
    baslik_upper = baslik.upper()
    for brand in known_brands:
        if baslik_upper.startswith(brand):
            model = baslik[len(brand):].strip()
            return brand, model
    parts = baslik.split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def generate_garage_js(vehicles):
    """garageData - gorseller yerel dosyadan"""
    lines = []
    for idx, v in enumerate(vehicles):
        brand, model = extract_brand_model(v["baslik"])
        arac_no = v["arac_no"]
        year = v["yil"]
        detay_url = v["detay_url"]

        # Gorsel: GitHub Pages'deki yerel dosya
        img = f"aksamoto_galeri/arac_{arac_no}.jpg"

        model = model.replace("'", "\\'")
        brand = brand.replace("'", "\\'")

        line = f"      {{ id: {idx}, aracNo: '{arac_no}', brand: '{brand}', model: '{model}', img: '{img}', year: {year or 2024}, detayUrl: '{detay_url}' }}"
        lines.append(line)

    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"    // Real Garage Data from aksamoto.com.tr (Auto-updated: {ts})\n    this.garageData = [\n" + ",\n".join(lines) + "\n    ];"


def save_json(vehicles):
    data = []
    for idx, v in enumerate(vehicles, 1):
        # Extract brand/model for frontend consumption
        brand, model = extract_brand_model(v["baslik"])
        
        # Determine image path
        img = f"aksamoto_galeri/arac_{v['arac_no']}.jpg" if v["gorsel_url"] else ""

        data.append({
            "id": idx - 1,
            "aracNo": v["arac_no"],
            "brand": brand,
            "model": model,
            "yil": v["yil"],
            "year": v["yil"] or 2024,
            "img": img,
            "detayUrl": v["detay_url"],
            "baslik": v["baslik"]
        })
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  aksamoto_ilanlar.json guncellendi")


def git_push():
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    cmds = [
        'git add app.js aksamoto_ilanlar.json aksamoto_galeri/',
        f'git commit -m "Auto-update: {ts}"',
        'git push origin main',
        'git checkout gh-pages',
        'git merge main',
        'git push origin gh-pages',
        'git checkout main',
    ]
    for cmd in cmds:
        subprocess.run(cmd, shell=True, cwd=str(SCRIPT_DIR))
    print(f"  GitHub'a push edildi")


async def main():
    print("\n" + "=" * 50)
    print("  AKSAM OTOMOTIV - OTOMATIK GUNCELLEME v2")
    print("=" * 50)

    vehicles = await scrape_and_download()
    if not vehicles:
        print("  [X] Hic ilan bulunamadi!")
        return

    save_json(vehicles)
    git_push()

    print(f"\n  TAMAMLANDI: {len(vehicles)} ilan + gorseller guncellendi!")
    print(f"  Saat: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
