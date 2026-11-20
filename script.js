// ========================================================
// TỰ ĐỘNG CHUYỂN GIAO DIỆN SÁNG / TỐI THEO GIỜ TRÊN MÁY
// (06:00 - 17:59: Sáng | 18:00 - 05:59: Tối)
// ========================================================
function applyAutoThemeByTime() {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 18;
  document.body.classList.toggle('light-theme', isDaytime);
}

applyAutoThemeByTime();
setInterval(applyAutoThemeByTime, 60000);

const packGrid = document.getElementById('packGrid');
const footerNote = document.getElementById('footerNote');
const versionToggleContainer = document.getElementById('versionToggleContainer');
const cosplayPackBtn = document.getElementById('cosplayPackBtn');
const defaultPlaceholder = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80";

let currentVersion = 'java';
let isCosplayPackMode = false;
let searchQuery = "";
let userRegion = 'vn';

// ========================================================
// TIỆN ÍCH TẢI ẢNH THEO NHU CẦU (LAZY + ON-DEMAND CAROUSEL)
// ========================================================
function loadImageElement(imgEl) {
  if (!imgEl || imgEl.dataset.loaded === '1') return;
  const src = imgEl.getAttribute('data-src');
  if (!src) return;

  imgEl.dataset.loaded = '1';
  imgEl.onload = () => imgEl.classList.add('is-loaded');
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = defaultPlaceholder;
    imgEl.classList.add('is-loaded');
  };
  imgEl.src = src;
  imgEl.removeAttribute('data-src');
}

const cardObserver = ('IntersectionObserver' in window)
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const firstImg = card.querySelector('.lazy-first-img');
        if (firstImg) loadImageElement(firstImg);
        observer.unobserve(card);
      });
    }, {
      root: packGrid,
      rootMargin: '250px 0px',
      threshold: 0.01
    })
  : null;

// ========================================================
// BỘ LỌC TÌM KIẾM THEO QUỐC GIA & TỪ KHÓA
// ========================================================
function filterPacks(list) {
  if (!list) return [];

  let filtered = list.filter(pack => {
    if (userRegion === 'other') {
      return pack.olink && typeof pack.olink === 'string' && pack.olink.trim() !== "";
    }
    return true;
  });

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(pack => {
      const titleMatch = pack.title && pack.title.toLowerCase().includes(q);
      let keyMatch = false;
      const packKey = pack.key || pack.keys;
      if (packKey) {
        if (Array.isArray(packKey)) {
          keyMatch = packKey.some(k => String(k).toLowerCase().includes(q));
        } else if (typeof packKey === 'string') {
          keyMatch = packKey.toLowerCase().includes(q);
        }
      }
      return titleMatch || keyMatch;
    });
  }

  return filtered;
}

