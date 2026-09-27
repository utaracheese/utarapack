const packGrid = document.getElementById('packGrid');
const footerNote = document.getElementById('footerNote');
const versionToggleContainer = document.getElementById('versionToggleContainer');
const cosplayPackBtn = document.getElementById('cosplayPackBtn');
const defaultPlaceholder = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80";

// Trạng thái hiện tại: version ('java' | 'bedrock') và chế độ Cosplay (true / false)
let currentVersion = 'java';
let isCosplayPackMode = false;
let searchQuery = "";

// ========================================================
// BỘ LỌC TÌM KIẾM THEO TÊN (TITLE) HOẶC TỪ KHÓA (KEY / KEYS)
// ========================================================
function filterPacks(list) {
  if (!searchQuery) return list;
  const q = searchQuery.toLowerCase().trim();

  return list.filter(pack => {
    // 1. Kiểm tra tiêu đề pack
    const titleMatch = pack.title && pack.title.toLowerCase().includes(q);

    // 2. Kiểm tra từ khóa ẩn (key / keys)
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

// HÀM HIỂN THỊ DANH SÁCH PACK
function renderPacks(list) {
  packGrid.innerHTML = ''; 

  if (!list || list.length === 0) {
    packGrid.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🎭</div>
        <div>${searchQuery ? `Không tìm thấy pack nào với từ khóa "<b>${searchQuery}</b>"` : 'Chưa có pack nào ở mục này nha!'}</div>
      </div>
    `;
    return;
  }

  list.forEach((pack) => {
    const card = document.createElement('div');
    card.className = 'pack-card';

    let currentIndex = 0;
    let intervalId = null;
    const totalImages = pack.images ? pack.images.length : 0;

    const slidesHtml = (pack.images || []).map(img => `
      <div class="carousel-slide">
        <img src="${img}" onerror="this.src='${defaultPlaceholder}'" alt="pack">
      </div>
    `).join('');

    const dotsHtml = totalImages > 1 ? `
      <div class="carousel-dots">
        ${pack.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
      </div>
    ` : '';

    const navHtml = totalImages > 1 ? `
      <button class="carousel-nav carousel-prev">&#10094;</button>
      <button class="carousel-nav carousel-next">&#10095;</button>
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
    const dots = card.querySelectorAll('.dot');

    function updateSlide(idx) {
      currentIndex = idx;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function nextSlide() {
      let nextIdx = (currentIndex + 1) % totalImages;
      updateSlide(nextIdx);
    }

    function prevSlide() {
      let prevIdx = (currentIndex - 1 + totalImages) % totalImages;
      updateSlide(prevIdx);
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
        intervalId = setInterval(nextSlide, 1500);
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

    packGrid.appendChild(card);
  });
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

// CHUYỂN ĐỔI TAB JAVA / BEDROCK
function switchVersion(type) {
  isCosplayPackMode = false;
  currentVersion = type;
  document.getElementById('tabJava').classList.toggle('active', type === 'java');
  document.getElementById('tabBedrock').classList.toggle('active', type === 'bedrock');
  updateView();
}

// BẬT / TẮT CHẾ ĐỘ KHO PACK COSPLAY
function toggleCosplayPackMode() {
  isCosplayPackMode = !isCosplayPackMode;
  updateView();
}

// Khởi chạy mặc định
updateView();

// ========================================================
// LOGIC THANH TÌM KIẾM, NÚT NHANH 210 & BONG BÓNG HƯỚNG DẪN
// ========================================================
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchDropdown = document.getElementById('searchDropdown');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const tagBtns = document.querySelectorAll('.tag-btn');
const searchWrapper = document.getElementById('searchWrapper');
const quickTag210 = document.getElementById('quickTag210');
const searchBubble = document.getElementById('searchBubble');

// Tự động xoá bong bóng chỉ dẫn sau đúng 2.5 giây
if (searchBubble) {
  setTimeout(() => {
    searchBubble.remove();
  }, 2500);
}

// Bật/tắt thanh tìm kiếm khi bấm kính lúp
searchToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = searchDropdown.classList.toggle('show');
  searchToggleBtn.classList.toggle('active', isOpen);
  if (isOpen) {
    searchInput.focus();
  }
});

// Nhập ký tự để tìm kiếm tức thì
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
  updateView();
});

// Nút xóa nhanh từ khóa (✕)
searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  searchInput.focus();
  updateView();
});

// Bấm nút gợi ý nhanh 210 bên cạnh kính lúp
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

// Nhấn vào các tag gợi ý trong menu (210, genshin, honkai,...)
tagBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tag = btn.getAttribute('data-tag');
    searchInput.value = tag;
    searchQuery = tag;
    searchClearBtn.style.display = 'flex';
    updateView();
  });
});

// Tắt menu tìm kiếm khi click ra ngoài
document.addEventListener('click', (e) => {
  if (!searchWrapper.contains(e.target)) {
    searchDropdown.classList.remove('show');
    searchToggleBtn.classList.remove('active');
  }
});
// ========================================================
// LOGIC MODAL CHI TIẾT PACK
// ========================================================
const modal = document.getElementById('detailModal');
const btnClose = document.getElementById('btnClose');
const modalTrack = document.getElementById('modalCarouselTrack');
const modalDots = document.getElementById('modalDots');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalTitle = document.getElementById('modalTitle');
const modalSource = document.getElementById('modalSource');
const modalDesc = document.getElementById('modalDesc');
const modalLinkBtn = document.getElementById('modalLinkBtn');
const btnCopyLink = document.getElementById('btnCopyLink');

