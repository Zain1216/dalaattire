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

  const bagBtn = document.getElementById("bag-btn");
  const bagDrawer = document.getElementById("bag-drawer");
  const bagCloseBtn = document.getElementById("bag-close-btn");

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

  function openBagDrawer() {
    closeAllDrawers();
    bagDrawer?.classList.add("active");
    drawerOverlay?.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAllDrawers() {
    navDrawer?.classList.remove("active");
    bagDrawer?.classList.remove("active");
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

  // Shopping Bag Drawer Events
  bagBtn?.addEventListener("click", openBagDrawer);
  bagCloseBtn?.addEventListener("click", closeAllDrawers);

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
