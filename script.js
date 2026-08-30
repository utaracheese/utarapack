const packGrid = document.getElementById('packGrid');
const footerNote = document.getElementById('footerNote');
const versionToggleContainer = document.getElementById('versionToggleContainer');
const singlePackBtn = document.getElementById('singlePackBtn');
const defaultPlaceholder = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80";

// Trạng thái hiện tại: version ('java' | 'bedrock') và chế độ kho lẻ (true / false)
let currentVersion = 'java';
let isSinglePackMode = false;

// HÀM HIỂN THỊ DANH SÁCH PACK
function renderPacks(list) {
  packGrid.innerHTML = ''; 

  if (!list || list.length === 0) {
    packGrid.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">📦</div>
        <div>Chưa có pack nào ở mục này nha!</div>
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

    card.innerHTML = `
      <div class="carousel-container">
        <div class="carousel-track">${slidesHtml}</div>
        ${navHtml}
        ${dotsHtml}
      </div>
      <div class="card-footer">
        <span class="card-title" title="${pack.title}">${pack.title}</span>
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
  if (isSinglePackMode) {
    // Ẩn thanh chọn Java / Bedrock
    versionToggleContainer.classList.add('hidden');
    singlePackBtn.classList.add('active');
    
    // Hiển thị danh sách pack lẻ
    renderPacks(window.singlePackList || []);
    footerNote.textContent = notes.single || "Kho pack lẻ tổng hợp ❤";
  } else {
    // Hiện lại thanh chọn Java / Bedrock
    versionToggleContainer.classList.remove('hidden');
    singlePackBtn.classList.remove('active');

    // Hiển thị danh sách Java hoặc Bedrock
    if (currentVersion === 'java') {
      renderPacks(javaPackList);
      footerNote.textContent = notes.java;
    } else {
      renderPacks(bedrockPackList);
      footerNote.textContent = notes.bedrock;
    }
  }
}

// CHUYỂN ĐỔI TAB JAVA / BEDROCK
function switchVersion(type) {
  currentVersion = type;
  document.getElementById('tabJava').classList.toggle('active', type === 'java');
  document.getElementById('tabBedrock').classList.toggle('active', type === 'bedrock');
  updateView();
}

// BẬT / TẮT CHẾ ĐỘ KHO PACK LẺ
function toggleSinglePackMode() {
  isSinglePackMode = !isSinglePackMode;
  updateView();
}

// Khởi chạy mặc định
updateView();

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
// LOGIC HỘP THƯ & TỰ ĐỘNG RESET CHẤM ĐỎ
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