// HÀM HIỂN THỊ DANH SÁCH PACK
function renderPacks(list) {
  if (cardObserver) cardObserver.disconnect();
  packGrid.innerHTML = '';

  if (!list || list.length === 0) {
    let emptyMsg = 'Chưa có pack nào ở mục này nha!';
    if (searchQuery) {
      emptyMsg = `Không tìm thấy pack nào với từ khóa "<b>${searchQuery}</b>"`;
    } else if (userRegion === 'other') {
      emptyMsg = 'Hiện tại chưa có pack nào khả dụng cho khu vực quốc tế (chưa có olink).';
    }

    packGrid.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🎭</div>
        <div>${emptyMsg}</div>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach((pack) => {
    const card = document.createElement('div');
    card.className = 'pack-card';

    let currentIndex = 0;
    let intervalId = null;
    const images = pack.images || [];
    const totalImages = images.length;

    const slidesHtml = images.map((img, i) => `
      <div class="carousel-slide">
        <img class="${i === 0 ? 'lazy-first-img' : 'deferred-slide-img'}" data-src="${img}" decoding="async" alt="pack">
      </div>
    `).join('');

    const dotsHtml = totalImages > 1 ? `
      <div class="carousel-dots">
        ${images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
      </div>
    ` : '';

    const navHtml = totalImages > 1 ? `
      <button class="carousel-nav carousel-prev" type="button">&#10094;</button>
      <button class="carousel-nav carousel-next" type="button">&#10095;</button>
    ` : '';

    const sourceHtml = pack.source ? `
      <div class="card-source" title="${pack.source}">${pack.source}</div>
    ` : '';

    card.innerHTML = `
      <div class="carousel-container">
        <div class="carousel-track">${slidesHtml}</div>
        ${navHtml}
        ${dotsHtml}
      </div>
      <div class="card-footer">
        <span class="card-title" title="${pack.title}">${pack.title}</span>
        ${sourceHtml}
      </div>
    `;

    const track = card.querySelector('.carousel-track');
    const slideImgs = card.querySelectorAll('.carousel-slide img');
    const dots = card.querySelectorAll('.dot');

    function ensureSlideLoaded(idx) {
      if (slideImgs[idx]) loadImageElement(slideImgs[idx]);
      if (totalImages > 1) {
        const nextIdx = (idx + 1) % totalImages;
        if (slideImgs[nextIdx]) loadImageElement(slideImgs[nextIdx]);
      }
    }

    function updateSlide(idx) {
      currentIndex = idx;
      ensureSlideLoaded(currentIndex);
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function nextSlide() {
      updateSlide((currentIndex + 1) % totalImages);
    }

    function prevSlide() {
      updateSlide((currentIndex - 1 + totalImages) % totalImages);
    }

    if (totalImages > 1) {
      card.querySelector('.carousel-next').addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });
      card.querySelector('.carousel-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });

      card.addEventListener('mouseenter', () => {
        ensureSlideLoaded(currentIndex);
        if (!intervalId) intervalId = setInterval(nextSlide, 1500);
      });

      card.addEventListener('mouseleave', () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      });
    }

    card.addEventListener('click', () => {
      openModal(pack, currentIndex);
    });

    if (cardObserver) {
      cardObserver.observe(card);
    } else if (slideImgs[0]) {
      loadImageElement(slideImgs[0]);
    }

    fragment.appendChild(card);
  });

  packGrid.appendChild(fragment);
  packGrid.scrollTop = 0;
}

// CẬP NHẬT GIAO DIỆN
function updateView() {
  if (isCosplayPackMode) {
    versionToggleContainer.classList.add('hidden');
    cosplayPackBtn.classList.add('active');

    const list = (typeof cosplayPackList !== 'undefined') ? cosplayPackList : [];
    renderPacks(filterPacks(list));
    footerNote.textContent = notes.cosplay || "Các pack cosplay mình sẽ không đăng lên tiktok để thông báo được nên mọi người có thể vào đây để kiểm tra theo thời gian nha.";
  } else {
    versionToggleContainer.classList.remove('hidden');
    cosplayPackBtn.classList.remove('active');

    if (currentVersion === 'java') {
      renderPacks(filterPacks(javaPackList));
      footerNote.textContent = notes.java;
    } else {
      renderPacks(filterPacks(bedrockPackList));
      footerNote.textContent = notes.bedrock;
    }
  }
}

function switchVersion(type) {
  isCosplayPackMode = false;
  currentVersion = type;
  document.getElementById('tabJava').classList.toggle('active', type === 'java');
  document.getElementById('tabBedrock').classList.toggle('active', type === 'bedrock');
  updateView();
}

function toggleCosplayPackMode() {
  isCosplayPackMode = !isCosplayPackMode;
  updateView();
}

updateView();

// ========================================================
// LOGIC CHỌN QUỐC GIA (VIỆT NAM / OTHER)
// ========================================================
const countryModal = document.getElementById('countryModal');
const btnCountryVn = document.getElementById('btnCountryVn');
const btnCountryOther = document.getElementById('btnCountryOther');

btnCountryVn.addEventListener('click', () => {
  userRegion = 'vn';
  countryModal.classList.remove('active');
  updateView();
});

btnCountryOther.addEventListener('click', () => {
  userRegion = 'other';
  countryModal.classList.remove('active');
  updateView();
});

// ========================================================
// LOGIC THANH TÌM KIẾM (CÓ DEBOUNCE) & NÚT NHANH 210
// ========================================================
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchDropdown = document.getElementById('searchDropdown');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const tagBtns = document.querySelectorAll('.tag-btn');
const searchWrapper = document.getElementById('searchWrapper');
const quickTag210 = document.getElementById('quickTag210');
const searchBubble = document.getElementById('searchBubble');

