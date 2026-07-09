"""
Aksam Otomotiv (aksamoto.com.tr) Araç İlan Scraper
===================================================
Site React SPA olduğundan (tüm içerik JavaScript ile render ediliyor),
klasik requests+BeautifulSoup ile çekilemez.
Bu scraper Playwright kullanarak tarayıcıyı açar ve sayfayı gerçek bir
kullanıcı gibi yükler.

Gereksinimler:
    pip install playwright
    playwright install chromium

Kullanım:
    python aksamoto_scraper.py
"""

import asyncio
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urljoin

# ============================================================
# Playwright ile Scraping (Ana Yöntem — React SPA için zorunlu)
# ============================================================

async def scrape_with_playwright():
    """
    Playwright ile aksamoto.com.tr sitesindeki araç ilanlarını çeker.
    Görselleri aksamoto_galeri/ klasörüne indirir.
    Sonuçları aksamoto_ilanlar.json dosyasına kaydeder.
    """
    from playwright.async_api import async_playwright

    BASE_URL = "https://aksamoto.com.tr"
    GALERI_DIR = Path("aksamoto_galeri")
    GALERI_DIR.mkdir(exist_ok=True)

    print("🚗 Aksam Otomotiv Scraper Başlatılıyor...")
    print(f"📂 Görseller '{GALERI_DIR}' klasörüne kaydedilecek.\n")

    results = []

    async with async_playwright() as p:
        # Headless tarayıcı aç
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        # ---- 1. Ana sayfayı aç ve React'ın render etmesini bekle ----
        print(f"🌐 {BASE_URL} açılıyor...")
        await page.goto(BASE_URL, wait_until="networkidle", timeout=30000)

        # React'ın içeriği render etmesi için ekstra bekleme
        await page.wait_for_timeout(3000)

        # ---- 2. Sayfayı aşağı kaydırarak lazy-load görselleri tetikle ----
        print("📜 Sayfa aşağı kaydırılıyor (lazy-load tetikleme)...")
        for _ in range(5):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await page.wait_for_timeout(800)

        # En başa geri dön
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1000)

        # ---- 3. Araç kartlarını tespit et ----
        # Farklı olası CSS seçicileri dene
        card_selectors = [
            ".vehicle-card",
            ".car-card",
            ".product-card",
            ".listing-card",
            ".arac-card",
            "[class*='card']",
            "[class*='vehicle']",
            "[class*='listing']",
            "[class*='product']",
            "a[href*='/arac/']",
            "a[href*='/ilan/']",
            "a[href*='/vehicle/']",
        ]

        cards = []
        used_selector = None
        for selector in card_selectors:
            try:
                found = await page.query_selector_all(selector)
                if found and len(found) > 0:
                    cards = found
                    used_selector = selector
                    break
            except Exception:
                continue

        if not cards:
            # Genel yaklaşım: sayfadaki tüm resimleri ve yakınındaki metinleri al
            print("⚠️  Standart kart seçicisi bulunamadı. Genel tarama yapılıyor...")
            cards = await page.query_selector_all("img")
            used_selector = "img (fallback)"

        print(f"✅ {len(cards)} eleman bulundu (seçici: {used_selector})\n")

        # ---- 4. Sayfa HTML'ini kaydet (debug için) ----
        html_content = await page.content()
        debug_path = GALERI_DIR / "_debug_page.html"
        with open(debug_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"🔍 Debug HTML kaydedildi: {debug_path}\n")

        # ---- 5. Her karttan bilgi çıkar ----
        print("📋 İlanlar taranıyor...\n")

        # Tüm sayfadaki metin bloklarını ve resimleri topla
        all_text = await page.inner_text("body")
        all_images = await page.query_selector_all("img")

        image_data = []
        for img in all_images:
            src = await img.get_attribute("src")
            alt = await img.get_attribute("alt") or ""
            if src and not any(skip in src.lower() for skip in [
                "logo", "icon", "favicon", "avatar", "placeholder",
                "loading", "spinner", "banner"
            ]):
                full_src = urljoin(BASE_URL, src)
                image_data.append({"src": full_src, "alt": alt})

        # Fiyat ve araç no pattern'leri
        price_pattern = re.compile(r'[\d.]+\s*₺')
        vehicle_no_pattern = re.compile(r'(?:Araç\s*No|araç\s*no|Vehicle\s*No)[:\s]*(\S+)', re.IGNORECASE)

        # Sayfadaki tüm metin bloklarından araç bilgisi çıkar
        text_elements = await page.query_selector_all(
            "h1, h2, h3, h4, h5, p, span, div, a"
        )

        # Araç markalarını ara
        car_brands = [
            "BMW", "MERCEDES", "AUDI", "VOLKSWAGEN", "FORD", "TOYOTA",
            "HONDA", "HYUNDAI", "KIA", "RENAULT", "FIAT", "OPEL",
            "PEUGEOT", "CITROEN", "VOLVO", "NISSAN", "MAZDA", "SKODA",
            "SEAT", "DACIA", "MITSUBISHI", "SUZUKI", "JEEP", "LAND ROVER",
            "RANGE ROVER", "PORSCHE", "CHEVROLET", "DODGE", "ISUZU",
            "ALFA ROMEO", "LEXUS", "INFINITI", "MINI", "SMART", "TESLA",
            "CUPRA", "MG", "BYD", "CHERY", "TOGG", "AMAROK", "RANGER",
        ]

        detected_vehicles = []
        for elem in text_elements:
            try:
                text = (await elem.inner_text()).strip()
                if not text or len(text) < 5 or len(text) > 200:
                    continue
                text_upper = text.upper()
                for brand in car_brands:
                    if brand in text_upper and text not in [v["title"] for v in detected_vehicles]:
                        detected_vehicles.append({
                            "title": text,
                            "brand": brand,
                        })
                        break
            except Exception:
                continue

        # Fiyatları topla
        prices = price_pattern.findall(all_text)

        # Araç numaralarını topla
        vehicle_numbers = vehicle_no_pattern.findall(all_text)

        # ---- 6. Sonuçları birleştir ----
        for idx, vehicle in enumerate(detected_vehicles):
            entry = {
                "sira": idx + 1,
                "baslik": vehicle["title"],
                "marka": vehicle["brand"],
                "arac_no": vehicle_numbers[idx] if idx < len(vehicle_numbers) else None,
                "fiyat": prices[idx] if idx < len(prices) else None,
                "gorsel_url": image_data[idx]["src"] if idx < len(image_data) else None,
                "yerel_gorsel_yolu": None,
            }
            results.append(entry)

        # ---- 7. Görselleri indir ----
        print(f"\n📸 {len(results)} araç bulundu. Görseller indiriliyor...\n")

        for entry in results:
            if not entry["gorsel_url"]:
                continue

            # Dosya adı: araç_no veya başlıktan temizle
            safe_name = entry["arac_no"] or entry["baslik"]
            safe_name = re.sub(r'[^\w\s-]', '', safe_name).strip()
            safe_name = re.sub(r'[\s]+', '_', safe_name)[:80]
            filename = f"{safe_name}.jpg"
            filepath = GALERI_DIR / filename

            try:
                response = await page.request.get(entry["gorsel_url"])
                if response.ok:
                    img_bytes = await response.body()
                    with open(filepath, "wb") as f:
                        f.write(img_bytes)
                    entry["yerel_gorsel_yolu"] = str(filepath)
                    print(f"  ✅ İndirildi: {filename}")
                else:
                    print(f"  ❌ İndirilemedi ({response.status}): {entry['gorsel_url']}")
            except Exception as e:
                print(f"  ❌ Hata: {e}")

        # ---- 8. Ekstra: Eğer hiç sonuç bulunamadıysa, ham veri kaydet ----
        if not results:
            print("\n⚠️  Otomatik ayrıştırma ile araç bulunamadı.")
            print("   Debug HTML dosyasını inceleyerek CSS seçicilerini güncelleyin.")

            # Ham görsel ve metin verilerini de kaydet
            raw_data = {
                "bulunan_gorseller": image_data[:20],
                "bulunan_fiyatlar": prices[:20],
                "bulunan_arac_nolari": vehicle_numbers[:20],
                "sayfa_metin_ornegi": all_text[:2000],
            }
            raw_path = GALERI_DIR / "_ham_veri.json"
            with open(raw_path, "w", encoding="utf-8") as f:
                json.dump(raw_data, f, ensure_ascii=False, indent=2)
            print(f"   Ham veri kaydedildi: {raw_path}")

        await browser.close()

    return results