let currentActiveLink = "";
let modalCurrentIdx = 0;
let modalTotalSlides = 0;

function updateModalSlide(idx) {
  modalCurrentIdx = idx;
  modalTrack.style.transform = `translateX(-${modalCurrentIdx * 100}%)`;
  const dots = modalDots.querySelectorAll('.dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === modalCurrentIdx));
}

modalNext.addEventListener('click', (e) => {
  e.stopPropagation();
  let next = (modalCurrentIdx + 1) % modalTotalSlides;
  updateModalSlide(next);
});

modalPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  let prev = (modalCurrentIdx - 1 + modalTotalSlides) % modalTotalSlides;
  updateModalSlide(prev);
});

function openModal(pack, initialImgIdx = 0) {
  modalTotalSlides = pack.images ? pack.images.length : 0;
  modalCurrentIdx = initialImgIdx;

  modalTrack.innerHTML = (pack.images || []).map(img => `
    <div class="carousel-slide">
      <img src="${img}" onerror="this.src='${defaultPlaceholder}'" alt="preview">
    </div>
  `).join('');

  if (modalTotalSlides > 1) {
    modalPrev.style.display = 'flex';
    modalNext.style.display = 'flex';
    modalDots.innerHTML = pack.images.map((_, i) => `<div class="dot ${i === modalCurrentIdx ? 'active' : ''}"></div>`).join('');
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
  modalLinkBtn.href = pack.link;
  currentActiveLink = pack.link;

  btnCopyLink.textContent = "📋 Sao chép Link";
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
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
// LOGIC HỘP THƯ
// ========================================================
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
}

const currentLetterHash = hashString(letterData.title + "::" + letterData.content);
const readLetterHash = localStorage.getItem('utara_read_letter_hash');
const mailRedDot = document.getElementById('mailRedDot');
const mailBtn = document.getElementById('mailBtn');
const mailModal = document.getElementById('mailModal');
const btnCloseMail = document.getElementById('btnCloseMail');
const btnReadMail = document.getElementById('btnReadMail');

if (readLetterHash !== currentLetterHash) {
  mailRedDot.classList.add('show');
}

function openMailModal() {
  document.getElementById('mailModalTitle').textContent = letterData.title;
  document.getElementById('mailModalBody').textContent = letterData.content;
  mailModal.classList.add('active');

  localStorage.setItem('utara_read_letter_hash', currentLetterHash);
  mailRedDot.classList.remove('show');
}

function closeMailModal() {
  mailModal.classList.remove('active');
}

mailBtn.addEventListener('click', openMailModal);
btnCloseMail.addEventListener('click', closeMailModal);
btnReadMail.addEventListener('click', closeMailModal);
mailModal.addEventListener('click', (e) => {
  if (e.target === mailModal) closeMailModal();
});

// ========================================================
// TIỀN TẢI (PRELOAD) ẢNH VÀO RAM NGAY TỨC THÌ
// ========================================================
const preloadQR1 = new Image();
preloadQR1.src = "assets/QR.png";

const preloadQR2 = new Image();
preloadQR2.src = "assets/qr2.jpg";

// ========================================================
// LOGIC MODAL QUẢNG CÁO DONATE & PHÓNG TO QR
// ========================================================
const promoModal = document.getElementById('promoModal');
const promoToast = document.getElementById('promoToast');
const btnZoomQR = document.getElementById('btnZoomQR');
const qrZoomModal = document.getElementById('qrZoomModal');
const btnCloseZoom = document.getElementById('btnCloseZoom');
const donateBtn = document.getElementById('donateBtn');

function openPromoModal() {
  promoModal.classList.add('active');
  promoToast.style.animation = 'none';
  void promoToast.offsetWidth;
  promoToast.style.animation = 'toastFade 2.6s forwards';
}

function closePromoModal() {
  promoModal.classList.remove('active');
}

donateBtn.addEventListener('click', () => {
  openPromoModal();
});

promoModal.addEventListener('click', (e) => {
  if (e.target === btnZoomQR || btnZoomQR.contains(e.target)) {
    return;
  }
  closePromoModal();
});

btnZoomQR.addEventListener('click', (e) => {
  e.stopPropagation();
  qrZoomModal.classList.add('active');
});

function closeZoomModal() {
  qrZoomModal.classList.remove('active');
}

btnCloseZoom.addEventListener('click', (e) => {
  e.stopPropagation();
  closeZoomModal();
});

qrZoomModal.addEventListener('click', () => {
  closeZoomModal();
});

/* HIỆU ỨNG TUYẾT RƠI */
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const flakes = Array.from({ length: 60 }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  radius: Math.random() * 2.8 + 1,
  speedY: Math.random() * 1 + 0.5,
  speedX: Math.random() * 0.4 - 0.2,
  opacity: Math.random() * 0.6 + 0.4
}));

function drawSnow() {
  ctx.clearRect(0, 0, width, height);
  flakes.forEach(flake => {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    ctx.fill();

    flake.y += flake.speedY;
    flake.x += flake.speedX;

    if (flake.y > height) {
      flake.y = -10;
      flake.x = Math.random() * width;
    }
  });
  requestAnimationFrame(drawSnow);
}
drawSnow();