if (searchBubble) {
  setTimeout(() => {
    searchBubble.remove();
  }, 2500);
}

searchToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = searchDropdown.classList.toggle('show');
  searchToggleBtn.classList.toggle('active', isOpen);
  if (isOpen) searchInput.focus();
});

let searchDebounceTimer = null;
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(updateView, 120);
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  searchInput.focus();
  updateView();
});

if (quickTag210) {
  quickTag210.addEventListener('click', () => {
    searchInput.value = '210';
    searchQuery = '210';
    searchClearBtn.style.display = 'flex';
    searchDropdown.classList.add('show');
    searchToggleBtn.classList.add('active');
    updateView();
  });
}

tagBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tag = btn.getAttribute('data-tag');
    searchInput.value = tag;
    searchQuery = tag;
    searchClearBtn.style.display = 'flex';
    updateView();
  });
});

document.addEventListener('click', (e) => {
  if (!searchWrapper.contains(e.target)) {
    searchDropdown.classList.remove('show');
    searchToggleBtn.classList.remove('active');
  }
});

// ========================================================
// LOGIC MODAL CHI TIẾT PACK + NHÚNG BÀI ĐĂNG TIKTOK BÊN PHẢI
// ========================================================
const modal = document.getElementById('detailModal');
const detailModalContent = document.getElementById('detailModalContent');
const btnClose = document.getElementById('btnClose');
const modalCarouselContainer = document.getElementById('modalCarouselContainer');
const modalTrack = document.getElementById('modalCarouselTrack');
const modalDots = document.getElementById('modalDots');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalTitle = document.getElementById('modalTitle');
const modalSource = document.getElementById('modalSource');
const modalDesc = document.getElementById('modalDesc');
const modalLinkBtn = document.getElementById('modalLinkBtn');
const btnCopyLink = document.getElementById('btnCopyLink');
const modalTiktokWrap = document.getElementById('modalTiktokWrap');
const modalTiktokDirectLink = document.getElementById('modalTiktokDirectLink');

let currentActiveLink = "";
let modalCurrentIdx = 0;
let modalTotalSlides = 0;
let modalImgs = [];

function extractTikTokVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/\/(?:video|photo)\/(\d+)/i);
  return match ? match[1] : null;
}

function renderTikTokEmbed(linktt) {
  const cleanUrl = (linktt || '').trim();
  if (!cleanUrl) {
    detailModalContent.classList.remove('has-tiktok');
    modalTiktokWrap.innerHTML = '';
    return;
  }

  detailModalContent.classList.add('has-tiktok');
  modalTiktokDirectLink.href = cleanUrl;

  const videoId = extractTikTokVideoId(cleanUrl);
  if (videoId) {
    modalTiktokWrap.innerHTML = `
      <iframe
        src="https://www.tiktok.com/embed/v2/${videoId}"
        allowfullscreen
        scrolling="no"
        allow="encrypted-media;"
        loading="lazy"
        title="TikTok Post">
      </iframe>
    `;
  } else {
    modalTiktokWrap.innerHTML = `
      <div class="tiktok-fallback-box">
        <div style="font-size: 2rem;">🎵</div>
        <div>Link này không phải link bài viết đầy đủ (<code>/video/...</code>), nên không thể tự nhúng trực tiếp.</div>
        <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: unset; padding: 9px 16px;">Mở bài đăng TikTok</a>
      </div>
    `;
  }
}

function updateModalSlide(idx) {
  if (modalTotalSlides === 0) return;
  modalCurrentIdx = idx;

  loadImageElement(modalImgs[modalCurrentIdx]);
  if (modalTotalSlides > 1) {
    loadImageElement(modalImgs[(modalCurrentIdx + 1) % modalTotalSlides]);
    loadImageElement(modalImgs[(modalCurrentIdx - 1 + modalTotalSlides) % modalTotalSlides]);
  }

  modalTrack.style.transform = `translateX(-${modalCurrentIdx * 100}%)`;
  const dots = modalDots.querySelectorAll('.dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === modalCurrentIdx));
}

modalNext.addEventListener('click', (e) => {
  e.stopPropagation();
  if (modalTotalSlides <= 1) return;
  updateModalSlide((modalCurrentIdx + 1) % modalTotalSlides);
});

modalPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  if (modalTotalSlides <= 1) return;
  updateModalSlide((modalCurrentIdx - 1 + modalTotalSlides) % modalTotalSlides);
});

