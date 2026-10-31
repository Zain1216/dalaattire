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

  // Checkout settings: delivery charge and where customers send their order.
  // ORDER_WHATSAPP: international format without + or spaces (e.g. "923001234567"); empty hides the button.
  const SHIPPING_FEE = 0;
  const ORDER_EMAIL = "info@daulattire.com";
  const ORDER_WHATSAPP = "";

  function formatPrice(amount) {
    return "Rs. " + amount.toLocaleString("en-US");
  }

  function readCart() {
    try {
      const items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      return items.filter((item) => PRODUCTS[item.id] && item.qty > 0);
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

  // Product Page
  const productView = document.getElementById("product-view");
  if (productView) {
    const requested = new URLSearchParams(location.search).get("id");
    const productId = PRODUCTS[requested] ? requested : DEFAULT_PRODUCT;
    const product = PRODUCTS[productId];
    const mainImg = document.getElementById("product-main-img");
    const thumbs = document.getElementById("product-thumbs");
    const qtyEl = document.getElementById("product-qty");
    let quantity = 1;
    let size = "S";

    document.title = `${product.name} | Daula Attire`;
    document.getElementById("product-name").textContent = product.name;
    const categoryLink = document.getElementById("product-category");
    categoryLink.textContent = CATEGORIES[product.category].name;
    categoryLink.href = `category.html?c=${product.category}`;
    document.getElementById("product-desc").textContent = product.description;
    document.getElementById("product-price").textContent = formatPrice(product.price);
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
          <img src="${item.images[0]}" alt="${item.name}" loading="lazy">
          <h3>${item.name}</h3>
          <p>${formatPrice(item.price)}.00 PKR</p>`;
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
        return `<a href="category.html${key ? "?c=" + key : ""}"${current ? ' class="active" aria-current="page"' : ""}>${c.name}</a>`;
      })
      .join("");

    // Build each dropdown's checkboxes from the products shown, with a count per option
    const optionSets = {
      category: categoryKey
        ? []
        : Object.entries(CATEGORIES).map(([key, c]) => ({ value: key, label: c.name, test: (p) => p.category === key })),
      availability: [...new Set(all.map(([, p]) => p.availability))].map((v) => ({ value: v, label: v, test: (p) => p.availability === v })),
      price: PRICE_RANGES.map((r) => ({ value: r.label, label: r.label, test: (p) => p.price >= r.min && p.price <= r.max })),
      color: [...new Set(all.map(([, p]) => p.color))].sort().map((v) => ({ value: v, label: v, test: (p) => p.color === v })),
    };
    document.querySelector('[data-filter="category"]').hidden = Boolean(categoryKey);

    Object.entries(optionSets).forEach(([key, options]) => {
      const list = document.querySelector(`[data-filter="${key}"] .filter-options`);
      list.innerHTML = options
        .map((opt) => {
          const count = all.filter(([, p]) => opt.test(p)).length;
          return `<label><input type="checkbox" value="${opt.value}"${count ? "" : " disabled"}> ${opt.label} <span>(${count})</span></label>`;
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
              <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
              <h3>${p.name}</h3>
              <p>${formatPrice(p.price)}.00 PKR</p>
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
      const subtotal = items.reduce((sum, item) => sum + PRODUCTS[item.id].price * item.qty, 0);
      list.innerHTML = "";
      empty.hidden = items.length > 0;

      items.forEach((item, index) => {
        const product = PRODUCTS[item.id];
        const row = document.createElement("div");
        row.className = "cart-row";
        row.innerHTML = `
          <div class="cart-product">
            <a href="product.html?id=${item.id}"><img src="${product.images[0]}" alt="${product.name}"></a>
            <div>
              <a href="product.html?id=${item.id}" class="cart-name">${product.name}</a>
              <span class="size-tag">${item.size}</span>
              <button type="button" class="cart-remove" data-remove="${index}">Remove</button>
            </div>
          </div>
          <span class="cart-price"><small>Price</small>${formatPrice(product.price)}</span>
          <div class="qty-stepper">
            <button type="button" data-step="-1" data-index="${index}" aria-label="Decrease quantity">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" data-step="1" data-index="${index}" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-line-total"><small>Total</small>${formatPrice(product.price * item.qty)}</span>`;
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

    const subtotal = items.reduce((sum, item) => sum + PRODUCTS[item.id].price * item.qty, 0);
    const total = subtotal + SHIPPING_FEE;

    document.getElementById("checkout-items").innerHTML = items
      .map((item) => {
        const product = PRODUCTS[item.id];
        return `
          <li>
            <img src="${product.images[0]}" alt="">
            <div>
              <span class="checkout-item-name">${product.name}</span>
              <small>Size ${item.size} &middot; Qty ${item.qty}</small>
            </div>
            <strong>${formatPrice(product.price * item.qty)}</strong>
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
      const orderNumber = "DA-" + Date.now().toString().slice(-6);
      const lines = [
        `New order ${orderNumber}`,
        "",
        ...items.map((item) => {
          const product = PRODUCTS[item.id];
          return `- ${product.name} | Size ${item.size} | Qty ${item.qty} | ${formatPrice(product.price * item.qty)}`;
        }),
        "",
        `Subtotal: ${formatPrice(subtotal)}`,
        `Shipping: ${SHIPPING_FEE ? formatPrice(SHIPPING_FEE) : "Free"}`,
        coupon ? `Coupon: ${coupon}` : null,
        `Total: ${formatPrice(total)}`,
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
      document.getElementById("checkout-layout").hidden = true;
      checkoutPage.querySelector("h1").hidden = true;
      document.getElementById("order-done").hidden = false;
      window.scrollTo({ top: 0 });
    });
  }

  // Consultation Modal Events
  function openModal(serviceTitle = "") {
    if (!appointmentModal) return;
    closeAllDrawers();
    appointmentModal.classList.add("active");
    document.body.style.overflow = "hidden";
    if (serviceTitle) {
      const garmentSelect = document.getElementById("garment-type");
      if (garmentSelect) {
        garmentSelect.value = serviceTitle;
      }
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
    const name = document.getElementById("client-name")?.value || "Client";
    closeModal();
    appointmentForm.reset();
    showToast(`Thank you, ${name}. Your bespoke consultation request has been received.`);
  });

  // Newsletter Subscription Form Submit
  subscribeForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    if (emailInput && emailInput.value.trim()) {
      const email = emailInput.value.trim();
      emailInput.value = "";
      showToast("Thank you for subscribing to Daula Attire.");
    }
  });

  // Contact Page Message Form Submit
  const messageForm = document.getElementById("message-form");
  messageForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("msg-name")?.value.trim() || "Client";
    messageForm.reset();
    showToast(`Thank you, ${name}. Our team will be in touch shortly.`);
  });

  // Services Page Carousels: one dot per page of visible cards
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
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
  });

  // Service Card Click Action
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = (card.querySelector("span")?.textContent || "").trim();
      const match = Object.entries(CATEGORIES).find(([, c]) => c.name.toLowerCase() === title.toLowerCase());
      if (match) location.href = `category.html?c=${match[0]}`;
      else openModal(title || "Bespoke Garment");
    });
  });

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
