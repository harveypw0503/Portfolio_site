const cards = document.querySelectorAll('.portfolio-card');
const modal = document.getElementById('galleryModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeBtn = document.querySelector('.modal-close');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentImages = [];
let currentIndex = 0;
let startX = 0;
let currentCard = null; // Track the opened card for caption fallback

// Safely get images — now supports objects with title/desc OR plain strings
function getImages(card) {
  if (card.dataset.images) {
    try {
      const parsed = JSON.parse(card.dataset.images);
      // If parsed items are strings, convert to objects
      return parsed.map(src => typeof src === 'string' ? { src, title: '', desc: '' } : src);
    } catch (e) {
      console.error("Bad JSON in data-images", card);
      return [];
    }
  }
  // Single image fallback
  const img = card.querySelector('img');
  return img?.src ? [{ src: img.src, title: '', desc: '' }] : [];
}

// Close modal
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Update image AND caption in modal
function updateModalImage() {
  if (currentImages.length === 0) return;

  const imgData = currentImages[currentIndex];
  modalImg.src = imgData.src;

  // Build caption: per-image title/desc first, then project fallback
  const projectTitle = currentCard ? currentCard.querySelector('.portfolio-title').textContent.trim() : '';
  const projectType = currentCard ? currentCard.querySelector('.portfolio-type').textContent.trim() : '';

  const title = imgData.title || projectTitle;
  const desc = imgData.desc || '';

  modalCaption.innerHTML = `
    <div style="margin-bottom: 8px;">
      <h3 style="margin: 0 0 8px 0; font-size: 1.6rem; color: var(--purple-2);">${title}</h3>
      ${desc ? `<p style="opacity: 0.9; font-size: 1rem; margin: 0;">${desc}</p>` : ''}
    </div>
    <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
      ${projectTitle} — ${projectType}
    </div>
  `;

  // Show/hide arrows
  if (currentImages.length <= 1) {
    prevBtn.style.display = nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = nextBtn.style.display = 'block';
  }
}

// Open modal
function openModal(card, startSrc = null) {
  currentCard = card; // Store for caption fallback
  currentImages = getImages(card);
  if (currentImages.length === 0) return;

  // Find starting index
  currentIndex = startSrc ? currentImages.findIndex(img => img.src === startSrc) : 0;
  if (currentIndex === -1) currentIndex = 0;

  updateModalImage();
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Navigation
function prevImage() {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  updateModalImage();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % currentImages.length;
  updateModalImage();
}

// === CARD SETUP ===
cards.forEach(card => {
  const imgEl = card.querySelector('img');
  const images = getImages(card);

  // Rotate thumbnail only if multiple images
  if (images.length > 1) {
    let currentThumbIndex = 0;
    let interval;

    const rotateInOrder = () => {
      // Change to next image in the array order
      imgEl.src = images[currentThumbIndex].src; // Use .src for objects

      // Move to next, loop back to 0 when we reach the end
      currentThumbIndex = (currentThumbIndex + 1) % images.length;
    };

    // Start with the first image in your data-images array
    imgEl.src = images[0].src; // Use .src
    currentThumbIndex = 1; // next one will be index 1

    // Rotate every 5–7 seconds
    const startRotation = () => {
      const delay = 5000 + Math.random() * 2000; // 5000–7000 ms
      interval = setInterval(rotateInOrder, delay);
    };

    startRotation();

    // Pause on hover or touch (super nice UX)
    card.addEventListener('mouseenter', () => clearInterval(interval));
    card.addEventListener('mouseleave', startRotation);
    card.addEventListener('touchstart', () => clearInterval(interval), { passive: true });
    card.addEventListener('touchend', startRotation);
  }

  // Click/Tap handling (double-click desktop, single-tap mobile)
  let taps = 0;
  let timer;

  const handleTap = (e) => {
    e.preventDefault();
    taps++;

    if (taps === 1) {
      timer = setTimeout(() => {
        taps = 0;
        // Mobile: open on single tap
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
          openModal(card, imgEl.src);
        }
      }, 300);
    } else if (taps === 2) {
      clearTimeout(timer);
      taps = 0;
      openModal(card, imgEl.src); // Desktop double-click + mobile double-tap
    }
  };

  card.style.cursor = 'pointer';
  card.addEventListener('click', handleTap);
});

// Close modal
closeBtn.onclick = closeModal;
modal.onclick = (e) => {
  if (e.target === modal || e.target === modalImg) closeModal();
};

// Arrow buttons
prevBtn.onclick = (e) => { e.stopPropagation(); prevImage(); };
nextBtn.onclick = (e) => { e.stopPropagation(); nextImage(); };

// Keyboard
document.addEventListener('keydown', (e) => {
  if (modal.style.display === 'block') {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeModal();
  }
});

// Mobile swipe
modal.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
}, { passive: true });

modal.addEventListener('touchend', (e) => {
  if (!startX) return;
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) > 50) {
    diff > 0 ? nextImage() : prevImage();
  }
  startX = 0;
});