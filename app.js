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

    // Real Garage Data from aksamoto.com.tr
    this.garageData = [
      { id: 0, aracNo: '201737654', brand: 'BMW', model: 'X1 XDRIVE25e 1.5 245 M SPORT', img: 'https://images.aksamoto.com.tr/2026/04/28/y2287348_20260428143107.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201737654/hasarli-oto-2025-bmw-x1-xdrive25e-15-245-m-sport' },
      { id: 1, aracNo: '201740780', brand: 'VOLKSWAGEN', model: 'AMAROK STYLE PLUS 4MOTION 2.0 TDI 205 OV', img: 'https://images.aksamoto.com.tr/2026/06/26/y4812621_20260626094931.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201740780/hasarli-oto-2023-volkswagen-amarok-style-plus-4motion-20-tdi-205-ov' },
      { id: 2, aracNo: '201740847', brand: 'FORD', model: 'RANGER XLT 4x4 2.0 ECOBLUE 170', img: 'https://images.aksamoto.com.tr/2026/03/17/y5467257_20260317085632.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201740847/hasarli-oto-2025-ford-ranger-xlt-4x4-20-ecoblue-170-10a-t' },
      { id: 3, aracNo: '201742359', brand: 'FORD', model: 'RANGER WILDTRAK 4x4 2.0 ECOBLUE 205', img: 'https://images.aksamoto.com.tr/2026/07/03/y7728495_20260703100355.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201742359/hasarli-oto-2024-ford-ranger-wildtrak-4x4-20-ecoblue-205-10at' },
      { id: 4, aracNo: '201743217', brand: 'FIAT', model: 'EGEA SEDAN EASY 1.3 M.JET 95', img: 'https://images.aksamoto.com.tr/2026/06/23/y1329095_20260623115658.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201743217/hasarli-oto-2024-tofas-fiat-egea-sedan-easy-13-mjet-95-e6d' },
      { id: 5, aracNo: '201743534', brand: 'CITROEN', model: 'C3 1.4 VTI (95) CONFORT BMP', img: 'https://images.aksamoto.com.tr/2026/07/01/y1191069_20260701165034.jpeg', year: 2012, detayUrl: 'https://aksamoto.com.tr/detay/201743534/hasarli-oto-2012-citroen-c3-14-vti-95-confort-bmp' },
      { id: 6, aracNo: '201744154', brand: 'TOYOTA', model: 'HILUX 2.4 D-4D 150 HI-CRUISER A/T', img: 'https://images.aksamoto.com.tr/2026/06/03/y6687383_20260603134207.jpeg', year: 2022, detayUrl: 'https://aksamoto.com.tr/detay/201744154/hasarli-oto-2022-toyota-hilux-24-d-4d-150-hi-cruiser-a-t' },
      { id: 7, aracNo: '201744206', brand: 'SEAT', model: 'ARONA 1.0 ECOTSI 110 DSG XCELLENCE', img: 'https://images.aksamoto.com.tr/2026/06/27/y961819_20260627091335.jpeg', year: 2021, detayUrl: 'https://aksamoto.com.tr/detay/201744206/hasarli-oto-2021-seat-arona-10-ecotsi-110-dsg-s-s-xcellence' },
      { id: 8, aracNo: '201745904', brand: 'FORD', model: 'TRANSIT 15+1 MINIBUS 2.0', img: 'https://images.aksamoto.com.tr/2026/06/06/y1099627_20260606154459.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201745904/hasarli-oto-2025-ford-transit-15-1-minibus-20' },
      { id: 9, aracNo: '201746307', brand: 'VOLKSWAGEN', model: 'TRANSPORTER CITY VAN 2.0 150 DSG', img: 'https://images.aksamoto.com.tr/2026/06/11/y8839746_20260611090427.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201746307/hasarli-oto-2025-volkswagen-transporter-city-van-20-5-1-uzun-150-dsg' },
      { id: 10, aracNo: '201746346', brand: 'HYUNDAI', model: 'TUCSON FL 1.6 T-GDI ELITE PLUS DCT', img: 'https://images.aksamoto.com.tr/2026/06/13/y2584949_20260613090756.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201746346/hasarli-oto-2024-hyundai-tucson-fl-16-t-gdi-elite-plus-dct' },
      { id: 11, aracNo: '201746769', brand: 'VOLKSWAGEN', model: 'CADDY 2.0 TDI STYLE DSG', img: 'https://images.aksamoto.com.tr/2026/06/18/y2093044_20260618165204.jpeg', year: 2022, detayUrl: 'https://aksamoto.com.tr/detay/201746769/hasarli-oto-2022-volkswagen-caddy-20-tdi-style-dsg' },
      { id: 12, aracNo: '201747235', brand: 'SUZUKI', model: 'VITARA 1.4 BOOSTERJET 4x4 AT GLX', img: 'https://images.aksamoto.com.tr/2026/06/20/y3826696_20260620095953.jpeg', year: 2019, detayUrl: 'https://aksamoto.com.tr/detay/201747235/hasarli-oto-2019-suzuki-vitara-14-boosterjet-4x4-at-glx' },
      { id: 13, aracNo: '201747327', brand: 'RENAULT', model: 'MASTER VAN 13 M3 2.3 DCI 150 E6', img: 'https://images.aksamoto.com.tr/2026/06/20/y4395780_20260620111901.jpeg', year: 2019, detayUrl: 'https://aksamoto.com.tr/detay/201747327/hasarli-oto-2019-renault-master-van-13-m3-23-dci-150-e6' },
      { id: 14, aracNo: '201747457', brand: 'FIAT', model: 'DUCATO VAN 2.3 150 MJET S9', img: 'https://images.aksamoto.com.tr/2026/06/27/y5747750_20260627140149.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201747457/hasarli-oto-2025-fiat-ducato-van-23-150-mjet-s9' },
      { id: 15, aracNo: '201747704', brand: 'PEUGEOT', model: 'PARTNER VAN UZUN COMFORT 1.5 BLUEHDI', img: 'https://images.aksamoto.com.tr/2026/07/04/y4697651_20260704085832.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201747704/hasarli-oto-2024-peugeot-partner-van-uzun-comfort-15-bluehdi-100-ss' },
      { id: 16, aracNo: '201747767', brand: 'FIAT', model: 'SCUDO VAN MAXI L3 BUSINESS MJET3 2.0 145', img: 'https://images.aksamoto.com.tr/2026/06/30/y5459440_20260630090455.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201747767/hasarli-oto-2025-fiat-scudo-van-maxi-l3-business-mjet3-20-145' },
      { id: 17, aracNo: '201748118', brand: 'RENAULT', model: 'MEGANE SEDAN TOUCH 1.5 DCI EDC 110', img: 'https://images.aksamoto.com.tr/2026/07/01/y1989539_20260701105027.jpeg', year: 2018, detayUrl: 'https://aksamoto.com.tr/detay/201748118/hasarli-oto-2018-renault-megane-sedan-touch-15-dci-edc-110' },
      { id: 18, aracNo: '201748188', brand: 'FORD', model: 'RANGER WILDTRAK 4x4 2.0 ECOBLUE 205 10AT', img: 'https://images.aksamoto.com.tr/2026/07/01/y8832497_20260701134200.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201748188/hasarli-oto-2024-ford-ranger-wildtrak-4x4-20-ecoblue-205-10at' },
      { id: 19, aracNo: '201748610', brand: 'SKODA', model: 'OCTAVIA PREMIUM 1.5 TSI ACT e-TEC 150 DSG', img: 'https://images.aksamoto.com.tr/2026/07/02/y3197263_20260702151816.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201748610/hasarli-oto-2023-skoda-octavia-premium-15-tsi-act-e-tec-150-dsg' },
      { id: 20, aracNo: '201748934', brand: 'SKODA', model: 'SCALA 1.0 TSI 110 DSG PREMIUM', img: 'https://images.aksamoto.com.tr/2026/07/03/y5361994_20260703130700.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201748934/hasarli-oto-2023-skoda-scala-10-tsi-110-dsg-premium' },
      { id: 21, aracNo: '201749579', brand: 'VOLKSWAGEN', model: 'JETTA 1.4 TSI (122) COMFORTLINE DSG', img: 'https://images.aksamoto.com.tr/2026/07/07/y5619977_20260707101039.jpeg', year: 2015, detayUrl: 'https://aksamoto.com.tr/detay/201749579/hasarli-oto-2015-volkswagen-jetta-14-tsi-122-comfortline-dsg' },
      { id: 22, aracNo: '201750053', brand: 'PEUGEOT', model: 'BOXER MINIBUS 16+1 L4H2 2.2 BLUEHDI 140', img: 'https://images.aksamoto.com.tr/2026/07/08/y2696285_20260708085716.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201750053/hasarli-oto-2025-peugeot-boxer-minibis-16-1-l4h2-22-bluehdi-140-15m3-42t-fl' },
      { id: 23, aracNo: '201750155', brand: 'DACIA', model: 'DUSTER COMFORT 1.5 DCI 4X4 (110)', img: 'https://images.aksamoto.com.tr/2026/07/08/y3447178_20260708095724.jpeg', year: 2018, detayUrl: 'https://aksamoto.com.tr/detay/201750155/hasarli-oto-2018-dacia-duster-comfort-15-dci-4x4-110' },
      { id: 24, aracNo: '201750756', brand: 'CHERY', model: 'TIGGO 7 PRO MAX EXCEPTIONAL', img: 'https://images.aksamoto.com.tr/2026/07/08/y8891233_20260708162153.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201750756/hasarli-oto-2025-chery-tiggo-7-pro-max-exceptional' },
      { id: 25, aracNo: '201750769', brand: 'RENAULT', model: 'LATITUDE PRIVILEGE 1.5 DCI 110 E5', img: 'https://images.aksamoto.com.tr/2026/07/08/y3973139_20260708163749.jpeg', year: 2013, detayUrl: 'https://aksamoto.com.tr/detay/201750769/hasarli-oto-2013-renault-latitude-privilege-15-dci-110-e5' },
      { id: 26, aracNo: '201751093', brand: 'BYD', model: 'SEAL U EV', img: 'https://images.aksamoto.com.tr/2026/07/09/y1946432_20260709090820.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201751093/hasarli-oto-2025-byd-seal-u-ev' },
      { id: 27, aracNo: '201751308', brand: 'RENAULT', model: 'CLIO HB 1.5 DCI', img: 'https://images.aksamoto.com.tr/2026/07/09/y4193379_20260709101821.jpeg', year: 2017, detayUrl: 'https://aksamoto.com.tr/detay/201751308/hasarli-oto-2017-renault-clio-hb-15-dci' },
      { id: 28, aracNo: '201751480', brand: 'VOLKSWAGEN', model: 'TRANSPORTER CITY VAN 2.0 5+1 UZUN 150 DSG', img: 'https://images.aksamoto.com.tr/2026/07/09/y5059453_20260709113523.jpeg', year: 2026, detayUrl: 'https://aksamoto.com.tr/detay/201751480/hasarli-oto-2026-volkswagen-transporter-city-van-20-5-1-uzun-150-dsg' },
      { id: 29, aracNo: '201751766', brand: 'HYUNDAI', model: 'KONA 1.6 CRDI ELITE SMART DCT', img: 'https://images.aksamoto.com.tr/2026/07/09/y6936447_20260709132749.jpeg', year: 2020, detayUrl: 'https://aksamoto.com.tr/detay/201751766/hasarli-oto-2020-hyundai-kona-16-crdi-elite-smart-dct' },
      { id: 30, aracNo: '201752013', brand: 'BMW', model: 'X1 XDRIVE25E 1.5 245 M SPORT', img: 'https://images.aksamoto.com.tr/2026/07/09/y8651893_20260709155455.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201752013/hasarli-oto-2025-bmw-x1-xdrive25e-15-245-m-sport' },
      { id: 31, aracNo: '201752901', brand: 'OPEL', model: 'FRONTERA-E 83 KW GS', img: 'https://images.aksamoto.com.tr/2026/07/10/y1186752_20260710085019.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201752901/hasarli-oto-2025-opel-frontera-e-83-kw-gs' },
      { id: 32, aracNo: '201753034', brand: 'TOYOTA', model: 'COROLLA HYBRID 1.8 DREAM E-CVT FL', img: 'https://images.aksamoto.com.tr/2026/07/10/y2034571_20260710094218.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201753034/hasarli-oto-2025-toyota-corolla-hybrid-18-dream-e-cvt-fl' },
      { id: 33, aracNo: '201753079', brand: 'BMW', model: '320I SEDAN 1.6 170 M SPORT', img: 'https://images.aksamoto.com.tr/2026/07/10/y2254143_20260710101105.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201753079/hasarli-oto-2024-bmw-320i-sedan-16-170-m-sport' },
      { id: 34, aracNo: '201753080', brand: 'VOLVO', model: 'EX40 S.MOTOR EXT.RNG ULT. 150KW', img: 'https://images.aksamoto.com.tr/2026/07/10/y2257619_20260710101246.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201753080/hasarli-oto-2025-volvo-ex40-smotor-extrng-ult-black-eult-150kw' },
      { id: 35, aracNo: '201755062', brand: 'MERCEDES', model: 'EQB 250+ NIGHT EDITION FL', img: 'https://images.aksamoto.com.tr/2026/07/10/y4793017_20260710142625.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201755062/hasarli-oto-2025-mercedes-eqb-250-night-edition-fl' },
      { id: 36, aracNo: '201755194', brand: 'MERCEDES', model: 'EQS 450 4MATIC INSPIRATION', img: 'https://images.aksamoto.com.tr/2026/07/10/y6058193_20260710154501.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201755194/hasarli-oto-2025-mercedes-eqs-450-4matic-inspiration' },
    ];

    this.init();
  }

  init() {
    lucide.createIcons();
    this.bindEvents();
    this.renderGarage();
    this.renderDashboardListings();
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
    statusEl.className = `status-pill ${car.statusClass}`;
    statusEl.innerText = car.status;

    document.getElementById('detail-name').innerText = `${car.brand} ${car.model}`;
    document.getElementById('detail-info').innerText = `${car.year} | ${car.km} km | ${car.location}`;
    document.getElementById('detail-buy-price').innerText = `₺${car.priceBuyNow}`;
    document.getElementById('detail-auction-price').innerText = `₺${car.priceAuction}`;

    document.getElementById('cost-insurance').innerText = `₺${car.costs.insurance}`;
    document.getElementById('cost-authorized').innerText = `₺${car.costs.authorized}`;
    document.getElementById('cost-mechanic').innerText = `₺${car.costs.mechanic}`;

    const damagesList = document.getElementById('damages-list');
    let dHtml = '';
    car.damages.forEach(d => {
      dHtml += `
        <div class="damage-item glass-panel">
          <div class="damage-img" style="background-image: url('${car.img}')"></div>
          <div class="damage-info">
            <div class="d-row">
              <h4>${d.title}</h4>
              <span class="d-severity ${d.class}">${d.severity}</span>
            </div>
            <p>${d.desc}</p>
            <span class="d-cost">Tahmini Onarım: ₺${d.cost}</span>
          </div>
        </div>
      `;
    });
    damagesList.innerHTML = dHtml;

    this.showView('view-report');
  }
}

const app = new AppController();