let touchStartX = 0;
modalCarouselContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

modalCarouselContainer.addEventListener('touchend', (e) => {
  if (modalTotalSlides <= 1) return;
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 40) {
    if (diff < 0) updateModalSlide((modalCurrentIdx + 1) % modalTotalSlides);
    else updateModalSlide((modalCurrentIdx - 1 + modalTotalSlides) % modalTotalSlides);
  }
}, { passive: true });

function openModal(pack, initialImgIdx = 0) {
  const images = pack.images || [];
  modalTotalSlides = images.length;
  modalCurrentIdx = initialImgIdx;

  modalTrack.innerHTML = images.map(img => `
    <div class="carousel-slide">
      <img data-src="${img}" decoding="async" alt="preview">
    </div>
  `).join('');

  modalImgs = Array.from(modalTrack.querySelectorAll('img'));

  if (modalTotalSlides > 1) {
    modalPrev.style.display = 'flex';
    modalNext.style.display = 'flex';
    modalDots.innerHTML = images.map((_, i) => `<div class="dot ${i === modalCurrentIdx ? 'active' : ''}"></div>`).join('');
  } else {
    modalPrev.style.display = 'none';
    modalNext.style.display = 'none';
    modalDots.innerHTML = '';
  }

  updateModalSlide(modalCurrentIdx);
  modalTitle.textContent = pack.title;

  if (pack.source) {
    modalSource.textContent = pack.source;
    modalSource.style.display = 'block';
  } else {
    modalSource.style.display = 'none';
  }

  modalDesc.textContent = pack.desc || "Không có mô tả chi tiết cho pack này.";

  const downloadLink = (userRegion === 'other' && pack.olink) ? pack.olink : pack.link;
  modalLinkBtn.href = downloadLink;
  currentActiveLink = downloadLink;

  renderTikTokEmbed(pack.linktt);

  btnCopyLink.textContent = "📋 Sao chép Link";
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  modalTiktokWrap.innerHTML = '';
  detailModalContent.classList.remove('has-tiktok');
}

btnClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

btnCopyLink.addEventListener('click', () => {
  navigator.clipboard.writeText(currentActiveLink).then(() => {
    btnCopyLink.textContent = "✅ Đã sao chép!";
    setTimeout(() => {
      btnCopyLink.textContent = "📋 Sao chép Link";
    }, 2000);
  });
});

// ========================================================
// LOGIC MODAL QUẢNG CÁO DONATE & PHÓNG TO QR (LAZY ON CLICK)
// ========================================================
const promoModal = document.getElementById('promoModal');
const promoToast = document.getElementById('promoToast');
const promoImage = document.getElementById('promoImage');
const btnZoomQR = document.getElementById('btnZoomQR');
const qrZoomModal = document.getElementById('qrZoomModal');
const zoomImage = document.getElementById('zoomImage');
const btnCloseZoom = document.getElementById('btnCloseZoom');
const donateBtn = document.getElementById('donateBtn');

function openPromoModal() {
  if (promoImage && !promoImage.src && promoImage.dataset.src) {
    promoImage.src = promoImage.dataset.src;
  }
  promoModal.classList.add('active');
  promoToast.style.animation = 'none';
  void promoToast.offsetWidth;
  promoToast.style.animation = 'toastFade 2.6s forwards';
}

function closePromoModal() {
  promoModal.classList.remove('active');
}

donateBtn.addEventListener('click', openPromoModal);

promoModal.addEventListener('click', (e) => {
  if (e.target === btnZoomQR || btnZoomQR.contains(e.target)) return;
  closePromoModal();
});

btnZoomQR.addEventListener('click', (e) => {
  e.stopPropagation();
  if (zoomImage && !zoomImage.src && zoomImage.dataset.src) {
    zoomImage.src = zoomImage.dataset.src;
  }
  qrZoomModal.classList.add('active');
});

