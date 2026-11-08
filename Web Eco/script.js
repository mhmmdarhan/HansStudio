const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const cartTrigger = document.querySelector('#cart-trigger');
const cartDialog = document.querySelector('#cart-dialog');
const paymentDialog = document.querySelector('#payment-dialog');
const portfolioDialog = document.querySelector('#portfolio-dialog');
const portfolioPreviewImage = document.querySelector('#portfolio-preview-image');
const portfolioPreviewCategory = document.querySelector('#portfolio-preview-category');
const portfolioPreviewTitle = document.querySelector('#portfolio-preview-title');
const cartItems = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const paymentTotal = document.querySelector('#payment-total');
const checkoutButton = document.querySelector('#checkout-button');
const paymentConfirmLink = document.querySelector('#payment-confirm-link');
const qrArea = document.querySelector('#qr-area');
const portfolioGrid = document.querySelector('.portfolio-grid');
const whatsappComposer = document.querySelector('#whatsapp-composer');
const whatsappCategory = document.querySelector('#whatsapp-category');
const whatsappMessage = document.querySelector('#whatsapp-message');
const whatsappNumber = '6288233141632';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem('hansstudio-cart') || '[]');
  if (Array.isArray(savedCart)) {
    cart = savedCart.filter((item) => item && typeof item.name === 'string' && Number.isFinite(item.price) && Number.isFinite(item.quantity));
  }
} catch {
  cart = [];
}

const saveCart = () => {
  try {
    localStorage.setItem('hansstudio-cart', JSON.stringify(cart));
  } catch {
    // The cart remains usable for the current page if storage is unavailable.
  }
};

const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

const renderCart = () => {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = String(itemCount);
  cartTrigger.setAttribute('aria-label', `Buka keranjang, ${itemCount} item`);
  cartTotal.textContent = currency.format(getCartTotal());
  cartEmpty.hidden = cart.length > 0;
  cartItems.hidden = cart.length === 0;
  checkoutButton.disabled = cart.length === 0;
  cartItems.replaceChildren();

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';

    const info = document.createElement('div');
    info.className = 'cart-item-info';
    const name = document.createElement('strong');
    name.textContent = `Paket ${item.name}`;
    const unitPrice = document.createElement('span');
    unitPrice.textContent = `${item.quantity} x ${currency.format(item.price)}`;
    info.append(name, unitPrice);

    const quantity = document.createElement('div');
    quantity.className = 'cart-item-quantity';
    const decrease = document.createElement('button');
    decrease.className = 'quantity-button';
    decrease.type = 'button';
    decrease.dataset.action = 'decrease';
    decrease.dataset.package = item.name;
    decrease.setAttribute('aria-label', `Kurangi Paket ${item.name}`);
    decrease.textContent = '-';
    const quantityValue = document.createElement('span');
    quantityValue.textContent = String(item.quantity);
    const increase = document.createElement('button');
    increase.className = 'quantity-button';
    increase.type = 'button';
    increase.dataset.action = 'increase';
    increase.dataset.package = item.name;
    increase.setAttribute('aria-label', `Tambah Paket ${item.name}`);
    increase.textContent = '+';
    quantity.append(decrease, quantityValue, increase);

    const itemTotal = document.createElement('strong');
    itemTotal.className = 'cart-item-price';
    itemTotal.textContent = currency.format(item.price * item.quantity);
    row.append(info, quantity, itemTotal);
    cartItems.append(row);
  });
};

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const packageName = button.dataset.package;
    const packagePrice = Number(button.dataset.price);
    const existingItem = cart.find((item) => item.name === packageName);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name: packageName, price: packagePrice, quantity: 1 });
    }

    saveCart();
    renderCart();
    cartDialog.showModal();
  });
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = cart.find((entry) => entry.name === button.dataset.package);
  if (!item) return;

  item.quantity += button.dataset.action === 'increase' ? 1 : -1;
  cart = cart.filter((entry) => entry.quantity > 0);
  saveCart();
  renderCart();
});

