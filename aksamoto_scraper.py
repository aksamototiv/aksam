"""
Aksam Otomotiv (aksamoto.com.tr) Arac Ilan Scraper v3
=====================================================
DOM yapisina gore optimize. Tekrarlari birlestir, URL'den yil cek.

Gereksinimler:
    pip install playwright
    playwright install chromium

Kullanim:
    python aksamoto_scraper.py
"""

import asyncio
import json
import re
from pathlib import Path
from urllib.parse import urljoin

BASE_URL = "https://aksamoto.com.tr"
GALERI_DIR = Path("aksamoto_galeri")


async def scrape():
    from playwright.async_api import async_playwright

    GALERI_DIR.mkdir(exist_ok=True)
    print("\n" + "=" * 60)
    print("  AKSAM OTOMOTIV - ARAC ILAN SCRAPER v3")
    print("  aksamoto.com.tr")
    print("=" * 60 + "\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        # 1) Sayfayi ac
        print("[1/5] Sayfa aciliyor...")
        await page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)

        # 2) Lazy-load icin asagi kaydir
        print("[2/5] Sayfa kaydiriliyor (lazy-load)...")
        for _ in range(10):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await page.wait_for_timeout(500)
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(500)

        # 3) Tum /detay/ linklerini topla
        print("[3/5] Arac kartlari araniyor...")
        links = await page.query_selector_all('a[href*="/detay/"]')
        print(f"  -> {len(links)} link bulundu")

        # Her linki isle ve arac_no bazinda grupla
        raw = {}  # arac_no -> dict

        for link in links:
            href = await link.get_attribute("href") or ""
            m = re.search(r'/detay/(\d+)/(.+)', href)
            if not m:
                continue

            arac_no = m.group(1)
            slug = m.group(2)

            if arac_no not in raw:
                # Slug'dan bilgi cek: hasarli-oto-2025-bmw-x1-xdrive25e-15-245-m-sport
                slug_parts = slug.replace("hasarli-oto-", "").split("-")
                yil = slug_parts[0] if slug_parts and slug_parts[0].isdigit() else ""

                # Marka ve model slug'dan
                marka_model_slug = "-".join(slug_parts[1:]) if len(slug_parts) > 1 else ""

                raw[arac_no] = {
                    "arac_no": arac_no,
                    "baslik": "",
                    "yil": yil,
                    "slug": slug,
                    "fiyat": "",
                    "gorsel_url": "",
                    "detay_url": urljoin(BASE_URL, href),
                    "yerel_gorsel_yolu": None,
                }

            entry = raw[arac_no]

            # Kart ici metin
            text = (await link.inner_text()).strip()

            # Baslik: en uzun anlamli metin (marka model iceren)
            if text and text != "Incele" and text != "\u0130ncele" and len(text) > len(entry["baslik"]):
                if not text.startswith("Bilinmiyor"):
                    entry["baslik"] = text

            # Gorsel: kart icindeki img
            img = await link.query_selector("img")
            if img and not entry["gorsel_url"]:
                src = await img.get_attribute("src") or ""
                if src and "logo" not in src.lower() and "brand" not in src.lower() and "placeholder" not in src.lower():
                    entry["gorsel_url"] = urljoin(BASE_URL, src)

        vehicles = list(raw.values())

        # Basliklari duzelt: bos olanlari slug'dan olustur
        for v in vehicles:
            if not v["baslik"]:
                s = v["slug"].replace("hasarli-oto-", "").replace("-", " ").upper()
                # Yili cikar
                s = re.sub(r'^\d{4}\s+', '', s)
                v["baslik"] = s.strip() or "Bilinmiyor"

        print(f"  -> {len(vehicles)} benzersiz arac tespit edildi\n")

        # 4) Gorselleri indir
        print(f"[4/5] Gorseller indiriliyor...\n")
        downloaded = 0
        for v in vehicles:
            if not v["gorsel_url"]:
                continue
            filename = f"arac_{v['arac_no']}.jpg"
            filepath = GALERI_DIR / filename
            try:
                response = await page.request.get(v["gorsel_url"])
                if response.ok:
                    img_bytes = await response.body()
                    with open(filepath, "wb") as f:
                        f.write(img_bytes)
                    v["yerel_gorsel_yolu"] = str(filepath)
                    downloaded += 1
                    if downloaded % 10 == 0:
                        print(f"  {downloaded} gorsel indirildi...")
            except Exception:
                pass

        print(f"  Toplam {downloaded} gorsel indirildi.\n")

        await browser.close()

    # 5) Temiz sonuclari olustur
    results = []
    for idx, v in enumerate(vehicles, 1):
        results.append({
            "sira": idx,
            "arac_no": v["arac_no"],
            "baslik": v["baslik"],
            "yil": v["yil"],
            "fiyat": v["fiyat"] or "Uye girisi gerekli",
            "gorsel_url": v["gorsel_url"],
            "detay_url": v["detay_url"],
            "yerel_gorsel_yolu": v["yerel_gorsel_yolu"],
        })

    # JSON kaydet
    output_path = Path("aksamoto_ilanlar.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Ekrana yazdir
    print("=" * 60)
    print(f"  SONUC: {len(results)} arac ilani cekildi")
    print(f"  JSON  : {output_path}")
    print(f"  Galeri: {GALERI_DIR}/ ({downloaded} gorsel)")
    print("=" * 60 + "\n")

    for e in results:
        img_ok = "+" if e["yerel_gorsel_yolu"] else "-"
        print(f"  [{e['sira']:02d}] [{img_ok}] {e['baslik']}")
        print(f"       No: {e['arac_no']}  |  Yil: {e['yil'] or '-'}")
        print(f"       {e['detay_url']}")
        print()

    return results


if __name__ == "__main__":
    asyncio.run(scrape())