function closeZoomModal() {
  qrZoomModal.classList.remove('active');
}

btnCloseZoom.addEventListener('click', (e) => {
  e.stopPropagation();
  closeZoomModal();
});

qrZoomModal.addEventListener('click', closeZoomModal);

// ========================================================
// LOGIC TRÌNH TEST SKYBOX 3D (MỞ KHI ẤN NÚT 🌌)
// ========================================================
const skyTestBtn = document.getElementById('skyTestBtn');
const skyboxModal = document.getElementById('skyboxModal');
const skyViewport = document.getElementById('skyViewport');
const skyLoading = document.getElementById('skyLoading');
const skyUiPanel = document.getElementById('skyUiPanel');
const skyToggleUiBtn = document.getElementById('skyToggleUiBtn');
const skyCloseBtn = document.getElementById('skyCloseBtn');
const skyInput = document.getElementById('skyInput');
const skyScreenshotBtn = document.getElementById('skyScreenshotBtn');
const skyFovSlider = document.getElementById('skyFovSlider');
const skyFovVal = document.getElementById('skyFovVal');
const skyAutoRotate = document.getElementById('skyAutoRotate');
const skyWireframeToggle = document.getElementById('skyWireframeToggle');
const skyLayoutMode = document.getElementById('skyLayoutMode');
const skyCrosshair = document.getElementById('skyCrosshair');
const skyInfoBar = document.getElementById('skyInfoBar');

let skyInitialized = false;
let skyScene, skyCamera, skyRenderer, skyControls;
let skyboxMesh = null;
let skyWireframeMesh = null;
let skyCurrentImage = null;
let skyAnimId = null;

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function openSkyboxTester() {
  skyboxModal.classList.add('active');
  skyboxModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('skybox-open');

  if (!skyInitialized) {
    skyLoading.classList.remove('hidden');
    try {
      if (!window.THREE) {
        await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      }
      if (!window.THREE.OrbitControls) {
        await loadExternalScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
      }
      initSkyboxScene();
      skyInitialized = true;
    } catch (err) {
      skyLoading.innerHTML = '<div>❌ Không tải được thư viện 3D. Vui lòng kiểm tra kết nối mạng.</div>';
      return;
    }
    skyLoading.classList.add('hidden');
  } else {
    onSkyResize();
  }

  startSkyAnimation();
}

function closeSkyboxTester() {
  skyboxModal.classList.remove('active');
  skyboxModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('skybox-open');
  stopSkyAnimation();
}

function initSkyboxScene() {
  skyScene = new THREE.Scene();
  skyCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  skyCamera.position.set(0, 0, 0.01);

  skyRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  skyRenderer.setSize(window.innerWidth, window.innerHeight);
  skyRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  skyViewport.appendChild(skyRenderer.domElement);

  skyControls = new THREE.OrbitControls(skyCamera, skyRenderer.domElement);
  skyControls.enableZoom = false;
  skyControls.enablePan = false;
  skyControls.rotateSpeed = -0.45;
  skyControls.enableDamping = true;
  skyControls.dampingFactor = 0.08;

  createSkyPlaceholderBox();
  window.addEventListener('resize', onSkyResize);
}

function createSkyPlaceholderBox() {
  const geo = new THREE.BoxGeometry(1000, 1000, 1000);
  const mat = new THREE.MeshBasicMaterial({ color: 0x161b26, side: THREE.BackSide });
  skyboxMesh = new THREE.Mesh(geo, mat);
  skyScene.add(skyboxMesh);

  const wireGeo = new THREE.EdgesGeometry(geo);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
  skyWireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
  skyWireframeMesh.visible = false;
  skyScene.add(skyWireframeMesh);
}

