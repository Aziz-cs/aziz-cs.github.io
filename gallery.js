const dialog = document.querySelector('#artwork');
const preview = dialog.querySelector('img');
const caption = dialog.querySelector('figcaption');
const controls = dialog.querySelector('.gallery-controls');
let gallery = [];
let position = 0;

function showScreenshot() {
  const link = gallery[position];
  preview.src = link.href;
  preview.alt = link.querySelector('img').alt;
  const label = link.closest('figure').querySelector('figcaption').textContent;
  caption.textContent = `${label} · ${position + 1} / ${gallery.length}`;
}

function step(direction) {
  position = (position + direction + gallery.length) % gallery.length;
  showScreenshot();
}

document.querySelectorAll('[data-gallery]').forEach((group) => {
  const links = [...group.querySelectorAll('a')];
  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      gallery = links;
      position = index;
      controls.hidden = links.length < 2;
      showScreenshot();
      dialog.showModal();
    });
  });
});

controls.querySelectorAll('[data-step]').forEach((button) => {
  button.addEventListener('click', () => step(Number(button.dataset.step)));
});

dialog.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  step(event.key === 'ArrowLeft' ? -1 : 1);
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }
});

const reviewList = document.querySelector('#review-list');

const reviewCards = [...reviewList.children];
for (let index = reviewCards.length - 1; index > 0; index--) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [reviewCards[index], reviewCards[randomIndex]] = [reviewCards[randomIndex], reviewCards[index]];
}
reviewList.append(...reviewCards);

const reviewControls = document.querySelector('.review-controls');
const [reviewAutoplay, previousReview, nextReview] = reviewControls.querySelectorAll('button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hoverAvailable = matchMedia('(hover: hover)');
let reviewTimer;

function setReviewAutoplay(enabled) {
  clearInterval(reviewTimer);
  reviewTimer = enabled ? setInterval(advanceReviews, 3000) : undefined;
  reviewAutoplay.textContent = enabled ? 'Pause rotation' : 'Start rotation';
}

function advanceReviews() {
  const box = reviewList.getBoundingClientRect();
  if (document.hidden || box.bottom <= 0 || box.top >= window.innerHeight ||
      reviewList.matches(':focus-within, :active') ||
      (hoverAvailable.matches && reviewList.matches(':hover'))) return;
  if (nextReview.disabled) {
    reviewList.scrollTo({ left: 0 });
  } else {
    moveReviews(1);
  }
}

function updateReviewControls() {
  const remaining = reviewList.scrollWidth - reviewList.clientWidth - reviewList.scrollLeft;
  previousReview.disabled = reviewList.scrollLeft <= 1;
  nextReview.disabled = remaining <= 1;
}

function moveReviews(direction) {
  const first = reviewList.children[0].getBoundingClientRect();
  const second = reviewList.children[1].getBoundingClientRect();
  reviewList.scrollBy({ left: direction * (second.left - first.left), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}

reviewAutoplay.addEventListener('click', () => setReviewAutoplay(reviewTimer === undefined));
previousReview.addEventListener('click', () => {
  moveReviews(-1);
  setReviewAutoplay(false);
});
nextReview.addEventListener('click', () => {
  moveReviews(1);
  setReviewAutoplay(false);
});
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) setReviewAutoplay(false);
});
reviewList.addEventListener('scroll', updateReviewControls, { passive: true });
window.addEventListener('resize', updateReviewControls);
reviewControls.hidden = false;
updateReviewControls();
setReviewAutoplay(!reducedMotion.matches);
