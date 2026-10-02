class AppController {
  constructor() {
    this.currentView = 'view-dashboard';
    this.captureStep = 1;
    this.maxSteps = 5;
    this.captureTitles = [
      "Ön Cephe Çekimi",
      "Sol Yan Çekimi",
      "Arka Cephe Çekimi",
      "Sağ Yan Çekimi",
      "Tavan ve İç Detay"
    ];
    
    // Camera state
    this.cameraStream = null;
    this.cameraReady = false;
    this.capturedPhotos = [];

    // Real Garage Data from aksamoto.com.tr (Fetched dynamically)
    this.garageData = [];

    this.init();
  }

  async init() {
    lucide.createIcons();
    this.bindEvents();
    
    // Initial fetch
    await this.fetchGarageData();
    
    // Auto-refresh every 5 minutes (300000ms)
    setInterval(() => this.fetchGarageData(), 300000);
  }

  async fetchGarageData() {
    try {
      // Fetch latest JSON with cache-busting timestamp
      const response = await fetch(`aksamoto_ilanlar.json?t=${new Date().getTime()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      if (data && data.length > 0) {
        this.garageData = data;
        this.renderGarage();
        this.renderDashboardListings();
      }
    } catch (error) {
      console.error("Ilanlari cekerken hata olustu:", error);
    }
  }

  renderDashboardListings() {
    const container = document.getElementById('dashboard-listings');
    if (!container) return;

    // Show first 6 vehicles on dashboard
    const featured = this.garageData.slice(0, 6);
    let html = '';
    featured.forEach(car => {
      html += `
        <div class="garage-item glass-panel" onclick="window.open('${car.detayUrl}', '_blank')">
          <div class="g-image" style="background-image: url('${car.img}')">
            <div class="g-pill scan-status hasar-orta">${car.year}</div>
          </div>
          <div class="g-content">
            <h3 class="g-title">${car.brand} ${car.model}</h3>
            <p class="g-meta"><i data-lucide="hash" class="icon-xs"></i> ${car.aracNo} | <i data-lucide="calendar" class="icon-xs"></i> ${car.year}</p>
            <div class="g-prices">
              <div class="g-price-box">
                <span class="g-price-label">aksamoto.com.tr</span>
                <span class="g-price-val primary" style="font-size: 0.85rem;">Detay İçin Tıklayın →</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    lucide.createIcons();
  }

  bindEvents() {
    // Start capture flow
    document.getElementById('btn-start-capture')?.addEventListener('click', () => {
      this.captureStep = 1;
      this.capturedPhotos = [];
      this.cameraReady = false;
      this.clearThumbnails();
      this.hidePreview();
      this.updateCaptureUI();
      this.showView('view-capture');
      this.startCamera();
    });

    // Shutter button: if live camera is active, take snapshot. Otherwise, trigger native file input.
    document.getElementById('btn-take-photo')?.addEventListener('click', () => {
      if (this.cameraReady) {
        this.takePhotoFromVideo();
      } else {
        // Trigger the hidden native camera file input
        document.getElementById('file-input-camera')?.click();
      }
    });

    // Native camera file input (capture="environment" opens camera app on mobile)
    document.getElementById('file-input-camera')?.addEventListener('change', (e) => {
      this.handleFileSelected(e);
    });

    // Gallery file input (no capture attribute = opens gallery/file picker)
    document.getElementById('file-input-gallery')?.addEventListener('change', (e) => {
      this.handleFileSelected(e);
    });

    // Close capture
    document.getElementById('btn-close-capture')?.addEventListener('click', () => {
      this.stopCamera();
      this.showView('view-dashboard');
    });

    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.showView(e.currentTarget.dataset.target);
      });
    });
  }

  // ==================== CAMERA (getUserMedia) ====================

  async startCamera() {
    const video = document.getElementById('camera-video');
    if (!video) return;

    // Check API support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia desteklenmiyor. Dosya seçici (native camera) kullanılacak.');
      this.cameraReady = false;
      return; // Shutter will fall back to file input
    }

    const attempts = [
      { video: { facingMode: { exact: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: true, audio: false }
    ];

    let stream = null;
    for (const constraints of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (err) {
        console.warn('Kamera denemesi:', err.name, err.message);
      }
    }

    if (!stream) {
      console.warn('Kamera erişimi sağlanamadı. Dosya seçici kullanılacak.');
      this.cameraReady = false;
      return; // Shutter will fall back to file input
    }

    this.cameraStream = stream;
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play().then(() => {
        this.cameraReady = true;
        console.log('✅ Canlı kamera aktif');
      }).catch(() => {
        this.cameraReady = false;
      });
    };
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
    this.cameraReady = false;
    const video = document.getElementById('camera-video');
    if (video) video.srcObject = null;
  }

  // ==================== PHOTO CAPTURE ====================

  // Method 1: Snapshot from live video
  takePhotoFromVideo() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    if (!video || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    this.processCapture(dataUrl);
  }

  // Method 2: From file input (native camera app or gallery)
  handleFileSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.processCapture(dataUrl);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    event.target.value = '';
  }

  // Common processing after capture (from any source)
  processCapture(dataUrl) {
    this.capturedPhotos.push(dataUrl);
    this.triggerFlash();
    this.addThumbnail(dataUrl);
    this.showPreview(dataUrl);

    // Auto-advance after a brief delay to show the preview
    setTimeout(() => {
      this.hidePreview();
      this.advanceStep();
    }, 800);
  }

  advanceStep() {
    if (this.captureStep < this.maxSteps) {
      this.captureStep++;
      this.updateCaptureUI();
    } else {
      this.stopCamera();
      this.startAnalysis();
    }
  }

  // ==================== UI EFFECTS ====================

  triggerFlash() {
    const flash = document.getElementById('capture-flash');
    if (!flash) return;
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 150);
  }

  addThumbnail(dataUrl) {
    const container = document.getElementById('captured-thumbnails');
    if (!container) return;
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Çekim ${this.captureStep}`;
    container.appendChild(img);
  }

  clearThumbnails() {
    const container = document.getElementById('captured-thumbnails');
    if (container) container.innerHTML = '';
  }

  showPreview(dataUrl) {
    const preview = document.getElementById('preview-image');
    if (!preview) return;
    preview.src = dataUrl;
    preview.classList.remove('hidden');
  }

  hidePreview() {
    const preview = document.getElementById('preview-image');
    if (preview) preview.classList.add('hidden');
  }

  // ==================== GARAGE ====================

  renderGarage() {
    const container = document.getElementById('garage-grid-container');
    if (!container) return;

    let html = '';
    this.garageData.forEach(car => {
      html += `
        <div class="garage-item glass-panel" onclick="window.open('${car.detayUrl}', '_blank')">
          <div class="g-image" style="background-image: url('${car.img}')">
            <div class="g-pill scan-status hasar-orta">${car.year}</div>
          </div>
          <div class="g-content">
            <h3 class="g-title">${car.brand} ${car.model}</h3>
            <p class="g-meta"><i data-lucide="hash" class="icon-xs"></i> Araç No: ${car.aracNo} | <i data-lucide="calendar" class="icon-xs"></i> ${car.year}</p>
            <div class="g-prices">
              <div class="g-price-box">
                <span class="g-price-label">aksamoto.com.tr</span>
                <span class="g-price-val primary" style="font-size: 0.85rem;">Detay İçin Tıklayın →</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    lucide.createIcons();
  }

  // ==================== UI HELPERS ====================

  updateCaptureUI() {
    const titleEl = document.getElementById('capture-title');
    const stepEl = document.getElementById('capture-step');
    const textEl = document.getElementById('car-silhouette-text');
    
    if (titleEl) titleEl.innerText = this.captureTitles[this.captureStep - 1];
    if (stepEl) stepEl.innerText = this.captureStep;
    if (textEl) textEl.innerText = `${this.captureTitles[this.captureStep - 1]} İçin Hizalayın`;
  }

  showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    this.currentView = viewId;
  }

  goBack() {
    if (this.currentView === 'view-report') {
      this.showView('view-garage');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelector('[data-target="view-garage"]')?.classList.add('active');
    } else {
      this.showView('view-dashboard');
    }
  }

  // ==================== AI ANALYSIS ====================

  startAnalysis() {
    this.showView('view-analysis');
    
    const analysisImg = document.getElementById('analysis-image-bg');
    if (this.capturedPhotos.length > 0) {
      analysisImg.style.backgroundImage = `url('${this.capturedPhotos[this.capturedPhotos.length - 1]}')`;
    } else {
      analysisImg.style.backgroundImage = `url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`;
    }

    const container = document.querySelector('.analysis-image');
    container.classList.add('scanning');
    
    const progressFill = document.getElementById('analysis-progress');
    const statusText = document.getElementById('analysis-status-text');
    const btnReport = document.getElementById('btn-view-report');
    
    progressFill.style.width = '0%';
    btnReport.classList.add('hidden');
    document.querySelectorAll('.bounding-box').forEach(b => b.classList.add('hidden'));
    
    setTimeout(() => { progressFill.style.width = '30%'; statusText.innerText = 'Hasar tespiti yapılıyor...'; }, 1000);
    setTimeout(() => { 
      progressFill.style.width = '60%'; 
      statusText.innerText = 'Maliyet hesaplanıyor...';
      document.querySelector('.b-1')?.classList.remove('hidden');
    }, 2500);
    setTimeout(() => { 
      progressFill.style.width = '85%'; 
      statusText.innerText = 'Rapor oluşturuluyor...';
      document.querySelector('.b-2')?.classList.remove('hidden');
    }, 4000);
    setTimeout(() => { 
      progressFill.style.width = '100%'; 
      statusText.innerText = 'Analiz Tamamlandı!';
      container.classList.remove('scanning');
      btnReport.classList.remove('hidden');
    }, 5000);
  }

  // ==================== CAR DETAIL ====================

  viewCarDetail(carId) {
    const car = this.garageData.find(c => c.id === carId) || this.garageData[0];
    
    document.getElementById('detail-image').style.backgroundImage = `url('${car.img}')`;
    const statusEl = document.getElementById('detail-status');
    statusEl.className = `status-pill status-active`;
    statusEl.innerText = "Yapay Zeka Analizli";

    document.getElementById('detail-name').innerText = `${car.brand} ${car.model}`;
    document.getElementById('detail-info').innerText = `${car.year} | Tahmini 120,000 km`;
    
    // YZ FİNANSAL ALGORİTMASI (Tahmini Hesaplamalar)
    // Gerçekte bu veriler bir API'den veya detaylı scrapingden gelebilir. Şu an araca göre simüle ediyoruz.
    const baseValue = 500000 + (Math.random() * 800000); // Rastgele taban pazar rayici
    const marketValue = Math.round(baseValue / 1000) * 1000;
    
    // Hasar oranını marka ve yıla göre randomize ediyoruz
    const damageSeverity = 0.15 + (Math.random() * 0.20); // %15 ile %35 arası hasar kaybı
    const buyPrice = Math.round((marketValue * (1 - damageSeverity)) / 1000) * 1000;
    
    // Maliyet kalemleri
    const costAuthorized = Math.round((marketValue * 0.22) / 1000) * 1000;
    const costMechanic = Math.round((marketValue * 0.08) / 1000) * 1000;
    
    // Kar Hesaplaması
    const repairCost = costMechanic;
    const estimatedResale = marketValue * 0.95; // Hasar kayıtlı (ağır hasarlı) olarak %5 daha ucuza satılacağı varsayımı
    const netProfit = estimatedResale - (buyPrice + repairCost);

    // Ekrana Formatlı Basma
    const formatMoney = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

    document.getElementById('detail-buy-price').innerText = formatMoney(buyPrice);
    document.getElementById('detail-auction-price').innerText = formatMoney(buyPrice * 0.85); // İhale tahmini %15 altı
    
    document.getElementById('cost-authorized').innerText = formatMoney(costAuthorized);
    document.getElementById('cost-mechanic').innerText = formatMoney(costMechanic);

    // Yeni Finansal Blok
    document.getElementById('ai-market-value').innerText = formatMoney(marketValue);
    document.getElementById('ai-buy-cost').innerText = formatMoney(buyPrice);
    document.getElementById('ai-repair-cost').innerText = formatMoney(repairCost);
    document.getElementById('ai-resale-value').innerText = formatMoney(estimatedResale);
    document.getElementById('ai-net-profit').innerText = formatMoney(netProfit);

    // EKSİK/HASARLI PARÇA TEDARİK ALGORİTMASI
    const partsList = document.getElementById('parts-list');
    const mockParts = [
      { name: "Ön Tampon", origin: "Yan Sanayi (Tayvan)", source: "oto-parca.net", price: Math.round(costMechanic * 0.25) },
      { name: "Sağ Çamurluk", origin: "Çıkma Orijinal", source: "Ankara Ostim Çıkmacılar", price: Math.round(costMechanic * 0.35) },
      { name: "Far Grubu (Sağ)", origin: "Yan Sanayi (Depo)", source: "Yıldız Oto Sanayi", price: Math.round(costMechanic * 0.40) }
    ];
    
    let partsHtml = '';
    mockParts.forEach(p => {
      partsHtml += `
        <div class="row-between glass-panel p-2" style="border-left: 3px solid #3b82f6;">
          <div style="display:flex; flex-direction:column;">
            <span class="text-white font-bold">${p.name}</span>
            <span class="text-muted text-sm">${p.origin} • <i data-lucide="map-pin" style="width:12px; height:12px; display:inline;"></i> ${p.source}</span>
          </div>
          <span class="text-blue font-bold">${formatMoney(p.price)}</span>
        </div>
      `;
    });
    partsList.innerHTML = partsHtml;

    // GÖRSEL HASAR TESPİTLERİ
    const damagesList = document.getElementById('damages-list');
    const mockDamages = [
      { title: "Yırtık / Kırık", desc: "Ön tamponda parça kaybı tespit edildi.", severity: "YÜKSEK", class: "severity-high", cost: formatMoney(costMechanic * 0.25) },
      { title: "Göçük", desc: "Sağ ön çamurluk hasarlı, değişim/düzeltme şart.", severity: "ORTA", class: "severity-mid", cost: formatMoney(costMechanic * 0.35) }
    ];

    let dHtml = '';
    mockDamages.forEach(d => {
      dHtml += `
        <div class="damage-item glass-panel">
          <div class="damage-info" style="width:100%; padding-left:0;">
            <div class="d-row">
              <h4>${d.title}</h4>
              <span class="d-severity ${d.class}">${d.severity}</span>
            </div>
            <p>${d.desc}</p>
            <span class="d-cost">Onarım Maliyeti Payı: ${d.cost}</span>
          </div>
        </div>
      `;
    });
    damagesList.innerHTML = dHtml;

    lucide.createIcons();
    this.showView('view-report');
  }
}

const app = new AppController();