function sliceSkyTile(img, col, row, rotateDeg = 0) {
  const tileW = Math.floor(img.width / 3);
  const tileH = Math.floor(img.height / 2);

  const c = document.createElement('canvas');
  c.width = tileW;
  c.height = tileH;
  const cCtx = c.getContext('2d');

  cCtx.save();
  cCtx.translate(tileW / 2, tileH / 2);
  cCtx.rotate((rotateDeg * Math.PI) / 180);
  cCtx.drawImage(
    img,
    col * tileW, row * tileH, tileW, tileH,
    -tileW / 2, -tileH / 2, tileW, tileH
  );
  cCtx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function buildCubemapFrom3x2(img) {
  const mode = skyLayoutMode.value;
  const texBottom = sliceSkyTile(img, 0, 0, mode === 'alt' ? 180 : 0);
  const texTop    = sliceSkyTile(img, 1, 0, mode === 'alt' ? 180 : 0);
  const texSouth  = sliceSkyTile(img, 2, 0, 0);
  const texWest   = sliceSkyTile(img, 0, 1, 0);
  const texNorth  = sliceSkyTile(img, 1, 1, 0);
  const texEast   = sliceSkyTile(img, 2, 1, 0);

  const materials = [
    new THREE.MeshBasicMaterial({ map: texWest,   side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texEast,   side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texTop,    side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texBottom, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texSouth,  side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texNorth,  side: THREE.BackSide }),
  ];

  if (skyboxMesh) {
    skyScene.remove(skyboxMesh);
    if (Array.isArray(skyboxMesh.material)) {
      skyboxMesh.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    } else if (skyboxMesh.material) {
      skyboxMesh.material.dispose();
    }
    skyboxMesh.geometry.dispose();
  }

  const geo = new THREE.BoxGeometry(1000, 1000, 1000);
  skyboxMesh = new THREE.Mesh(geo, materials);
  skyScene.add(skyboxMesh);
}

function loadSkyImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      skyCurrentImage = img;
      if (skyInitialized) buildCubemapFrom3x2(img);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function toggleSkyUI() {
  const isHidden = skyUiPanel.classList.toggle('hidden');
  skyToggleUiBtn.textContent = isHidden ? '👁 Hiện Menu (H)' : '👁 Ẩn Menu (H)';
  skyInfoBar.style.display = isHidden ? 'none' : 'block';
  skyCrosshair.style.display = isHidden ? 'none' : 'block';
}

function takeSkyScreenshot() {
  if (!skyRenderer || !skyScene || !skyCamera) return;
  const prevDisplay = skyCrosshair.style.display;
  skyCrosshair.style.display = 'none';
  skyRenderer.render(skyScene, skyCamera);
  const dataURL = skyRenderer.domElement.toDataURL('image/png');
  skyCrosshair.style.display = prevDisplay;

  const link = document.createElement('a');
  link.download = `skybox_view_${Date.now()}.png`;
  link.href = dataURL;
  link.click();
}

function onSkyResize() {
  if (!skyRenderer || !skyCamera || !skyboxModal.classList.contains('active')) return;
  skyCamera.aspect = window.innerWidth / window.innerHeight;
  skyCamera.updateProjectionMatrix();
  skyRenderer.setSize(window.innerWidth, window.innerHeight);
}

function startSkyAnimation() {
  if (skyAnimId) return;
  function loop() {
    if (!skyboxModal.classList.contains('active')) {
      skyAnimId = null;
      return;
    }
    if (skyControls && skyRenderer && skyScene && skyCamera) {
      skyControls.update();
      skyRenderer.render(skyScene, skyCamera);
    }
    skyAnimId = requestAnimationFrame(loop);
  }
  skyAnimId = requestAnimationFrame(loop);
}

function stopSkyAnimation() {
  if (skyAnimId) {
    cancelAnimationFrame(skyAnimId);
    skyAnimId = null;
  }
}

skyTestBtn.addEventListener('click', openSkyboxTester);
skyCloseBtn.addEventListener('click', closeSkyboxTester);
skyToggleUiBtn.addEventListener('click', toggleSkyUI);
skyScreenshotBtn.addEventListener('click', takeSkyScreenshot);

skyInput.addEventListener('change', (e) => {
  loadSkyImageFile(e.target.files[0]);
});

skyboxModal.addEventListener('dragover', (e) => e.preventDefault());
skyboxModal.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    loadSkyImageFile(e.dataTransfer.files[0]);
  }
});

skyFovSlider.addEventListener('input', (e) => {
  if (!skyCamera) return;
  skyCamera.fov = parseInt(e.target.value, 10);
  skyFovVal.textContent = skyCamera.fov + '°';
  skyCamera.updateProjectionMatrix();
});

