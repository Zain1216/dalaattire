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
    document.body.style.overflow = "hidden";
  }

  function closeAllDrawers() {
    navDrawer?.classList.remove("active");
    drawerOverlay?.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Navigation Drawer Events
  menuBtn?.addEventListener("click", openNavDrawer);
  navCloseBtn?.addEventListener("click", closeAllDrawers);
  drawerOverlay?.addEventListener("click", closeAllDrawers);

  // Close nav drawer when clicking internal links
  const navLinks = navDrawer?.querySelectorAll("a");
  navLinks?.forEach((link) => {
    link.addEventListener("click", () => {
      navDrawer.querySelectorAll(".nav-links a").forEach((a) => a.classList.remove("active"));
      if (link.closest(".nav-links")) link.classList.add("active");
      closeAllDrawers();
    });
  });

  // ==========================================================================
  // Shop: product catalog, cart storage, product page and cart page
  // ==========================================================================
  const PRODUCTS = {
    "emerald-sherwani": {
      name: "Emerald Embroidered Sherwani",
      price: 48000,
      images: [
        "assets/products/emerald-sherwani.jpg",
        "assets/products/emerald-sherwani-detail-1.jpg",
        "assets/products/emerald-sherwani-detail-2.jpg",
      ],
      description: "Deep emerald jamawar with an asymmetric front and hand-worked antique gold embroidery.",
    },
    "beige-sherwani": {
      name: "Beige Hand Embroidered Sherwani",
      price: 12999,
      images: ["assets/pages/sherwani-1.jpg"],
      description: "Soft beige cloth with tonal hand embroidery and a classic band collar.",
    },
    "gold-groom-sherwani": {
      name: "Gold Groom Sherwani",
      price: 12999,
      images: ["assets/pages/sherwani-2.jpg"],
      description: "Quilted gold sherwani for the groom, finished with a matching collar.",
    },
    "champagne-sherwani": {
      name: "Champagne Jamawar Sherwani",
      price: 12999,
      images: ["assets/pages/sherwani-3.jpg"],
      description: "Champagne jamawar with an embroidered collar and cuffs.",
    },
    "bottle-green-sherwani": {
      name: "Bottle Green Sherwani",
      price: 12999,
      images: ["assets/products/bottle-green-sherwani.jpg"],
      description: "Bottle green sherwani with gold threadwork along the front opening.",
    },
    "steel-blue-sherwani": {
      name: "Steel Blue Embroidered Sherwani",
      price: 12999,
      images: ["assets/products/steel-blue-sherwani.jpg"],
      description: "Steel blue jacquard with ivory floral embroidery and pearl buttons.",
    },
    "emerald-angrakha-sherwani": {
      name: "Emerald Angrakha Sherwani",
      price: 12999,
      images: ["assets/products/emerald-angrakha-sherwani.jpg"],
      description: "Angrakha-style emerald sherwani with an embroidered panel.",
    },
  };
  const DEFAULT_PRODUCT = "emerald-sherwani";
  const CART_KEY = "daula-cart";

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
    document.querySelectorAll("#bag-btn .badge").forEach((badge) => (badge.textContent = count));
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
    Object.entries(PRODUCTS)
      .filter(([id]) => id !== productId)
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

    document.getElementById("checkout-btn")?.addEventListener("click", () => {
      if (!readCart().length) {
        showToast("Your cart is empty.");
        return;
      }
      openModal();
      showToast("Online checkout is coming soon. Request a fitting to place your order.");
    });

    renderCart();
  }

  // Consultation Modal Events
  function openModal(serviceTitle = "") {
    if (!appointmentModal) return;
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
      const title = card.querySelector("span")?.textContent || "Bespoke Garment";
      openModal(title.trim());
    });
  });

  // Scroll Reveal Animations via IntersectionObserver
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach((el) => el.classList.add("revealed"));
  }

  // Sticky header visual tweak on scroll
  const siteHeader = document.querySelector(".site-header");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 40) {
        siteHeader?.style.setProperty("background", "rgba(18, 16, 14, 0.98)");
        siteHeader?.style.setProperty("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.4)");
      } else {
        siteHeader?.style.setProperty("background", "rgba(18, 16, 14, 0.95)");
        siteHeader?.style.setProperty("box-shadow", "none");
      }
    },
    { passive: true }
  );
});