cartTrigger.addEventListener('click', () => cartDialog.showModal());

checkoutButton.addEventListener('click', () => {
  if (cart.length === 0) return;

  const total = getCartTotal();
  const orderLines = cart.map((item) => `- Paket ${item.name} x${item.quantity}: ${currency.format(item.price * item.quantity)}`);
  const message = [
    'Halo HansStudio, saya ingin memesan dan akan membayar via QRIS.',
    ...orderLines,
    `Total: ${currency.format(total)}`,
    'Saya akan mengirim bukti pembayaran setelah transaksi.'
  ].join('\n');

  paymentTotal.textContent = currency.format(total);
  paymentConfirmLink.href = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
  cartDialog.close();
  paymentDialog.showModal();
});

document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

document.querySelector('.portfolio-grid').addEventListener('click', (event) => {
  const button = event.target.closest('.portfolio-open');
  if (!button) return;

  const card = button.closest('.portfolio-card');
  const image = button.querySelector('img');
  portfolioPreviewImage.src = image.src;
  portfolioPreviewImage.alt = image.alt;
  portfolioPreviewCategory.textContent = card.querySelector('figcaption span').textContent;
  portfolioPreviewTitle.textContent = card.querySelector('figcaption strong').textContent;
  portfolioDialog.showModal();
});

document.querySelector('#return-to-cart').addEventListener('click', () => {
  paymentDialog.close();
  cartDialog.showModal();
});

whatsappComposer.addEventListener('submit', (event) => {
  event.preventDefault();
  const category = whatsappCategory.value;
  const message = whatsappMessage.value.trim() || 'Saya ingin bertanya tentang jasa gambar AI.';
  const url = new URL('https://web.whatsapp.com/send');
  url.searchParams.set('phone', whatsappNumber);
  const orderMessage = [
    `Halo HansStudio, ${category ? `saya tertarik dengan kategori ${category}.` : ''}`.trim(),
    message
  ].filter(Boolean).join('\n');
  url.searchParams.set('text', orderMessage);
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
});

[cartDialog, paymentDialog, portfolioDialog].forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const qrCodeImage = new Image();
qrCodeImage.src = `qris/${encodeURIComponent('WhatsApp Image 2026-11-08 at 17.09.24.jpeg')}`;
qrCodeImage.alt = 'Kode pembayaran QRIS HansStudio';
qrCodeImage.addEventListener('load', () => {
  qrArea.replaceChildren(qrCodeImage);
});
qrCodeImage.addEventListener('error', () => {
  const message = qrArea.querySelector('.qr-placeholder strong');
  const detail = qrArea.querySelector('.qr-placeholder span');
  if (message) message.textContent = 'QRIS gagal dimuat';
  if (detail) detail.textContent = 'Silakan hubungi HansStudio melalui WhatsApp untuk menyelesaikan pembayaran.';
});

renderCart();

const portfolioItems = window.HANSSTUDIO_PORTFOLIO;
if (Array.isArray(portfolioItems)) {
  portfolioGrid.replaceChildren();

  portfolioItems.forEach((item) => {
    const card = document.createElement('figure');
    card.className = 'portfolio-card';

    const button = document.createElement('button');
    button.className = 'portfolio-open';
    button.type = 'button';
    button.setAttribute('aria-label', `Perbesar gambar ${item.title}`);

    const image = document.createElement('img');
    image.src = item.src;
    image.alt = item.alt;
    image.loading = 'lazy';
    button.append(image);

    const caption = document.createElement('figcaption');
    const category = document.createElement('span');
    category.textContent = item.category;
    const title = document.createElement('strong');
    title.textContent = item.title;
    caption.append(category, title);

    card.append(button, caption);
    portfolioGrid.append(card);
  });

  if (portfolioItems.length === 0) {
    const status = document.createElement('p');
    status.className = 'portfolio-status';
    status.textContent = 'Belum ada gambar di folder Images.';
    portfolioGrid.append(status);
  }
}

if (menuToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu');
    menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
    menuToggle.innerHTML = `<i class="fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
  });
});