skyAutoRotate.addEventListener('change', (e) => {
  if (!skyControls) return;
  skyControls.autoRotate = e.target.checked;
  skyControls.autoRotateSpeed = 0.6;
});

skyWireframeToggle.addEventListener('change', (e) => {
  if (skyWireframeMesh) skyWireframeMesh.visible = e.target.checked;
});

skyLayoutMode.addEventListener('change', () => {
  if (skyCurrentImage && skyInitialized) buildCubemapFrom3x2(skyCurrentImage);
});

skyboxModal.addEventListener('wheel', (e) => {
  if (!skyCamera || !skyboxModal.classList.contains('active')) return;
  e.preventDefault();
  let newFov = skyCamera.fov + (e.deltaY > 0 ? 4 : -4);
  newFov = Math.max(35, Math.min(115, newFov));
  skyCamera.fov = newFov;
  skyFovSlider.value = newFov;
  skyFovVal.textContent = newFov + '°';
  skyCamera.updateProjectionMatrix();
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (!skyboxModal.classList.contains('active')) return;
  const k = e.key.toLowerCase();
  if (k === 'h') toggleSkyUI();
  else if (k === 'f') takeSkyScreenshot();
  else if (e.key === 'Escape') closeSkyboxTester();
});

// ========================================================
// HIỆU ỨNG TUYẾT RƠI & TƯƠNG TÁC CHUỘT ĐÈN LỒNG ẤM
// ========================================================
(() => {
  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function makeGlowSprite(size, c0, c1, c2) {
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const g = off.getContext('2d');
    const half = size / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.45, c1);
    grad.addColorStop(1, c2);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return off;
  }

  const lanternSprite = makeGlowSprite(
    220,
    'rgba(251, 191, 36, 0.22)',
    'rgba(234, 88, 12, 0.08)',
    'rgba(234, 88, 12, 0)'
  );

  const warmFlakeHalo = makeGlowSprite(
    28,
    'rgba(254, 240, 138, 0.95)',
    'rgba(251, 146, 60, 0.35)',
    'rgba(251, 146, 60, 0)'
  );

  const pointer = {
    targetX: width / 2,
    targetY: height / 2,
    x: width / 2,
    y: height / 2,
    prevX: width / 2,
    prevY: height / 2,
    vx: 0,
    vy: 0,
    active: false,
    alpha: 0
  };

  const cursorTrail = [];
  const MAX_TRAIL = 18;

  const isMobileScreen = window.innerWidth <= 768;
  const flakeCount = isMobileScreen ? 32 : 56;
  const INTERACT_RADIUS = isMobileScreen ? 105 : 145;
  const INTERACT_RADIUS_SQ = INTERACT_RADIUS * INTERACT_RADIUS;

  const flakes = Array.from({ length: flakeCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2.3 + 1.0,
    speedY: Math.random() * 0.85 + 0.45,
    vx: 0,
    vy: 0,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.018 + 0.008,
    opacity: Math.random() * 0.5 + 0.28,
    warmth: 0,
    baseWarmTint: Math.random() < 0.2
  }));

  window.addEventListener('pointermove', (e) => {
    if (document.body.classList.contains('skybox-open')) return;
    pointer.targetX = e.clientX;
    pointer.targetY = e.clientY;
    if (!pointer.active) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.prevX = e.clientX;
      pointer.prevY = e.clientY;
    }
    pointer.active = true;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  window.addEventListener('blur', () => {
    pointer.active = false;
  });

  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') pointer.active = false;
  }, { passive: true });

  window.addEventListener('pointercancel', () => {
    pointer.active = false;
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    if (document.body.classList.contains('skybox-open')) return;
    const cx = e.clientX;
    const cy = e.clientY;
    const gustRadius = INTERACT_RADIUS * 1.15;
    const gustRadiusSq = gustRadius * gustRadius;

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      const dx = f.x - cx;
      const dy = f.y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq > 1 && distSq < gustRadiusSq) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / gustRadius) * 4.2;
        f.vx += (dx / dist) * force;
        f.vy += (dy / dist) * force - 0.6;
        f.warmth = 1;
      }
    }
  }, { passive: true });

  function drawSnow() {
    if (!document.hidden && !document.body.classList.contains('skybox-open')) {
      ctx.clearRect(0, 0, width, height);

      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x += (pointer.targetX - pointer.x) * 0.22;
      pointer.y += (pointer.targetY - pointer.y) * 0.22;

      const rawVx = pointer.x - pointer.prevX;
      const rawVy = pointer.y - pointer.prevY;
      pointer.vx = Math.max(-14, Math.min(14, rawVx));
      pointer.vy = Math.max(-14, Math.min(14, rawVy));

      const targetAlpha = pointer.active ? 1 : 0;
      pointer.alpha += (targetAlpha - pointer.alpha) * 0.1;

      if (pointer.alpha > 0.02) {
        ctx.globalAlpha = pointer.alpha;
        ctx.drawImage(lanternSprite, pointer.x - 110, pointer.y - 110, 220, 220);
        ctx.globalAlpha = 1;

        const speedSq = pointer.vx * pointer.vx + pointer.vy * pointer.vy;
        if (speedSq > 9 && cursorTrail.length < MAX_TRAIL && Math.random() < 0.55) {
          cursorTrail.push({
            x: pointer.x + (Math.random() * 14 - 7),
            y: pointer.y + (Math.random() * 14 - 7),
            vx: -pointer.vx * 0.08 + (Math.random() * 0.5 - 0.25),
            vy: -pointer.vy * 0.08 - Math.random() * 0.45,
            life: 1,
            size: Math.random() * 10 + 8
          });
        }
      }

      for (let i = cursorTrail.length - 1; i >= 0; i--) {
        const t = cursorTrail[i];
        t.x += t.vx;
        t.y += t.vy;
        t.life -= 0.032;
        if (t.life <= 0) {
          cursorTrail.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = t.life * 0.75;
        ctx.drawImage(warmFlakeHalo, t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];
        flake.swayPhase += flake.swaySpeed;

        if (pointer.alpha > 0.08) {
          const dx = flake.x - pointer.x;
          const dy = flake.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < INTERACT_RADIUS_SQ) {
            const dist = Math.sqrt(distSq) || 1;
            const influence = 1 - dist / INTERACT_RADIUS;

            flake.warmth = Math.min(1, flake.warmth + influence * 0.16);

            const push = influence * 0.16;
            flake.vx += (dx / dist) * push + pointer.vx * influence * 0.055;
            flake.vy += (dy / dist) * push * 0.6 + pointer.vy * influence * 0.045 - influence * 0.05;
          } else {
            flake.warmth = Math.max(0, flake.warmth - 0.025);
          }
        } else {
          flake.warmth = Math.max(0, flake.warmth - 0.03);
        }

        flake.vx *= 0.94;
        flake.vy *= 0.94;

        flake.y += flake.speedY + flake.vy;
        flake.x += Math.sin(flake.swayPhase) * 0.35 + flake.vx;

        if (flake.y > height + 12) {
          flake.y = -10;
          flake.x = Math.random() * width;
          flake.vx = 0;
          flake.vy = 0;
          flake.warmth = 0;
        } else if (flake.x > width + 12) {
          flake.x = -10;
        } else if (flake.x < -12) {
          flake.x = width + 10;
        }

        if (flake.warmth > 0.05) {
          const haloSize = (flake.radius * 5.2 + 6) * (0.65 + flake.warmth * 0.45);
          ctx.globalAlpha = flake.warmth * 0.85;
          ctx.drawImage(
            warmFlakeHalo,
            flake.x - haloSize / 2,
            flake.y - haloSize / 2,
            haloSize,
            haloSize
          );
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius + flake.warmth * 0.45, 0, Math.PI * 2);
        if (flake.warmth > 0.1) {
          ctx.fillStyle = `rgba(254, 243, 199, ${Math.min(1, flake.opacity + flake.warmth * 0.4)})`;
        } else {
          ctx.fillStyle = flake.baseWarmTint
            ? `rgba(254, 243, 199, ${flake.opacity})`
            : `rgba(241, 245, 249, ${flake.opacity})`;
        }
        ctx.fill();
      }
    }

    requestAnimationFrame(drawSnow);
  }

  drawSnow();
})();