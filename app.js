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

    // Real Garage Data from aksamoto.com.tr (Auto-updated: 2026-08-12 10:14)
    this.garageData = [
      { id: 0, aracNo: '201720132', brand: 'VOLKSWAGEN', model: 'VOLKSWAGEN PASSAT 1.5 TSI ACT 150 PS BUSINESS DSG', img: 'https://images.aksamoto.com.tr/2026/07/09/y7556352_20260709103815.jpeg', year: 2022, detayUrl: 'https://aksamoto.com.tr/detay/201720132/hasarli-oto-2022-volkswagen-volkswagen-passat-15-tsi-act-150-ps-business-dsg' },
      { id: 1, aracNo: '201738749', brand: 'FORD', model: 'TRANSIT CUSTOM VAN 320S EB UPG 136 TREND', img: 'https://images.aksamoto.com.tr/2026/08/05/y2394343_20260805095239.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201738749/hasarli-oto-2025-ford-transit-custom-van-320s-eb-upg-136-trend' },
      { id: 2, aracNo: '201744206', brand: 'SEAT', model: 'ARONA 1.0 ECOTSI 110 DSG S S XCELLENCE', img: 'https://images.aksamoto.com.tr/2026/06/27/y961819_20260627091335.jpeg', year: 2021, detayUrl: 'https://aksamoto.com.tr/detay/201744206/hasarli-oto-2021-seat-arona-10-ecotsi-110-dsg-s-s-xcellence' },
      { id: 3, aracNo: '201745904', brand: 'TOYOTA', model: 'COROLLA SEDAN 1.6 COMFORT EXT', img: 'https://images.aksamoto.com.tr/2026/06/22/y7497245_20260622110744.jpg', year: 2011, detayUrl: 'https://aksamoto.com.tr/detay/201745904/hasarli-oto-2011-toyota-corolla-sedan-16-comfort-ext' },
      { id: 4, aracNo: '201748114', brand: 'FOTON', model: 'TUNLAND G7 FLAGSHIP', img: 'https://images.aksamoto.com.tr/2026/08/03/y6188772_20260803093858.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201748114/hasarli-oto-2025-foton-tunland-g7-flagship' },
      { id: 5, aracNo: '201748118', brand: 'RENAULT', model: 'ESPACE 3.0 DCI OV', img: 'https://images.aksamoto.com.tr/2026/06/27/y2169805_20260627092634.jpeg', year: 2006, detayUrl: 'https://aksamoto.com.tr/detay/201748118/hasarli-oto-2006-renault-espace-30-dci-ov' },
      { id: 6, aracNo: '201748758', brand: 'FIAT', model: 'DOBLO COMBI EASY 1.2 110 PURETECH FL', img: 'https://images.aksamoto.com.tr/2026/08/07/y2437553_20260807085434.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201748758/hasarli-oto-2025-fiat-doblo-combi-easy-12-110-puretech-fl' },
      { id: 7, aracNo: '201748875', brand: 'RENAULT', model: 'CLIO EVOLUTION 1.0 TCE X-TRONIC 90', img: 'https://images.aksamoto.com.tr/2026/07/31/y4584344_20260731092931.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201748875/hasarli-oto-2025-renault-clio-evolution-10-tce-x-tronic-90' },
      { id: 8, aracNo: '201749226', brand: 'FORD', model: 'TOURNEO COURIER 1.5 D 100 TREND', img: 'https://images.aksamoto.com.tr/2026/08/03/y1317420_20260803154435.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201749226/hasarli-oto-2025-ford-tourneo-courier-15-d-100-trend' },
      { id: 9, aracNo: '201750190', brand: 'FORD', model: 'RANGER XLT 4x4 2.0 ECOBLUE 170 10A/T', img: 'https://images.aksamoto.com.tr/2026/07/21/y5529035_20260721125747.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201750190/hasarli-oto-2024-ford-ranger-xlt-4x4-20-ecoblue-170-10a-t' },
      { id: 10, aracNo: '201750756', brand: 'CHERY', model: 'TIGGO 7 PRO MAX EXCEPTIONAL', img: 'https://images.aksamoto.com.tr/2026/06/19/y2076736_20260619091241.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201750756/hasarli-oto-2025-chery-tiggo-7-pro-max-exceptional' },
      { id: 11, aracNo: '201750896', brand: 'VOLKSWAGEN', model: 'PASSAT ALLTRACK 2.0 TDI 200 SCR 4M DSG', img: 'https://images.aksamoto.com.tr/2026/08/05/y5500671_20260805095205.jpeg', year: 2022, detayUrl: 'https://aksamoto.com.tr/detay/201750896/hasarli-oto-2022-volkswagen-passat-alltrack-20-tdi-200-scr-4m-dsg' },
      { id: 12, aracNo: '201751093', brand: 'BYD', model: 'SEAL U EV', img: 'https://images.aksamoto.com.tr/2026/06/26/y3139035_20260626092047.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201751093/hasarli-oto-2025-byd-seal-u-ev' },
      { id: 13, aracNo: '201751677', brand: 'FORD', model: 'TRAN.ICA3 350M KNET C.K 2.0 165 ORTATRENDKAS', img: 'https://images.aksamoto.com.tr/2026/08/05/y360668_20260805095121.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201751677/hasarli-oto-2025-ford-tranica3-350m-knet-ck-20-165-ortatrendkas' },
      { id: 14, aracNo: '201753285', brand: 'FIAT', model: 'EGEA SEDAN EASY 1.6 M.JET 130 GSR', img: 'https://images.aksamoto.com.tr/2026/07/30/y2234932_20260730090006.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201753285/hasarli-oto-2025-fiat-egea-sedan-easy-16-mjet-130-gsr' },
      { id: 15, aracNo: '201753501', brand: 'SUZUKI', model: 'VITARA MILD HYBRID 1.4 129 ELEGANCE 4X2 AT', img: 'https://images.aksamoto.com.tr/2026/07/28/y3981024_20260728090756.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201753501/hasarli-oto-2024-suzuki-vitara-mild-hybrid-14-129-elegance-4x2-at' },
      { id: 16, aracNo: '201754540', brand: 'FIAT', model: 'EGEA CROSS LOUNGE 1.6 M.JET 130DCTGSR TRAC+', img: 'https://images.aksamoto.com.tr/2026/08/06/y1313337_20260806090717.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201754540/hasarli-oto-2025-fiat-egea-cross-lounge-16-mjet-130dctgsr-trac-' },
      { id: 17, aracNo: '201754557', brand: 'MOTORSIKLET', model: 'HONDA NT 1100 DCT', img: 'https://images.aksamoto.com.tr/2026/07/28/y7528940_20260728093500.jpg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201754557/hasarli-oto-2023-motorsiklet-honda-nt-1100-dct' },
      { id: 18, aracNo: '201754648', brand: 'FORD', model: 'TOURNEO COURIER 1.0 P 125 AT DELUXE', img: 'https://images.aksamoto.com.tr/2026/07/31/y5725921_20260731142441.jpeg', year: 2026, detayUrl: 'https://aksamoto.com.tr/detay/201754648/hasarli-oto-2026-ford-tourneo-courier-10-p-125-at-deluxe' },
      { id: 19, aracNo: '201755517', brand: 'CITROEN', model: 'C4 1.6 e HDI (112) CONFORT MCP', img: 'https://images.aksamoto.com.tr/2026/07/01/y331653_20260701103943.jpeg', year: 2012, detayUrl: 'https://aksamoto.com.tr/detay/201755517/hasarli-oto-2012-citroen-c4-16-e-hdi-112-confort-mcp' },
      { id: 20, aracNo: '201756449', brand: 'RENAULT', model: 'CLIO TOUCH 1.3 TCE EDC 130', img: 'https://images.aksamoto.com.tr/2026/07/31/y4492727_20260731092723.jpeg', year: 2020, detayUrl: 'https://aksamoto.com.tr/detay/201756449/hasarli-oto-2020-renault-clio-touch-13-tce-edc-130' },
      { id: 21, aracNo: '201756619', brand: 'FORD', model: 'FORD TOURNEOCOURIERJOURNEY 1.5 TDCI 100 E6.2 TREND', img: 'https://images.aksamoto.com.tr/2026/08/05/y5354072_20260805095025.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201756619/hasarli-oto-2023-ford-ford-tourneocourierjourney-15-tdci-100-e62-trend' },
      { id: 22, aracNo: '201756798', brand: 'VOLKSWAGEN', model: 'T-CROSS 1.0 TSI 110 STYLE DSG', img: 'https://images.aksamoto.com.tr/2026/08/04/y4309893_20260804090623.jpeg', year: 2022, detayUrl: 'https://aksamoto.com.tr/detay/201756798/hasarli-oto-2022-volkswagen-t-cross-10-tsi-110-style-dsg' },
      { id: 23, aracNo: '201756904', brand: 'RENAULT', model: 'KANGOO EXPRESS CARGO MAXI JOY 1.5 BLUEDCI 95', img: 'https://images.aksamoto.com.tr/2026/07/20/y4535963_20260720100002.jpeg', year: 2019, detayUrl: 'https://aksamoto.com.tr/detay/201756904/hasarli-oto-2019-renault-kangoo-express-cargo-maxi-joy-15-bluedci-95' },
      { id: 24, aracNo: '201757106', brand: 'MERCEDES', model: 'CLA 200 FL 1.33 163 AMG 7G-DCT', img: 'https://images.aksamoto.com.tr/2026/08/05/y344814_20260805094733.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201757106/hasarli-oto-2025-mercedes-cla-200-fl-133-163-amg-7g-dct' },
      { id: 25, aracNo: '201757403', brand: 'OPEL', model: 'MOKKA 1.2 130 AT8 ULTIMATE', img: 'https://images.aksamoto.com.tr/2026/06/30/y90182_20260630155653.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201757403/hasarli-oto-2023-opel-mokka-12-130-at8-ultimate' },
      { id: 26, aracNo: '201757474', brand: 'SUBARU', model: 'SOLTERRA E-XCELLENT', img: 'https://images.aksamoto.com.tr/2026/06/24/y4121308_20260624100719.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201757474/hasarli-oto-2023-subaru-solterra-e-xcellent' },
      { id: 27, aracNo: '201757634', brand: 'FIAT', model: 'FIORINO 1.3 CARGO PLUS', img: 'https://images.aksamoto.com.tr/2026/08/07/y4189920_20260807090547.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201757634/hasarli-oto-2024-fiat-fiorino-13-cargo-plus' },
      { id: 28, aracNo: '201757681', brand: 'RENAULT', model: 'CEKICI T 520', img: 'https://images.aksamoto.com.tr/2026/08/04/y2244051_20260804085445.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201757681/hasarli-oto-2024-renault-cekici-t-520' },
      { id: 29, aracNo: '201757810', brand: 'ISUZU', model: 'D-MAX CIFT KABIN KAMYONET 1.9 4x2 V-LIFE AT', img: 'https://images.aksamoto.com.tr/2026/07/28/y309493_20260728155841.jpeg', year: 2020, detayUrl: 'https://aksamoto.com.tr/detay/201757810/hasarli-oto-2020-isuzu-d-max-cift-kabin-kamyonet-19-4x2-v-life-at' },
      { id: 30, aracNo: '201757933', brand: 'RENAULT', model: 'MEGANE SEDAN TOUCH 1.3 TCE EDC 140 FAZ2', img: 'https://images.aksamoto.com.tr/2026/08/07/y6435780_20260807090725.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201757933/hasarli-oto-2025-renault-megane-sedan-touch-13-tce-edc-140-faz2' },
      { id: 31, aracNo: '201758090', brand: 'RENAULT', model: 'RAFALE ESPRIT ALPINE E-TECH F.HYBRID 200', img: 'https://images.aksamoto.com.tr/2026/07/02/y1278085_20260702163216.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201758090/hasarli-oto-2025-renault-rafale-esprit-alpine-e-tech-fhybrid-200' },
      { id: 32, aracNo: '201758240', brand: 'FIAT', model: 'GRANDE PUNTO 3K 1.4 FIRE (77) ACTIVE', img: 'https://images.aksamoto.com.tr/2026/07/27/y3738704_20260727105236.jpg', year: 2009, detayUrl: 'https://aksamoto.com.tr/detay/201758240/hasarli-oto-2009-fiat-grande-punto-3k-14-fire-77-active' },
      { id: 33, aracNo: '201758393', brand: 'SKODA', model: 'SUPERB 1.5 TSI MHEV 150 DSG PRESTIGE FL', img: 'https://images.aksamoto.com.tr/2026/07/07/y4684069_20260707142000.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201758393/hasarli-oto-2024-skoda-superb-15-tsi-mhev-150-dsg-prestige-fl' },
      { id: 34, aracNo: '201758473', brand: 'CITROEN', model: 'BERLINGO COMBI 1.6 HDI 92 SX', img: 'https://images.aksamoto.com.tr/2026/07/17/y6671397_20260717085514.jpeg', year: 2014, detayUrl: 'https://aksamoto.com.tr/detay/201758473/hasarli-oto-2014-citroen-berlingo-combi-16-hdi-92-sx' },
      { id: 35, aracNo: '201758632', brand: 'CITROEN', model: 'E-C5 AIRCROSS MAX 157 KW', img: 'https://images.aksamoto.com.tr/2026/07/30/y6340284_20260730085914.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201758632/hasarli-oto-2025-citroen-e-c5-aircross-max-157-kw' },
      { id: 36, aracNo: '201758705', brand: 'CITROEN', model: 'JUMPY SPACETOURER L3 8+1 1.6 BLUEHDI 115 S&S', img: 'https://images.aksamoto.com.tr/2026/07/16/y1093597_20260716120712.jpeg', year: 2017, detayUrl: 'https://aksamoto.com.tr/detay/201758705/hasarli-oto-2017-citroen-jumpy-spacetourer-l3-8-1-16-bluehdi-115-ss' },
      { id: 37, aracNo: '201758737', brand: 'RENAULT', model: 'ZOE INTENSE R135', img: 'https://images.aksamoto.com.tr/2026/07/24/y3436403_20260724095607.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201758737/hasarli-oto-2023-renault-zoe-intense-r135' },
      { id: 38, aracNo: '201758748', brand: 'RENAULT', model: 'MEGANE SEDAN TOUCH 1.3 TCE EDC 140 FAZ2', img: 'https://images.aksamoto.com.tr/2026/08/11/y1874030_20260811153040.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201758748/hasarli-oto-2023-renault-megane-sedan-touch-13-tce-edc-140-faz2' },
      { id: 39, aracNo: '201758852', brand: 'FIAT', model: 'LINEA POP 1.3 MULTIJET 95', img: 'https://images.aksamoto.com.tr/2026/08/06/y356983_20260806090855.jpeg', year: 2014, detayUrl: 'https://aksamoto.com.tr/detay/201758852/hasarli-oto-2014-fiat-linea-pop-13-multijet-95' },
      { id: 40, aracNo: '201759438', brand: 'TOYOTA', model: 'COROLLA 1.5 DREAM MULTIDRIVE S FL', img: 'https://images.aksamoto.com.tr/2026/07/23/y5698380_20260723094136.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201759438/hasarli-oto-2023-toyota-corolla-15-dream-multidrive-s-fl' },
      { id: 41, aracNo: '201759629', brand: 'RENAULT', model: 'CEKICI T 480 E6 RET ADR', img: 'https://images.aksamoto.com.tr/2026/07/30/y3072990_20260730085535.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201759629/hasarli-oto-2025-renault-cekici-t-480-e6-ret-adr' },
      { id: 42, aracNo: '201759881', brand: 'BYD', model: 'SEAL U EV', img: 'https://images.aksamoto.com.tr/2026/07/30/y2777056_20260730090256.jpeg', year: 2025, detayUrl: 'https://aksamoto.com.tr/detay/201759881/hasarli-oto-2025-byd-seal-u-ev' },
      { id: 43, aracNo: '201760012', brand: 'OPEL', model: 'ASTRA NB 1.6 115 EDITION PLUS', img: 'https://images.aksamoto.com.tr/2026/08/06/y5280693_20260806090627.jpeg', year: 2017, detayUrl: 'https://aksamoto.com.tr/detay/201760012/hasarli-oto-2017-opel-astra-nb-16-115-edition-plus' },
      { id: 44, aracNo: '201760023', brand: 'RENAULT', model: 'TALISMAN TOUCH 1.6 DCI 130 EDC', img: 'https://images.aksamoto.com.tr/2026/07/27/y5620521_20260727105045.jpeg', year: 2016, detayUrl: 'https://aksamoto.com.tr/detay/201760023/hasarli-oto-2016-renault-talisman-touch-16-dci-130-edc' },
      { id: 45, aracNo: '201760293', brand: 'VOLKSWAGEN', model: 'POLO 1.4 COMFORTLINE TIPTRONIC DSG (85)', img: 'https://images.aksamoto.com.tr/2026/07/31/y114417_20260731085218.jpeg', year: 2011, detayUrl: 'https://aksamoto.com.tr/detay/201760293/hasarli-oto-2011-volkswagen-polo-14-comfortline-tiptronic-dsg-85' },
      { id: 46, aracNo: '201760398', brand: 'KIA', model: 'CEED CONCEPT PLUS 1.6 CRDI 128', img: 'https://images.aksamoto.com.tr/2026/07/23/y170720_20260723160239.jpeg', year: 2013, detayUrl: 'https://aksamoto.com.tr/detay/201760398/hasarli-oto-2013-kia-ceed-concept-plus-16-crdi-128' },
      { id: 47, aracNo: '201760435', brand: 'OPEL', model: 'ASTRA HB 1.4 150 AT6 S&S ENJOY', img: 'https://images.aksamoto.com.tr/2026/07/23/y4349893_20260723094040.jpeg', year: 2017, detayUrl: 'https://aksamoto.com.tr/detay/201760435/hasarli-oto-2017-opel-astra-hb-14-150-at6-ss-enjoy' },
      { id: 48, aracNo: '201760899', brand: 'CITROEN', model: 'NEMO COMBI 1.4 HDI SX PLUS', img: '', year: 2009, detayUrl: 'https://aksamoto.com.tr/detay/201760899/hasarli-oto-2009-citroen-nemo-combi-14-hdi-sx-plus' },
      { id: 49, aracNo: '201760904', brand: 'HYUNDAI', model: 'ELANTRA 1.6 MPI (123) CVT STYLE COMFORT', img: 'https://images.aksamoto.com.tr/2026/08/11/y163033_20260811093406.jpeg', year: 2022, detayUrl: 'https://aksamoto.com.tr/detay/201760904/hasarli-oto-2022-hyundai-elantra-16-mpi-123-cvt-style-comfort' },
      { id: 50, aracNo: '201761018', brand: 'RENAULT', model: 'CLIO HB EXTREME EDITION 1.5 DCI 75 E5', img: 'https://images.aksamoto.com.tr/2026/07/20/y1968838_20260720095643.jpeg', year: 2012, detayUrl: 'https://aksamoto.com.tr/detay/201761018/hasarli-oto-2012-renault-clio-hb-extreme-edition-15-dci-75-e5' },
      { id: 51, aracNo: '201761099', brand: 'FIAT', model: 'EGEA CROSS URBAN 1.6 M.JET 130 DCT', img: 'https://images.aksamoto.com.tr/2026/08/04/y2302489_20260804090525.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201761099/hasarli-oto-2023-fiat-egea-cross-urban-16-mjet-130-dct' },
      { id: 52, aracNo: '201761109', brand: 'KIA', model: 'SPORTAGE 2.0 DSL EX OV DVD', img: 'https://images.aksamoto.com.tr/2026/08/03/y7102625_20260803093812.jpeg', year: 2008, detayUrl: 'https://aksamoto.com.tr/detay/201761109/hasarli-oto-2008-kia-sportage-20-dsl-ex-ov-dvd' },
      { id: 53, aracNo: '201761486', brand: 'HYUNDAI', model: 'IONIQ 6', img: 'https://images.aksamoto.com.tr/2026/07/29/y6520091_20260729090326.jpeg', year: 2023, detayUrl: 'https://aksamoto.com.tr/detay/201761486/hasarli-oto-2023-hyundai-ioniq-6' },
      { id: 54, aracNo: '201761571', brand: 'OPEL', model: 'ASTRA HB 1.4 150 AT6 S&S DYNAMIC', img: 'https://images.aksamoto.com.tr/2026/07/30/y3005317_20260730101006.jpeg', year: 2016, detayUrl: 'https://aksamoto.com.tr/detay/201761571/hasarli-oto-2016-opel-astra-hb-14-150-at6-ss-dynamic' },
      { id: 55, aracNo: '201761597', brand: 'VOLVO', model: 'CEKICI FM13 427 500 E', img: 'https://images.aksamoto.com.tr/2026/08/03/y2089116_20260803085327.jpeg', year: 2020, detayUrl: 'https://aksamoto.com.tr/detay/201761597/hasarli-oto-2020-volvo-cekici-fm13-427-500-e' },
      { id: 56, aracNo: '201761666', brand: 'PEUGEOT', model: '3008 ACTIVE 1.2 PURETECH 130 EAT6', img: 'https://images.aksamoto.com.tr/2026/08/11/y1741198_20260811152948.jpeg', year: 2017, detayUrl: 'https://aksamoto.com.tr/detay/201761666/hasarli-oto-2017-peugeot-3008-active-12-puretech-130-eat6' },
      { id: 57, aracNo: '201761730', brand: 'HYUNDAI', model: 'IONIQ 5 ADVANCE 125 KW', img: 'https://images.aksamoto.com.tr/2026/07/31/y1776289_20260731090228.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201761730/hasarli-oto-2024-hyundai-ioniq-5-advance-125-kw' },
      { id: 58, aracNo: '201761736', brand: 'RENAULT', model: 'AUSTRAL TECHNO ESPRIT ALPINE M.HYBRID 160 AT', img: 'https://images.aksamoto.com.tr/2026/08/06/y6650704_20260806100938.jpeg', year: 2024, detayUrl: 'https://aksamoto.com.tr/detay/201761736/hasarli-oto-2024-renault-austral-techno-esprit-alpine-mhybrid-160-at' },
      { id: 59, aracNo: '201761968', brand: 'JEEP', model: 'JEEP CHEROKEE 2.0 9ATX LİMİTED AWD DIZEL', img: 'https://images.aksamoto.com.tr/2026/08/10/y4969902_20260810093024.jpg', year: 2015, detayUrl: 'https://aksamoto.com.tr/detay/201761968/hasarli-oto-2015-jeep-jeep-cherokee-20-9atx-limited-awd-dizel' }
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
