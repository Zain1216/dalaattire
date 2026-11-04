/**
 * DAULA ATTIRE - BESPOKE MEN'S WEAR
 * Vanilla JavaScript Functionality
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const menuBtn = document.getElementById("menu-btn");
  const navDrawer = document.getElementById("nav-drawer");
  const navCloseBtn = document.getElementById("nav-close-btn");
  const drawerOverlay = document.getElementById("drawer-overlay");

  const appointmentModal = document.getElementById("appointment-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const appointmentForm = document.getElementById("appointment-form");
  const appointmentButtons = document.querySelectorAll(".open-consultation-btn");

  const subscribeForm = document.getElementById("subscribe-form");
  const toast = document.getElementById("toast");

  // Helper: Show notification toast
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }

  // Drawer helpers
  function openNavDrawer() {
    closeAllDrawers();
    navDrawer?.classList.add("active");
    drawerOverlay?.classList.add("active");
    menuBtn?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      navCloseBtn?.focus();
    }, 50);
  }

  function closeAllDrawers() {
    navDrawer?.classList.remove("active");
    drawerOverlay?.classList.remove("active");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // Auto-detect current active page in drawer
  function updateActiveNavDrawerLink() {
    if (!navDrawer) return;
    const currentPath = window.location.pathname.toLowerCase();
    const currentFile = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";
    const links = navDrawer.querySelectorAll(".nav-link-item");

    links.forEach((link) => {
      const page = link.getAttribute("data-page");
      let isActive = false;

      if (page === "home") {
        isActive = currentFile === "index.html" || currentFile === "" || currentFile === "/" || currentPath.endsWith("/");
      } else if (page === "about") {
        isActive = currentFile.includes("about.html");
      } else if (page === "services") {
        isActive = currentFile.includes("services.html");
      } else if (page === "contact") {
        isActive = currentFile.includes("contact.html");
      } else if (page === "shop") {
        isActive = ["category.html", "product.html", "cart.html", "checkout.html"].some((f) => currentFile.includes(f));
      }

      if (isActive) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }
  updateActiveNavDrawerLink();

  // Navigation Drawer Events
  menuBtn?.addEventListener("click", openNavDrawer);
  navCloseBtn?.addEventListener("click", closeAllDrawers);
  drawerOverlay?.addEventListener("click", closeAllDrawers);

  // Close nav drawer when clicking internal links
  const navLinks = navDrawer?.querySelectorAll("a");
  navLinks?.forEach((link) => {
    link.addEventListener("click", () => {
      closeAllDrawers();
    });
  });

  // ==========================================================================
  // Shop: product catalog, cart storage, product page and cart page
  // ==========================================================================
  // Listed in the order the Sherwani category page shows them.
  // availability: "In Stock" or "Made to Order"; color: used by the category page filters.
  const PRODUCTS = {
    "beige-sherwani": {
      name: "Beige Hand Embroidered Sherwani",
      price: 12999,
      color: "Beige",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/pages/sherwani-1.jpg"],
      description: "Soft beige cloth with tonal hand embroidery and a classic band collar.",
    },
    "gold-groom-sherwani": {
      name: "Gold Groom Sherwani",
      price: 12999,
      color: "Gold",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/pages/sherwani-2.jpg"],
      description: "Quilted gold sherwani for the groom, finished with a matching collar.",
    },
    "champagne-sherwani": {
      name: "Champagne Jamawar Sherwani",
      price: 12999,
      color: "Beige",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/pages/sherwani-3.jpg"],
      description: "Champagne jamawar with an embroidered collar and cuffs.",
    },
    "bottle-green-sherwani": {
      name: "Bottle Green Sherwani",
      price: 12999,
      color: "Green",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/products/bottle-green-sherwani.jpg"],
      description: "Bottle green sherwani with gold threadwork along the front opening.",
    },
    "steel-blue-sherwani": {
      name: "Steel Blue Embroidered Sherwani",
      price: 12999,
      color: "Blue",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/products/steel-blue-sherwani.jpg"],
      description: "Steel blue jacquard with ivory floral embroidery and pearl buttons.",
    },
    "emerald-angrakha-sherwani": {
      name: "Emerald Angrakha Sherwani",
      price: 12999,
      color: "Green",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/products/emerald-angrakha-sherwani.jpg"],
      description: "Angrakha-style emerald sherwani with an embroidered panel.",
    },
    "emerald-sherwani": {
      name: "Emerald Embroidered Sherwani",
      price: 48000,
      color: "Green",
      category: "sherwani",
      availability: "In Stock",
      images: [
        "assets/products/emerald-sherwani.jpg",
        "assets/products/emerald-sherwani-detail-1.jpg",
        "assets/products/emerald-sherwani-detail-2.jpg",
      ],
      description: "Deep emerald jamawar with an asymmetric front and hand-worked antique gold embroidery.",
    },
    "ivory-sherwani": {
      name: "Ivory Sherwani with Shawl",
      price: 12999,
      color: "Ivory",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/products/ivory-sherwani.jpg"],
      description: "Ivory jamawar with an embroidered collar and a matching draped shawl.",
    },
    "navy-embroidered-sherwani": {
      name: "Navy Embroidered Sherwani",
      price: 12999,
      color: "Blue",
      category: "sherwani",
      availability: "In Stock",
      images: ["assets/products/navy-embroidered-sherwani.jpg"],
      description: "Navy silk with silver embroidery down the front panel and cuffs.",
    },
    "maroon-velvet-sherwani": {
      name: "Maroon Velvet Sherwani",
      price: 12999,
      color: "Maroon",
      category: "sherwani",
      availability: "Made to Order",
      images: ["assets/products/maroon-velvet-sherwani.jpg"],
      description: "Rich maroon velvet with antique gold floral embroidery on the hem and sleeves.",
    },
    "green-velvet-sherwani": {
      name: "Green Velvet Sherwani",
      price: 12999,
      color: "Green",
      category: "sherwani",
      availability: "Made to Order",
      images: ["assets/products/green-velvet-sherwani.jpg"],
      description: "Deep green velvet with gold floral embroidery for winter weddings.",
    },
    "navy-velvet-sherwani": {
      name: "Navy Velvet Sherwani",
      price: 12999,
      color: "Blue",
      category: "sherwani",
      availability: "Made to Order",
      images: ["assets/products/navy-velvet-sherwani.jpg"],
      description: "Navy velvet with paisley and lattice embroidery in antique gold.",
    },
    "white-dinner-jacket-tuxedo": {
      name: "White Dinner Jacket Tuxedo",
      price: 12999,
      color: "Ivory",
      category: "tuxedo",
      availability: "In Stock",
      images: ["assets/pages/tuxedo-1.jpg"],
      description: "Ivory dinner jacket with a shawl collar, worn with a black bow tie.",
    },
    "classic-black-tuxedo": {
      name: "Classic Black Tuxedo",
      price: 12999,
      color: "Black",
      category: "tuxedo",
      availability: "In Stock",
      images: ["assets/pages/tuxedo-2.jpg"],
      description: "Single-breasted black tuxedo with satin shawl lapels.",
    },
    "black-tie-tuxedo": {
      name: "Black Tie Peak Lapel Tuxedo",
      price: 12999,
      color: "Black",
      category: "tuxedo",
      availability: "In Stock",
      images: ["assets/pages/tuxedo-3.jpg"],
      description: "Black tuxedo with peak lapels for formal evening events.",
    },
    "brown-pinstripe-tuxedo": {
      name: "Brown Pinstripe Double-Breasted Tuxedo",
      price: 12999,
      color: "Brown",
      category: "tuxedo",
      availability: "Made to Order",
      images: ["assets/products/brown-pinstripe-tuxedo.jpg"],
      description: "Double-breasted brown pinstripe with a soft structured shoulder.",
    },
    "brown-tuxedo": {
      name: "Brown Tuxedo with Waistcoat",
      price: 12999,
      color: "Brown",
      category: "tuxedo",
      availability: "Made to Order",
      images: ["assets/products/brown-tuxedo.jpg"],
      description: "Brown tuxedo with a double-breasted contrast waistcoat and bow tie.",
    },
    "olive-shalwar-kameez": {
      name: "Olive Shalwar Kameez with Waistcoat",
      price: 12999,
      color: "Green",
      category: "shalwar-kameez",
      availability: "In Stock",
      images: ["assets/pages/shalwar-1.jpg"],
      description: "Olive shalwar kameez paired with a matching band-collar waistcoat.",
    },
    "charcoal-shalwar-kameez": {
      name: "Charcoal Shalwar Kameez",
      price: 12999,
      color: "Grey",
      category: "shalwar-kameez",
      availability: "In Stock",
      images: ["assets/pages/shalwar-2.jpg"],
      description: "Charcoal grey kameez with a shirt collar and concealed placket.",
    },
    "sage-shalwar-kameez": {
      name: "Sage Shalwar Kameez",
      price: 12999,
      color: "Green",
      category: "shalwar-kameez",
      availability: "In Stock",
      images: ["assets/pages/shalwar-3.jpg"],
      description: "Sage green kameez with a band collar and front pocket.",
    },
    "beige-shalwar-kameez": {
      name: "Beige Shalwar Kameez",
      price: 12999,
      color: "Beige",
      category: "shalwar-kameez",
      availability: "In Stock",
      images: ["assets/products/beige-shalwar-kameez.jpg"],
      description: "Beige kameez with a contrast collar and patch pocket.",
    },
    "navy-shalwar-kameez": {
      name: "Navy Shalwar Kameez",
      price: 12999,
      color: "Blue",
      category: "shalwar-kameez",
      availability: "In Stock",
      images: ["assets/products/navy-shalwar-kameez.jpg"],
      description: "Deep navy kameez with a classic collar for evening wear.",
    },
    "olive-three-piece-suit": {
      name: "Olive Three-Piece Suit",
      price: 12999,
      color: "Green",
      category: "three-piece-suit",
      availability: "In Stock",
      images: ["assets/products/olive-three-piece-suit.jpg"],
      description: "Olive wool three-piece with notch lapels and a matching waistcoat.",
    },
    "navy-three-piece-suit": {
      name: "Navy Three-Piece Suit",
      price: 12999,
      color: "Blue",
      category: "three-piece-suit",
      availability: "In Stock",
      images: ["assets/pages/about-portrait.jpg"],
      description: "Navy single-breasted three-piece, cut slim with a matching waistcoat.",
    },
    "navy-double-breasted-suit": {
      name: "Navy Double-Breasted Suit",
      price: 12999,
      color: "Blue",
      category: "three-piece-suit",
      availability: "Made to Order",
      images: ["assets/tailoring-008.jpg"],
      description: "Navy double-breasted suit with peak lapels and a waistcoat.",
    },
  };

  // Category pages: category.html?c=<key>. No key shows every product.
  const CATEGORIES = {
    sherwani: { name: "Sherwani", hero: "assets/pages/services-hero.jpg" },
    tuxedo: { name: "Tuxedo", hero: "assets/pages/about-hero.jpg" },
    "shalwar-kameez": { name: "Shalwar Kameez", hero: "assets/pages/contact-store.jpg" },
    "three-piece-suit": { name: "3-Piece Suit", hero: "assets/footer-bg.jpg" },
  };
  const ALL_CATEGORY = { name: "Shop All", hero: "assets/pages/contact-hero.jpg" };
  const DEFAULT_PRODUCT = "emerald-sherwani";
  const CART_KEY = "daula-cart";
  const COUPON_KEY = "daula-coupon";

  // WhatsApp number customers message: "price on request" products and checkout orders.
  // International format without + or spaces (+92 022 305070 -> "92022305070"); empty hides the buttons.
  const WHATSAPP_NUMBER = "92022305070";

  // Checkout settings: delivery charge and where customers send their order.
  const SHIPPING_FEE = 0;
  const ORDER_EMAIL = "info@daulattire.com";
  const ORDER_WHATSAPP = WHATSAPP_NUMBER;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  }

  function formatPrice(amount) {
    return "Rs. " + amount.toLocaleString("en-US");
  }

  // ------------------------------------------------------------------------
  // Pricing: "price on request" products and limited-time offers (set in the admin)
  // product.offer = { price: sale price or null, endsAt: ISO time or null }
  // ------------------------------------------------------------------------
  function isOnRequest(p) {
    return Boolean(p.priceOnRequest);
  }

  /** Is the product's offer still running right now? (offers can end while the page is open) */
  function offerRunning(p) {
    return Boolean(p.offer) && (!p.offer.endsAt || new Date(p.offer.endsAt) > new Date());
  }

  /** What one unit costs today: the offer price while it runs, otherwise the regular price. */
  function unitPrice(p) {
    return offerRunning(p) && p.offer.price ? p.offer.price : p.price;
  }

  /** Price line for product cards in grids. */
  function cardPriceHtml(p) {
    if (isOnRequest(p)) return '<p class="price-on-request">Price on request</p>';
    if (offerRunning(p) && p.offer.price) {
      return `<p><s class="price-was">${formatPrice(p.price)}</s> <span class="price-sale">${formatPrice(p.offer.price)}.00 PKR</span></p>`;
    }
    return `<p>${formatPrice(p.price)}.00 PKR</p>`;
  }

  /** "Limited Time Offer" ribbon for product cards. */
  function cardBadgeHtml(p) {
    return offerRunning(p) ? '<span class="offer-badge">Limited Time Offer</span>' : "";
  }

  function whatsappLink(message) {
    return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}` : "";
  }

  function readCart() {
    try {
      const items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      // "Price on request" products are ordered on WhatsApp, never through the cart
      return items.filter((item) => PRODUCTS[item.id] && !isOnRequest(PRODUCTS[item.id]) && item.qty > 0);
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode): cart lasts for this page only
    }
    updateCartBadge(items);
  }

  function updateCartBadge(items = readCart()) {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll("#bag-btn .badge").forEach((badge) => {
      badge.textContent = count;
      badge.classList.remove("bump");
      void badge.offsetWidth; // trigger reflow for smooth re-animation
      badge.classList.add("bump");
    });
  }

  updateCartBadge();

  // Small dialogs (size guide): close on backdrop, close button or Escape
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => el.closest(".modal")?.classList.remove("active"));
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal.active").forEach((m) => m.classList.remove("active"));
  });

  // ==========================================================================
  // Live catalog: load categories & products from the backend (MySQL) when it is
  // available, otherwise keep the built-in list above (e.g. on GitHub Pages).
  // ==========================================================================
  // The live site is on GitHub Pages, which cannot run PHP, so it asks the Hostinger backend.
  // When the site itself is served with PHP (local XAMPP / php -S), the backend sits right next to it.
  const BACKEND_URL = "https://subscription.zainulabideen.tech/daula-attire";
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const CATALOG_URL = isLocal ? "backend/api/catalog.php" : `${BACKEND_URL}/backend/api/catalog.php`;
  // Forms (orders, consultations, messages, newsletter) are saved here and appear in the admin Inbox
  const SUBMIT_URL = isLocal ? "backend/api/submit.php" : `${BACKEND_URL}/backend/api/submit.php`;

  /** Send a form to the backend. Resolves with the server's reply; rejects with a message to show. */
  async function submitForm(type, payload, form) {
    let res;
    try {
      res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "website" is the hidden spam trap added to every form below; people never fill it in
        body: JSON.stringify({ type, website: form?.querySelector('[name="website"]')?.value || "", ...payload }),
      });
    } catch {
      throw Object.assign(new Error("We couldn't reach our server. Please check your connection, or message us on WhatsApp."), { offline: true });
    }
    let data = null;
    try {
      data = await res.json();
    } catch {
      // not JSON: the backend is missing or broken
    }
    if (!data) {
      throw Object.assign(new Error("We couldn't send this right now. Please try again, or message us on WhatsApp."), { offline: true });
    }
    if (!res.ok || !data.ok) {
      throw Object.assign(new Error(data.error || "We couldn't send this right now. Please try again."), { offline: res.status >= 500 });
    }
    return data;
  }

  /** Disable a form's submit button while it is being sent. */
  async function sending(form, task) {
    const button = form.querySelector('[type="submit"]') || document.querySelector(`[form="${form.id}"]`);
    const label = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }
    try {
      return await task();
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = label;
      }
    }
  }

  // Hidden spam-trap field on every form (bots fill in every field; people never see this one)
  document.querySelectorAll("#appointment-form, #subscribe-form, #message-form, #checkout-form").forEach((form) => {
    const trap = document.createElement("input");
    trap.type = "text";
    trap.name = "website";
    trap.tabIndex = -1;
    trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    trap.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0;";
    form.appendChild(trap);
  });

  /**
   * Consultation form "Garment of Interest": one option per category in the catalog,
   * so it always matches the categories managed in the admin.
   */
  function fillGarmentOptions() {
    document.querySelectorAll("#garment-type").forEach((select) => {
      const current = select.value;
      select.required = true;
      select.innerHTML =
        '<option value="" disabled>Choose a category</option>' +
        Object.values(CATEGORIES).map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("");
      select.value = [...select.options].some((o) => o.value === current) ? current : "";
    });
  }

  /** Best category for a button's label, e.g. "Ceremonial Sherwani" -> "Sherwani". */
  function categoryForLabel(label) {
    const words = (text) => text.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean);
    const have = words(label);
    const match = Object.values(CATEGORIES).find((c) => words(c.name).every((w) => have.includes(w)));
    return match ? match.name : "";
  }

  fillGarmentOptions();

  function replaceContents(target, source) {
    Object.keys(target).forEach((key) => delete target[key]);
    Object.assign(target, source);
  }

  async function loadCatalog() {
    try {
      const res = await fetch(CATALOG_URL, { headers: { Accept: "application/json" } });
      if (!res.ok || !(res.headers.get("content-type") || "").includes("application/json")) return;
      const data = await res.json();
      if (data.categories && data.products && Object.keys(data.products).length) {
        replaceContents(CATEGORIES, data.categories);
        replaceContents(PRODUCTS, data.products);
      }
    } catch {
      // Backend not reachable: the built-in catalog stays in place
    }
  }

  loadCatalog().then(() => {
    updateCartBadge();
    fillGarmentOptions();
    renderHomeCategories();
    renderServicesSections();
    initShopPages();
  });

  /** Products of one category, in catalog order. */
  function productsIn(slug) {
    return Object.entries(PRODUCTS).filter(([, p]) => p.category === slug);
  }

  // Home page "Our Signature Services": one card per category that has products,
  // so categories added in the admin appear here too
  function renderHomeCategories() {
    const grid = document.querySelector("#services .service-grid");
    if (!grid) return;
    const cards = Object.entries(CATEGORIES)
      .map(([slug, c]) => ({ slug, c, items: productsIn(slug) }))
      .filter(({ items }) => items.length);
    if (!cards.length) return;
    grid.innerHTML = cards
      .map(({ slug, c, items }) => `
        <a class="service-card" href="category.html?c=${encodeURIComponent(slug)}">
          <img src="${escapeHtml(items[0][1].images[0] || c.hero)}" alt="${escapeHtml(c.name)}" loading="lazy">
          <div><span>${escapeHtml(c.name)}</span></div>
        </a>`)
      .join("");
    observeReveal([...grid.children]);
  }

  // Services page "What We Offer": one slider per category that has products
  function renderServicesSections() {
    const section = document.getElementById("what-we-offer");
    if (!section) return;
    const blocks = Object.entries(CATEGORIES)
      .map(([slug, c]) => ({ slug, c, items: productsIn(slug).slice(0, 8) }))
      .filter(({ items }) => items.length);
    if (!blocks.length) return;
    section.querySelectorAll(".offer-category").forEach((el) => el.remove());
    blocks.forEach(({ slug, c, items }) => {
      const block = document.createElement("div");
      block.className = "offer-category";
      block.innerHTML = `
        <h3 class="category-pill"><a href="category.html?c=${encodeURIComponent(slug)}">${escapeHtml(c.name)}</a></h3>
        <div class="carousel" data-carousel>
          <div class="carousel-track">
            ${items.map(([id, p]) => `<a class="offer-card" href="product.html?id=${encodeURIComponent(id)}"><img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy"></a>`).join("")}
          </div>
          <div class="carousel-dots" aria-label="${escapeHtml(c.name)} slides"></div>
        </div>`;
      section.appendChild(block);
      setupCarousel(block.querySelector("[data-carousel]"));
    });
    observeReveal([...section.querySelectorAll(".offer-category")]);
  }

  function initShopPages() {
    // Product Page
    const productView = document.getElementById("product-view");
    if (productView) {
      const requested = new URLSearchParams(location.search).get("id");
      const productId = PRODUCTS[requested] ? requested : PRODUCTS[DEFAULT_PRODUCT] ? DEFAULT_PRODUCT : Object.keys(PRODUCTS)[0];
      const product = PRODUCTS[productId];
      const mainImg = document.getElementById("product-main-img");
      const thumbs = document.getElementById("product-thumbs");
      const qtyEl = document.getElementById("product-qty");
      let quantity = 1;
      let size = "S";
  
      document.title = `${product.name} | Daula Attire`;
      document.getElementById("product-name").textContent = product.name;
      const categoryLink = document.getElementById("product-category");
      if (categoryLink) {
        categoryLink.textContent = CATEGORIES[product.category]?.name || "Shop";
        categoryLink.href = `category.html?c=${product.category}`;
      }
      document.getElementById("product-desc").textContent = product.description;
      const priceEl = document.getElementById("product-price");

      function renderPrice() {
        if (isOnRequest(product)) {
          priceEl.innerHTML = '<span class="price-on-request">Price on request</span>';
        } else if (offerRunning(product) && product.offer.price) {
          priceEl.innerHTML = `<s class="price-was">${formatPrice(product.price)}</s> <span class="price-sale">${formatPrice(product.offer.price)}</span>`;
        } else {
          priceEl.textContent = formatPrice(product.price);
        }
      }
      renderPrice();

      // Countdown for a limited-time offer with an end time; when it ends the regular price returns
      const offerTimer = document.createElement("div");
      offerTimer.className = "offer-timer";
      offerTimer.setAttribute("role", "timer");
      offerTimer.hidden = true;
      priceEl.after(offerTimer);
      if (offerRunning(product) && product.offer.endsAt) {
        const ends = new Date(product.offer.endsAt);
        const pad = (n) => String(n).padStart(2, "0");
        const unit = (value, label) => `<span class="timer-unit"><strong>${value}</strong><small>${label}</small></span>`;
        const tick = () => {
          const left = ends - new Date();
          if (left <= 0) {
            clearInterval(timerId);
            offerTimer.hidden = true;
            renderPrice();
            return;
          }
          const s = Math.floor(left / 1000);
          offerTimer.innerHTML = `
            <p class="timer-title">Limited Time Offer &middot; Ends in</p>
            <div class="timer-units">
              ${unit(Math.floor(s / 86400), "Days")}${unit(pad(Math.floor((s % 86400) / 3600)), "Hours")}${unit(pad(Math.floor((s % 3600) / 60)), "Mins")}${unit(pad(s % 60), "Secs")}
            </div>`;
          offerTimer.hidden = false;
        };
        const timerId = setInterval(tick, 1000);
        tick();
      } else if (offerRunning(product)) {
        offerTimer.innerHTML = '<p class="timer-title">Limited Time Offer</p>';
        offerTimer.hidden = false;
      }

      // Price on request: no cart, customers ask on WhatsApp instead
      if (isOnRequest(product)) {
        productView.querySelector(".qty-label")?.setAttribute("hidden", "");
        productView.querySelector(".qty-stepper")?.setAttribute("hidden", "");
        const addBtn = document.getElementById("add-to-cart-btn");
        const wa = document.createElement("a");
        wa.className = "btn-whatsapp";
        wa.id = "whatsapp-btn";
        wa.target = "_blank";
        wa.rel = "noopener noreferrer";
        wa.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg><span>Contact on WhatsApp</span>`;
        const updateLink = () => {
          wa.href = whatsappLink(`Assalam o Alaikum! I'm interested in "${product.name}" (size ${size}). Please share the price.\n${location.href}`);
        };
        updateLink();
        productView.querySelectorAll(".size-options button").forEach((b) => b.addEventListener("click", () => setTimeout(updateLink)));
        if (WHATSAPP_NUMBER) addBtn?.replaceWith(wa);
        else addBtn?.setAttribute("hidden", "");
      }

      mainImg.src = product.images[0];
      mainImg.alt = product.name;
  
      product.images.forEach((src, i) => {
        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = i === 0 ? "active" : "";
        thumb.setAttribute("aria-label", `Show photo ${i + 1}`);
        thumb.innerHTML = `<img src="${src}" alt="">`;
        thumb.addEventListener("click", () => {
          mainImg.src = src;
          thumbs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === thumb));
        });
        thumbs.appendChild(thumb);
      });
  
      productView.querySelectorAll(".size-options button").forEach((btn) => {
        btn.addEventListener("click", () => {
          size = btn.dataset.size;
          productView.querySelectorAll(".size-options button").forEach((b) => {
            b.classList.toggle("active", b === btn);
            b.setAttribute("aria-checked", String(b === btn));
          });
        });
      });
  
      productView.querySelectorAll("[data-qty]").forEach((btn) => {
        btn.addEventListener("click", () => {
          quantity = Math.min(10, Math.max(1, quantity + Number(btn.dataset.qty)));
          qtyEl.textContent = quantity;
        });
      });
  
      document.getElementById("size-guide-btn")?.addEventListener("click", () => {
        document.getElementById("size-guide-modal")?.classList.add("active");
      });
  
      document.getElementById("add-to-cart-btn")?.addEventListener("click", () => {
        const items = readCart();
        const existing = items.find((item) => item.id === productId && item.size === size);
        if (existing) existing.qty += quantity;
        else items.push({ id: productId, size, qty: quantity });
        writeCart(items);
        showToast(`${product.name} (${size}) added to your cart.`);
      });
  
      document.getElementById("share-btn")?.addEventListener("click", async () => {
        const url = location.href;
        try {
          if (navigator.share) await navigator.share({ title: product.name, url });
          else {
            await navigator.clipboard.writeText(url);
            showToast("Product link copied.");
          }
        } catch {
          // Share sheet dismissed
        }
      });
  
      const related = document.getElementById("related-grid");
      // Same category first, then the rest of the catalog
      Object.entries(PRODUCTS)
        .filter(([id]) => id !== productId)
        .sort(([, x], [, y]) => (y.category === product.category) - (x.category === product.category))
        .slice(0, 6)
        .forEach(([id, item]) => {
          const card = document.createElement("a");
          card.className = "related-card reveal revealed";
          card.href = `product.html?id=${id}`;
          card.innerHTML = `
            ${cardBadgeHtml(item)}
            <img src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.name)}" loading="lazy">
            <h3>${escapeHtml(item.name)}</h3>
            ${cardPriceHtml(item)}`;
          related?.appendChild(card);
        });
    }
  
    // Category Page: product grid with Availability / Price / Colors filters
    const categoryGrid = document.getElementById("category-grid");
    if (categoryGrid) {
      const PRICE_RANGES = [
        { label: "Under Rs. 15,000", min: 0, max: 14999 },
        { label: "Rs. 15,000 – Rs. 30,000", min: 15000, max: 30000 },
        { label: "Above Rs. 30,000", min: 30001, max: Infinity },
      ];
      const requested = new URLSearchParams(location.search).get("c");
      const categoryKey = CATEGORIES[requested] ? requested : "";
      const category = CATEGORIES[categoryKey] || ALL_CATEGORY;
      const all = Object.entries(PRODUCTS).filter(([, p]) => !categoryKey || p.category === categoryKey);
      const countEl = document.getElementById("category-count");
      const emptyEl = document.getElementById("category-empty");
  
      document.title = `${category.name} | Daula Attire`;
      document.getElementById("category-title").textContent = category.name;
      document.getElementById("category-hero").style.backgroundImage =
        `linear-gradient(rgba(14, 11, 8, 0.45), rgba(14, 11, 8, 0.55)), url('${category.hero}')`;
  
      // Category tabs: Shop All + one per category, current one highlighted
      document.getElementById("category-tabs").innerHTML = [["", ALL_CATEGORY], ...Object.entries(CATEGORIES)]
        .map(([key, c]) => {
          const current = key === categoryKey;
          return `<a href="category.html${key ? "?c=" + key : ""}"${current ? ' class="active" aria-current="page"' : ""}>${escapeHtml(c.name)}</a>`;
        })
        .join("");
  
      // Build each dropdown's checkboxes from the products shown, with a count per option
      const optionSets = {
        category: categoryKey
          ? []
          : Object.entries(CATEGORIES).map(([key, c]) => ({ value: key, label: c.name, test: (p) => p.category === key })),
        availability: [...new Set(all.map(([, p]) => p.availability))].map((v) => ({ value: v, label: v, test: (p) => p.availability === v })),
        // Offers count at their sale price; "price on request" products get their own option
        price: [
          ...PRICE_RANGES.map((r) => ({ value: r.label, label: r.label, test: (p) => !isOnRequest(p) && unitPrice(p) >= r.min && unitPrice(p) <= r.max })),
          { value: "on-request", label: "Price on request", test: (p) => isOnRequest(p) },
        ],
        color: [...new Set(all.map(([, p]) => p.color))].sort().map((v) => ({ value: v, label: v, test: (p) => p.color === v })),
      };
      document.querySelector('[data-filter="category"]').hidden = Boolean(categoryKey);
  
      Object.entries(optionSets).forEach(([key, options]) => {
        const list = document.querySelector(`[data-filter="${key}"] .filter-options`);
        list.innerHTML = options
          .map((opt) => {
            const count = all.filter(([, p]) => opt.test(p)).length;
            return `<label><input type="checkbox" value="${escapeHtml(opt.value)}"${count ? "" : " disabled"}> ${escapeHtml(opt.label)} <span>(${count})</span></label>`;
          })
          .join("");
      });
  
      function renderCategory() {
        const active = Object.fromEntries(
          Object.keys(optionSets).map((key) => [
            key,
            [...document.querySelectorAll(`[data-filter="${key}"] input:checked`)].map((i) => i.value),
          ])
        );
        const matches = all.filter(([, p]) =>
          Object.entries(active).every(
            ([key, values]) => !values.length || optionSets[key].some((opt) => values.includes(opt.value) && opt.test(p))
          )
        );
  
        document.querySelectorAll("[data-filter]").forEach((box) => {
          const n = active[box.dataset.filter].length;
          box.querySelector(".filter-active").textContent = n ? `(${n})` : "";
        });
  
        categoryGrid.classList.add("is-fading");
        setTimeout(() => {
          categoryGrid.innerHTML = matches
            .map(
              ([id, p], idx) => `
              <a class="related-card reveal" href="product.html?id=${id}" style="transition-delay: ${(idx % 6) * 0.08}s;">
                ${cardBadgeHtml(p)}
                <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy">
                <h3>${escapeHtml(p.name)}</h3>
                ${cardPriceHtml(p)}
              </a>`
            )
            .join("");
          countEl.textContent = `${matches.length} ${matches.length === 1 ? "product" : "products"}`;
          emptyEl.hidden = matches.length > 0;
          categoryGrid.classList.remove("is-fading");
  
          if (window.__siteScrollObserver) {
            categoryGrid.querySelectorAll(".reveal").forEach((el) => window.__siteScrollObserver.observe(el));
          } else {
            categoryGrid.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
          }
        }, 150);
      }
  
      // Leaving a dropdown with nothing to choose from would only confuse
      Object.entries(optionSets).forEach(([key, options]) => {
        if (!options.length) document.querySelector(`[data-filter="${key}"]`).hidden = true;
      });
  
      document.getElementById("category-filters").addEventListener("change", renderCategory);
      document.getElementById("clear-filters").addEventListener("click", () => {
        document.querySelectorAll("#category-filters input:checked").forEach((i) => (i.checked = false));
        renderCategory();
      });
  
      // Only one dropdown open at a time; clicking outside closes them
      const dropdowns = document.querySelectorAll(".filter-dropdown");
      dropdowns.forEach((d) =>
        d.addEventListener("toggle", () => {
          if (d.open) dropdowns.forEach((other) => other !== d && (other.open = false));
        })
      );
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".filter-dropdown")) dropdowns.forEach((d) => (d.open = false));
      });
  
      renderCategory();
    }
  
    // Cart Page
    const cartPage = document.getElementById("cart-page");
    if (cartPage) {
      const list = document.getElementById("cart-items");
      const empty = document.getElementById("cart-empty");
  
      function renderCart() {
        const items = readCart();
        const subtotal = items.reduce((sum, item) => sum + unitPrice(PRODUCTS[item.id]) * item.qty, 0);
        list.innerHTML = "";
        empty.hidden = items.length > 0;
  
        items.forEach((item, index) => {
          const product = PRODUCTS[item.id];
          const row = document.createElement("div");
          row.className = "cart-row";
          row.innerHTML = `
            <div class="cart-product">
              <a href="product.html?id=${item.id}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}"></a>
              <div>
                <a href="product.html?id=${item.id}" class="cart-name">${escapeHtml(product.name)}</a>
                <span class="size-tag">${item.size}</span>
                <button type="button" class="cart-remove" data-remove="${index}">Remove</button>
              </div>
            </div>
            <span class="cart-price"><small>Price</small>${offerRunning(product) && product.offer.price ? `<s class="price-was">${formatPrice(product.price)}</s> ` : ""}${formatPrice(unitPrice(product))}</span>
            <div class="qty-stepper">
              <button type="button" data-step="-1" data-index="${index}" aria-label="Decrease quantity">&minus;</button>
              <span>${item.qty}</span>
              <button type="button" data-step="1" data-index="${index}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-line-total"><small>Total</small>${formatPrice(unitPrice(product) * item.qty)}</span>`;
          list.appendChild(row);
        });
  
        document.getElementById("cart-subtotal").textContent = formatPrice(subtotal);
        document.getElementById("cart-total").textContent = formatPrice(subtotal);
      }
  
      list.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const items = readCart();
        if (btn.dataset.remove !== undefined) {
          items.splice(Number(btn.dataset.remove), 1);
        } else if (btn.dataset.step) {
          const item = items[Number(btn.dataset.index)];
          item.qty = Math.min(10, item.qty + Number(btn.dataset.step));
          if (item.qty < 1) items.splice(Number(btn.dataset.index), 1);
        }
        writeCart(items);
        renderCart();
      });
  
      const couponInput = document.getElementById("coupon-code");
      try {
        couponInput.value = sessionStorage.getItem(COUPON_KEY) || "";
      } catch {
        // Storage unavailable
      }
  
      document.getElementById("checkout-btn")?.addEventListener("click", () => {
        if (!readCart().length) {
          showToast("Your cart is empty.");
          return;
        }
        try {
          sessionStorage.setItem(COUPON_KEY, couponInput.value.trim());
        } catch {
          // Storage unavailable: coupon is not carried over
        }
        location.href = "checkout.html";
      });
  
      renderCart();
    }
  
    // Checkout Page
    const checkoutPage = document.getElementById("checkout-page");
    // An empty cart has nothing to check out
    if (checkoutPage && !readCart().length) {
      location.replace("cart.html");
    } else if (checkoutPage) {
      const form = document.getElementById("checkout-form");
      const errorEl = document.getElementById("checkout-error");
      const items = readCart();
      let coupon = "";
      try {
        coupon = sessionStorage.getItem(COUPON_KEY) || "";
      } catch {
        // Storage unavailable
      }
  
      const subtotal = items.reduce((sum, item) => sum + unitPrice(PRODUCTS[item.id]) * item.qty, 0);
      const total = subtotal + SHIPPING_FEE;
  
      document.getElementById("checkout-items").innerHTML = items
        .map((item) => {
          const product = PRODUCTS[item.id];
          return `
            <li>
              <img src="${escapeHtml(product.images[0])}" alt="">
              <div>
                <span class="checkout-item-name">${escapeHtml(product.name)}</span>
                <small>Size ${item.size} &middot; Qty ${item.qty}</small>
              </div>
              <strong>${formatPrice(unitPrice(product) * item.qty)}</strong>
            </li>`;
        })
        .join("");
      document.getElementById("checkout-subtotal").textContent = formatPrice(subtotal);
      document.getElementById("checkout-shipping").textContent = SHIPPING_FEE ? formatPrice(SHIPPING_FEE) : "Free";
      document.getElementById("checkout-total").textContent = formatPrice(total);
      if (coupon) {
        document.getElementById("checkout-coupon-row").hidden = false;
        document.getElementById("checkout-coupon").textContent = coupon;
      }
  
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.classList.add("was-validated");
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) {
          errorEl.textContent = "Please fill in the highlighted fields.";
          errorEl.hidden = false;
          firstInvalid.focus();
          return;
        }
        errorEl.hidden = true;

        const data = Object.fromEntries(new FormData(form));
        sending(form, async () => {
          // Save the order; the server works out the prices and gives the order number
          let saved = null;
          try {
            saved = await submitForm("order", {
              ...data,
              coupon,
              items: items.map(({ id, size, qty }) => ({ id, size, qty })),
            }, form);
          } catch (err) {
            if (!err.offline) {
              errorEl.textContent = err.message;
              errorEl.hidden = false;
              return;
            }
            // Server unreachable: the customer can still send the order by email / WhatsApp below
          }
          showOrderDone(data, saved);
        });
      });

      function showOrderDone(data, saved) {
        const orderNumber = saved?.reference || "DA-" + Date.now().toString().slice(-6);
        // When saved, the server's prices are the ones that count
        const orderLines = saved
          ? saved.items.map((l) => `- ${l.name} | Size ${l.size} | Qty ${l.qty} | ${formatPrice(l.line_total)}`)
          : items.map((item) => {
              const product = PRODUCTS[item.id];
              return `- ${product.name} | Size ${item.size} | Qty ${item.qty} | ${formatPrice(unitPrice(product) * item.qty)}`;
            });
        const orderSubtotal = saved ? saved.subtotal : subtotal;
        const orderShipping = saved ? saved.shipping : SHIPPING_FEE;
        const orderTotal = saved ? saved.total : total;
        const lines = [
          `New order ${orderNumber}`,
          "",
          ...orderLines,
          "",
          `Subtotal: ${formatPrice(orderSubtotal)}`,
          `Shipping: ${orderShipping ? formatPrice(orderShipping) : "Free"}`,
          coupon ? `Coupon: ${coupon}` : null,
          `Total: ${formatPrice(orderTotal)}`,
          `Payment: ${data.payment}`,
          "",
          `Name: ${data.name}`,
          `Phone: ${data.phone}`,
          data.email ? `Email: ${data.email}` : null,
          `Address: ${data.address}, ${data.city}${data.postal ? " " + data.postal : ""}`,
          data.notes ? `Notes: ${data.notes}` : null,
        ].filter((line) => line !== null);
        const message = lines.join("\n");
  
        document.getElementById("order-number").textContent = orderNumber;
        document.getElementById("order-phone").textContent = data.phone;
        document.getElementById("order-email-btn").href =
          `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent("Order " + orderNumber)}&body=${encodeURIComponent(message)}`;
        if (ORDER_WHATSAPP) {
          const whatsappBtn = document.getElementById("order-whatsapp-btn");
          whatsappBtn.href = `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(message)}`;
          whatsappBtn.hidden = false;
        }
  
        writeCart([]);
        try {
          sessionStorage.removeItem(COUPON_KEY);
        } catch {
          // Storage unavailable
        }
        // Saved orders are already with our team; otherwise the customer needs to send it
        document.querySelector(".order-done-copy").innerHTML = saved
          ? `Your order has been received. We will contact you on <strong>${escapeHtml(data.phone)}</strong> to arrange measurements, payment and delivery. You can also send us the order details below.`
          : `We couldn't reach our server, so please send your order to our team below. We will contact you on <strong>${escapeHtml(data.phone)}</strong> to arrange measurements, payment and delivery.`;

        document.getElementById("checkout-layout").hidden = true;
        checkoutPage.querySelector("h1").hidden = true;
        document.getElementById("order-done").hidden = false;
        window.scrollTo({ top: 0 });
      }
    }
  }

  // Consultation Modal Events
  function openModal(serviceTitle = "") {
    if (!appointmentModal) return;
    closeAllDrawers();
    appointmentModal.classList.add("active");
    document.body.style.overflow = "hidden";
    const garmentSelect = document.getElementById("garment-type");
    if (garmentSelect && serviceTitle) {
      // Buttons say things like "Ceremonial Sherwani"; pick the matching category, or leave the choice open
      garmentSelect.value = categoryForLabel(serviceTitle);
    }
  }

  function closeModal() {
    if (!appointmentModal) return;
    appointmentModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  appointmentButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const service = btn.getAttribute("data-service") || "";
      openModal(service);
    });
  });

  modalCloseBtn?.addEventListener("click", closeModal);
  appointmentModal?.querySelector(".modal-backdrop")?.addEventListener("click", closeModal);

  // Escape key closes modal & drawers
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDrawers();
      closeModal();
    }
  });

  // Appointment Form Submit
  appointmentForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = (id) => document.getElementById(id)?.value.trim() || "";
    const name = value("client-name");
    sending(appointmentForm, async () => {
      try {
        await submitForm("appointment", {
          name,
          phone: value("client-phone"),
          garment: value("garment-type"),
          date: value("appointment-date"),
          notes: value("client-notes"),
        }, appointmentForm);
        closeModal();
        appointmentForm.reset();
        showToast(`Thank you, ${name}. Your bespoke consultation request has been received.`);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  // Newsletter Subscription Form Submit
  subscribeForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const email = emailInput?.value.trim();
    if (!email) return;
    sending(subscribeForm, async () => {
      try {
        const res = await submitForm("subscribe", { email }, subscribeForm);
        emailInput.value = "";
        showToast(res.message || "Thank you for subscribing to Daula Attire.");
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  // Contact Page Message Form Submit
  const messageForm = document.getElementById("message-form");
  messageForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = (id) => document.getElementById(id)?.value.trim() || "";
    const name = value("msg-name");
    sending(messageForm, async () => {
      try {
        await submitForm("contact", {
          name,
          email: value("msg-email"),
          phone: value("msg-phone"),
          subject: value("msg-subject"),
          message: value("msg-body"),
        }, messageForm);
        messageForm.reset();
        showToast(`Thank you, ${name}. Our team will be in touch shortly.`);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  // Services Page Carousels: one dot per page of visible cards.
  // Also used for the category sections the catalog builds later (see renderServicesSections).
  document.querySelectorAll("[data-carousel]").forEach(setupCarousel);

  function setupCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const dotsWrap = carousel.querySelector(".carousel-dots");
    if (!track || !dotsWrap) return;

    function pageCount() {
      return Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
    }

    function currentPage() {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return 0;
      return Math.round((track.scrollLeft / max) * (pageCount() - 1));
    }

    function renderDots() {
      const pages = pageCount();
      dotsWrap.innerHTML = "";
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show slide ${i + 1}`);
        dot.addEventListener("click", () => {
          const max = track.scrollWidth - track.clientWidth;
          track.scrollTo({ left: pages > 1 ? (max * i) / (pages - 1) : 0 });
        });
        dotsWrap.appendChild(dot);
      }
      updateDots();
    }

    function updateDots() {
      const active = currentPage();
      dotsWrap.querySelectorAll("button").forEach((dot, i) => dot.classList.toggle("active", i === active));
    }

    track.addEventListener("scroll", updateDots, { passive: true });
    window.addEventListener("resize", renderDots);
    renderDots();
  }

  /** Let elements added after page load take part in the scroll reveal animation. */
  function observeReveal(elements) {
    elements.forEach((el, idx) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${(idx % 6) * 0.1}s`;
      if (window.__siteScrollObserver) window.__siteScrollObserver.observe(el);
      else el.classList.add("revealed");
    });
  }

  // ==========================================================================
  // Luxury Scroll Reveal & Automatic Grid Staggering
  // ==========================================================================
  const gridSelectors = [
    ".service-grid",
    ".gallery-grid",
    ".promise-grid",
    ".testimonial-grid",
    ".category-grid",
    ".related-grid",
    ".intro-images",
    ".craft-grid",
    ".info-list",
    ".why-choose",
    ".contact-grid",
    ".about-story",
    ".elegance-grid"
  ];

  // Automatically assign staggered cascade delays to grid children
  gridSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((grid) => {
      const items = Array.from(grid.children);
      items.forEach((item, idx) => {
        if (
          !item.classList.contains("reveal") &&
          !item.classList.contains("reveal-left") &&
          !item.classList.contains("reveal-right") &&
          !item.classList.contains("reveal-scale") &&
          !item.classList.contains("reveal-fade")
        ) {
          item.classList.add("reveal");
        }
        item.style.transitionDelay = `${(idx % 6) * 0.1}s`;
      });
    });
  });

  const revealSelector = ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade";
  const revealElements = document.querySelectorAll(revealSelector);

  if ("IntersectionObserver" in window) {
    window.__siteScrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          } else {
            // When user scrolls back up and element leaves through the bottom of the screen,
            // softly reset so it cascades and fades in again on next downward scroll
            if (entry.boundingClientRect.top > 0) {
              entry.target.classList.remove("revealed");
            }
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px",
      }
    );

    revealElements.forEach((el) => window.__siteScrollObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add("revealed"));
  }

  
  // Sticky header visual tweak on scroll
  const siteHeader = document.querySelector(".site-header");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 40) {
        siteHeader?.style.setProperty("background", "rgba(18, 16, 14, 0.98)");
        siteHeader?.style.setProperty("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.5)");
        siteHeader?.style.setProperty("border-bottom-color", "rgba(200, 162, 101, 0.35)");
      } else {
        siteHeader?.style.setProperty("background", "rgba(18, 16, 14, 0.95)");
        siteHeader?.style.setProperty("box-shadow", "none");
        siteHeader?.style.setProperty("border-bottom-color", "var(--border)");
      }
    },
    { passive: true }
  );
});