# ============================================================
# Sonuçları JSON'a Kaydet ve Ekrana Yazdır
# ============================================================

def save_and_display(results):
    """Sonuçları JSON dosyasına kaydeder ve terminale yazdırır."""

    output_path = Path("aksamoto_ilanlar.json")

    # JSON dosyasına kaydet
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"📊 SONUÇ: {len(results)} araç ilanı çekildi")
    print(f"📁 JSON dosyası: {output_path}")
    print(f"🖼️  Görseller: aksamoto_galeri/")
    print(f"{'='*60}\n")

    # Ekrana temiz çıktı
    for entry in results:
        print(f"🚗 {entry['baslik']}")
        print(f"   Marka    : {entry['marka']}")
        print(f"   Araç No  : {entry['arac_no'] or 'Bilinmiyor'}")
        print(f"   Fiyat    : {entry['fiyat'] or 'Bilinmiyor'}")
        print(f"   Görsel   : {entry['yerel_gorsel_yolu'] or entry['gorsel_url'] or 'Yok'}")
        print()

    return results


# ============================================================
# Ana Çalıştırıcı
# ============================================================

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════╗
║   AKSAM OTOMOTİV - ARAÇ İLAN SCRAPER            ║
║   aksamoto.com.tr                                ║
╚══════════════════════════════════════════════════╝
    """)

    results = asyncio.run(scrape_with_playwright())
    save_and_display(results)
