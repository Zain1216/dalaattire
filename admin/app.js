/**
 * DAULA ATTIRE - Admin app
 * Runs on GitHub Pages (or any static host); talks to the PHP admin API on Hostinger.
 * Views: #/setup, #/login, #/products, #/product/new, #/product/<id>, #/categories
 */

(() => {
  // Same backend as the storefront (see BACKEND_URL in ../script.js)
  const BACKEND_URL = "https://subscription.zainulabideen.tech/daula-attire";
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const API_URL = isLocal ? "../backend/api/admin.php" : `${BACKEND_URL}/backend/api/admin.php`;
  const TOKEN_KEY = "daula-admin-token";
  const USER_KEY = "daula-admin-user";
  const MAX_UPLOAD_MB = 5;

  const view = document.getElementById("view");
  const bar = document.getElementById("admin-bar");
  const flashArea = document.getElementById("flash-area");

  // ------------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------------
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  }

  function storage(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // Storage blocked: the login only lasts for this page
    }
    return null;
  }

  let token = storage(TOKEN_KEY);

  function flash(message, type = "ok") {
    const p = document.createElement("p");
    p.className = `flash flash-${type}`;
    p.setAttribute("role", "status");
    p.textContent = message;
    flashArea.appendChild(p);
    setTimeout(() => p.remove(), 6000);
  }

  function clearFlash() {
    flashArea.innerHTML = "";
  }

  function formatPrice(n) {
    return "Rs. " + Number(n).toLocaleString("en-US");
  }

  /** ISO UTC time -> value for <input type="datetime-local"> in the admin's own time zone. */
  function toLocalInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** Price cell for the products list. */
  function priceCell(p) {
    if (p.price_on_request) return '<span class="muted">On request</span>' + (p.offer_active ? ' <span class="pill pill-on">Offer</span>' : "");
    if (p.offer_active && p.offer_price) return `<s class="muted">${formatPrice(p.price)}</s> ${formatPrice(p.offer_price)} <span class="pill pill-on">Offer</span>`;
    return formatPrice(p.price) + (p.offer_active ? ' <span class="pill pill-on">Timer</span>' : "");
  }

  /** Call the admin API. GET when no body is given, POST (FormData) otherwise. */
  async function api(action, { query = {}, body } = {}) {
    const url = new URL(API_URL, location.href);
    url.searchParams.set("action", action);
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(url, { method: body ? "POST" : "GET", headers, body });
    } catch {
      throw new Error("Could not reach the server. Check your internet connection and try again.");
    }
    let data = {};
    try {
      data = await res.json();
    } catch {
      throw new Error("The server sent an unexpected reply. Is the backend uploaded to Hostinger?");
    }
    if (res.status === 401 && action !== "login") {
      setSession(null);
      location.hash = "#/login";
      throw new Error(data.error || "Please log in again.");
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
    return data;
  }

  function setSession(newToken, username) {
    token = newToken;
    storage(TOKEN_KEY, newToken);
    storage(USER_KEY, newToken ? username : null);
  }

  function formData(form, extra = {}) {
    const fd = new FormData(form);
    Object.entries(extra).forEach(([k, v]) => fd.set(k, v));
    return fd;
  }

  /** Disable a form's buttons while a request runs. */
  async function busy(form, task) {
    const buttons = form.querySelectorAll("button");
    buttons.forEach((b) => (b.disabled = true));
    try {
      await task();
    } catch (err) {
      clearFlash();
      flash(err.message, "error");
    } finally {
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  function tooBig(files) {
    return [...files].find((f) => f.size > MAX_UPLOAD_MB * 1024 * 1024);
  }

  // ------------------------------------------------------------------------
  // Views
  // ------------------------------------------------------------------------
  const EYE_OPEN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_SHUT = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.6 6.6A17.5 17.5 0 0 0 2 12s3.6 7 10 7a10.6 10.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  /** Eye button inside a password field to show or hide what was typed. */
  function addPasswordToggle(input) {
    const wrap = document.createElement("span");
    wrap.className = "password-wrap";
    input.replaceWith(wrap);
    wrap.appendChild(input);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "password-toggle";
    const sync = () => {
      const shown = input.type === "text";
      btn.innerHTML = shown ? EYE_SHUT : EYE_OPEN;
      btn.setAttribute("aria-label", shown ? "Hide password" : "Show password");
      btn.setAttribute("aria-pressed", String(shown));
    };
    btn.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
      sync();
      input.focus();
    });
    sync();
    wrap.appendChild(btn);
  }

  function authView({ title, intro = "", button, action }) {
    bar.hidden = true;
    view.innerHTML = `
      <div class="card narrow">
        <h1>${esc(title)}</h1>
        ${intro ? `<p class="muted">${esc(intro)}</p>` : ""}
        <form class="form" id="auth-form">
          <label>Username<input name="username" autocomplete="username" required autofocus></label>
          <label>Password<input type="password" name="password" autocomplete="${action === "setup" ? "new-password" : "current-password"}" ${action === "setup" ? 'minlength="10"' : ""} required></label>
          ${action === "setup" ? '<label>Confirm Password<input type="password" name="confirm" autocomplete="new-password" minlength="10" required></label>' : ""}
          <button type="submit" class="btn">${esc(button)}</button>
        </form>
      </div>`;
    const form = document.getElementById("auth-form");
    form.querySelectorAll('input[type="password"]').forEach(addPasswordToggle);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      busy(form, async () => {
        if (action === "setup" && form.password.value !== form.confirm.value) {
          throw new Error("The two passwords do not match.");
        }
        const data = await api(action, { body: formData(form) });
        setSession(data.token, data.username);
        clearFlash();
        if (action === "setup") flash("Admin account created. Welcome!");
        location.hash = "#/products";
      });
    });
  }

  async function productsView() {
    const filter = new URLSearchParams(location.hash.split("?")[1] || "").get("category") || "0";
    const [{ categories }, { products }] = await Promise.all([
      api("categories"),
      api("products", { query: filter !== "0" ? { category: filter } : {} }),
    ]);
    view.innerHTML = `
      <div class="page-head">
        <h1>Products <span class="count">${products.length}</span></h1>
        <a href="#/product/new" class="btn">+ Add Product</a>
      </div>
      <div class="toolbar">
        <label>Category
          <select id="cat-filter">
            <option value="0">All categories</option>
            ${categories.map((c) => `<option value="${c.id}" ${String(c.id) === filter ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Colour</th><th>Availability</th><th>On Site</th><th></th></tr></thead>
          <tbody>
            ${products.map((p) => `
              <tr class="${p.is_active ? "" : "row-hidden"}">
                <td>${p.cover ? `<img src="${esc(p.cover)}" alt="" class="thumb" loading="lazy">` : '<span class="no-photo">No photo</span>'}</td>
                <td><a href="#/product/${p.id}" class="strong">${esc(p.name)}</a></td>
                <td>${esc(p.category)}</td>
                <td>${priceCell(p)}</td>
                <td>${esc(p.color)}</td>
                <td>${esc(p.availability)}</td>
                <td><button type="button" class="pill ${p.is_active ? "pill-on" : "pill-off"}" data-toggle="${p.id}">${p.is_active ? "Visible" : "Hidden"}</button></td>
                <td><div class="actions">
                  <a href="${esc(p.site_link)}" target="_blank" rel="noopener">View</a>
                  <a href="#/product/${p.id}">Edit</a>
                  <button type="button" class="link-danger" data-delete="${p.id}" data-name="${esc(p.name)}">Delete</button>
                </div></td>
              </tr>`).join("") || '<tr><td colspan="8" class="empty">No products yet. <a href="#/product/new">Add the first one.</a></td></tr>'}
          </tbody>
        </table>
      </div>`;

    document.getElementById("cat-filter").addEventListener("change", (e) => {
      location.hash = e.target.value === "0" ? "#/products" : `#/products?category=${e.target.value}`;
    });
    view.querySelector("tbody").addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      try {
        if (btn.dataset.toggle) {
          btn.disabled = true;
          await api("product_toggle", { body: formData(document.createElement("form"), { id: btn.dataset.toggle }) });
        } else if (btn.dataset.delete) {
          if (!confirm(`Delete ${btn.dataset.name}? This cannot be undone.`)) return;
          const res = await api("product_delete", { body: formData(document.createElement("form"), { id: btn.dataset.delete }) });
          clearFlash();
          flash(res.message);
        }
        await productsView();
      } catch (err) {
        flash(err.message, "error");
      }
    });
  }

  async function productView(id) {
    const isNew = id === "new";
    const [{ categories }, detail] = await Promise.all([
      api("categories"),
      isNew ? Promise.resolve({ product: null, colors: [] }) : api("product", { query: { id } }),
    ]);
    const p = detail.product || { name: "", slug: "", category_id: categories[0]?.id, description: "", price: "", color: "", availability: "In Stock", is_active: true, sort_order: 0, images: [], price_on_request: false, offer_price: null, offer_ends_at: null };
    const offerEnded = p.offer_ends_at && new Date(p.offer_ends_at) <= new Date();

    view.innerHTML = `
      <div class="page-head">
        <h1>${isNew ? "Add Product" : "Edit Product"}</h1>
        <div class="head-links">
          ${isNew ? "" : `<a href="${esc(p.site_link)}" target="_blank" rel="noopener">View on site</a>`}
          <a href="#/products">&larr; All products</a>
        </div>
      </div>
      ${categories.length ? "" : '<p class="flash flash-error">Add a category first, then come back to add products. <a href="#/categories">Go to Categories</a></p>'}
      <div class="edit-grid">
        <form class="card form" id="product-form">
          <label>Name*<input name="name" value="${esc(p.name)}" required maxlength="160"></label>
          <div class="row">
            <label>Category*
              <select name="category_id" required>
                ${categories.map((c) => `<option value="${c.id}" ${c.id === p.category_id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
              </select>
            </label>
            <label>Price (Rs.)<span class="price-required">*</span><input name="price" value="${p.price_on_request && !p.price ? "" : esc(p.price)}" inputmode="numeric" pattern="[0-9]+" ${p.price_on_request ? "" : "required"}></label>
          </div>
          <label class="check"><input type="checkbox" name="price_on_request" value="1" ${p.price_on_request ? "checked" : ""}> Price on request &mdash; hide the price and show a &ldquo;Contact on WhatsApp&rdquo; button instead of Add to Cart</label>

          <fieldset class="offer-box">
            <legend>Limited Time Offer <span class="muted">(optional)</span></legend>
            ${offerEnded ? '<p class="flash flash-error">This offer has ended and is no longer shown on the site. Set a new end time or clear it.</p>' : ""}
            <div class="row">
              <label>Offer price (Rs.)<input name="offer_price" value="${p.offer_price ?? ""}" inputmode="numeric" pattern="[0-9]+" placeholder="e.g. 9999"></label>
              <label>Offer ends<input type="datetime-local" name="offer_ends_local" value="${toLocalInput(p.offer_ends_at)}"></label>
            </div>
            <p class="hint">Set an end time to show a countdown timer on the product. When it ends, the regular price comes back by itself. Leave the offer price empty to show only the countdown.</p>
            <button type="button" class="link" id="clear-offer">Clear offer</button>
          </fieldset>
          <div class="row">
            <label>Colour<input name="color" value="${esc(p.color)}" maxlength="40" placeholder="e.g. Green" list="colour-list"></label>
            <label>Availability*
              <select name="availability">
                ${["In Stock", "Made to Order"].map((a) => `<option ${a === p.availability ? "selected" : ""}>${a}</option>`).join("")}
              </select>
            </label>
          </div>
          <datalist id="colour-list">${detail.colors.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
          <label>Description<textarea name="description" rows="4">${esc(p.description)}</textarea></label>
          <div class="row">
            <label>Web address (slug)<input name="slug" value="${esc(p.slug)}" maxlength="120" placeholder="Made from the name if left empty"></label>
            <label>Sort order<input type="number" name="sort_order" value="${Number(p.sort_order) || 0}"></label>
          </div>
          <label>Add photos${p.images.length ? "" : "*"}<input type="file" name="images[]" accept="image/jpeg,image/png,image/webp" multiple></label>
          <p class="hint">JPG, PNG or WebP, up to ${MAX_UPLOAD_MB} MB each. Portrait photos look best.</p>
          <label class="check"><input type="checkbox" name="is_active" value="1" ${p.is_active ? "checked" : ""}> Show this product on the site</label>
          <button type="submit" class="btn">Save Product</button>
        </form>
        ${isNew ? "" : `
        <section class="card">
          <h2>Photos</h2>
          <p class="hint">The first photo is the cover shown in category grids.</p>
          <div class="photo-grid" id="photo-grid">
            ${p.images.map((img, i) => `
              <figure class="photo">
                <img src="${esc(img.url)}" alt="">
                <figcaption>
                  ${i === 0 ? '<span class="pill pill-on">Cover</span>' : `<button type="button" class="link" data-cover="${img.id}">Make cover</button>`}
                  ${p.images.length > 1 ? `<button type="button" class="link-danger" data-remove="${img.id}">Remove</button>` : ""}
                </figcaption>
              </figure>`).join("")}
          </div>
        </section>`}
      </div>`;

    const form = document.getElementById("product-form");
    // Price becomes optional when the product is "price on request"
    form.price_on_request.addEventListener("change", () => {
      form.price.required = !form.price_on_request.checked;
      form.querySelector(".price-required").hidden = form.price_on_request.checked;
    });
    form.querySelector(".price-required").hidden = form.price_on_request.checked;
    document.getElementById("clear-offer").addEventListener("click", () => {
      form.offer_price.value = "";
      form.offer_ends_local.value = "";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      busy(form, async () => {
        const big = tooBig(form.querySelector('[type="file"]').files);
        if (big) throw new Error(`${big.name} is larger than ${MAX_UPLOAD_MB} MB.`);
        const endsLocal = form.offer_ends_local.value;
        if (endsLocal && new Date(endsLocal) <= new Date()) throw new Error("Offer end time must be in the future.");
        const fd = formData(form, {
          id: isNew ? "0" : String(p.id),
          is_active: form.is_active.checked ? "1" : "0",
          price_on_request: form.price_on_request.checked ? "1" : "0",
          // The browser's local time (e.g. Pakistan) is sent to the server as UTC
          offer_ends_at: endsLocal ? new Date(endsLocal).toISOString() : "",
        });
        fd.delete("offer_ends_local");
        const res = await api("product_save", { body: fd });
        clearFlash();
        flash(res.message);
        if (isNew) location.hash = `#/product/${res.id}`;
        else await productView(String(res.id));
      });
    });

    document.getElementById("photo-grid")?.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.remove && !confirm("Remove this photo?")) return;
      try {
        const res = await api(btn.dataset.remove ? "image_delete" : "image_cover", {
          body: formData(document.createElement("form"), { product_id: p.id, image_id: btn.dataset.remove || btn.dataset.cover }),
        });
        clearFlash();
        flash(res.message);
        await productView(String(p.id));
      } catch (err) {
        flash(err.message, "error");
      }
    });
  }

  // ------------------------------------------------------------------------
  // Inbox: orders, consultations, messages and subscribers sent from the website
  // ------------------------------------------------------------------------
  const INBOX_TABS = [
    { type: "order", label: "Orders" },
    { type: "appointment", label: "Consultations" },
    { type: "contact", label: "Messages" },
    { type: "subscribe", label: "Subscribers" },
  ];
  const STATUSES = { new: "New", in_progress: "In progress", done: "Done" };

  async function refreshInboxBadge() {
    try {
      const { totalNew } = await api("inbox_counts");
      const badge = document.getElementById("inbox-badge");
      badge.textContent = totalNew;
      badge.hidden = !totalNew;
    } catch {
      // Older backend without the Inbox: no badge
    }
  }

  function whenText(ms) {
    return new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  /** WhatsApp link for a customer's phone number (Pakistani 03xx numbers become 923xx). */
  function waLink(phone) {
    let digits = String(phone).replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = "92" + digits.slice(1);
    return `https://wa.me/${digits}`;
  }

  function contactLinks(s) {
    return [
      s.phone ? `<a href="tel:${esc(s.phone)}">${esc(s.phone)}</a> · <a href="${esc(waLink(s.phone))}" target="_blank" rel="noopener">WhatsApp</a>` : "",
      s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : "",
    ].filter(Boolean).join("<br>");
  }

  function inboxDetails(s) {
    const d = s.data || {};
    const row = (label, value) => (value ? `<div class="inbox-field"><span>${label}</span><p>${esc(value)}</p></div>` : "");
    if (s.type === "order") {
      return `
        <table class="inbox-items">
          <thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>${(d.items || []).map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.size)}</td><td>${l.qty}</td><td>${formatPrice(l.unit_price)}${l.unit_price < l.regular_price ? ' <span class="pill pill-on">Offer</span>' : ""}</td><td>${formatPrice(l.line_total)}</td></tr>`).join("")}</tbody>
          <tfoot>
            <tr><td colspan="4">Subtotal</td><td>${formatPrice(d.subtotal || 0)}</td></tr>
            <tr><td colspan="4">Shipping</td><td>${d.shipping ? formatPrice(d.shipping) : "Free"}</td></tr>
            <tr class="strong-row"><td colspan="4">Total</td><td>${formatPrice(s.total || 0)}</td></tr>
          </tfoot>
        </table>
        ${row("Payment", d.payment)}${row("Coupon", d.coupon)}
        ${row("Delivery address", [d.address, d.city, d.postal].filter(Boolean).join(", "))}${row("Notes", d.notes)}`;
    }
    if (s.type === "appointment") return row("Garment", d.garment) + row("Preferred date", d.date) + row("Notes", d.notes);
    if (s.type === "contact") return row("Subject", d.subject) + row("Message", d.message);
    return "";
  }

  async function inboxView() {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const type = INBOX_TABS.some((t) => t.type === params.get("type")) ? params.get("type") : "order";
    const status = params.get("status") || "";
    const offset = Number(params.get("offset")) || 0;
    const query = { type, offset };
    if (status) query.status = status;
    const [counts, list] = await Promise.all([api("inbox_counts"), api("inbox", { query })]);
    const link = (q) => "#/inbox?" + new URLSearchParams({ type, ...(status ? { status } : {}), ...q });

    view.innerHTML = `
      <div class="page-head"><h1>Inbox ${counts.totalNew ? `<span class="count">${counts.totalNew} new</span>` : ""}</h1></div>
      <nav class="inbox-tabs">
        ${INBOX_TABS.map((t) => `<a href="#/inbox?type=${t.type}" class="${t.type === type ? "active" : ""}">${t.label}
          <span class="tab-count">${counts.counts[t.type]}</span>${counts.new[t.type] ? `<span class="nav-badge">${counts.new[t.type]}</span>` : ""}</a>`).join("")}
      </nav>
      ${type === "subscribe" ? "" : `
      <div class="toolbar">
        <label>Status
          <select id="status-filter">
            <option value="">All</option>
            ${Object.entries(STATUSES).map(([v, l]) => `<option value="${v}" ${v === status ? "selected" : ""}>${l}</option>`).join("")}
          </select>
        </label>
      </div>`}
      ${type === "subscribe" ? subscribersTable(list.items) : `
      <div class="inbox-list">
        ${list.items.map((s) => `
          <article class="card inbox-card status-${s.status}" data-id="${s.id}">
            <header class="inbox-head">
              <div>
                <h2>${s.reference ? esc(s.reference) + " · " : ""}${esc(s.name || "—")}</h2>
                <p class="muted">${whenText(s.createdAt)}${s.total !== null ? ` · <strong class="gold">${formatPrice(s.total)}</strong>` : ""}</p>
              </div>
              <div class="inbox-actions">
                <select data-status aria-label="Status">${Object.entries(STATUSES).map(([v, l]) => `<option value="${v}" ${v === s.status ? "selected" : ""}>${l}</option>`).join("")}</select>
                <button type="button" class="link-danger" data-delete>Delete</button>
              </div>
            </header>
            <div class="inbox-contact">${contactLinks(s)}</div>
            <div class="inbox-body">${inboxDetails(s)}</div>
          </article>`).join("") || '<p class="card empty">Nothing here yet.</p>'}
      </div>`}
      ${list.total > list.limit ? `
      <div class="pager">
        ${offset > 0 ? `<a href="${link({ offset: Math.max(0, offset - list.limit) })}">&larr; Newer</a>` : "<span></span>"}
        <span class="muted">${offset + 1}–${Math.min(offset + list.limit, list.total)} of ${list.total}</span>
        ${offset + list.limit < list.total ? `<a href="${link({ offset: offset + list.limit })}">Older &rarr;</a>` : "<span></span>"}
      </div>` : ""}`;

    document.getElementById("status-filter")?.addEventListener("change", (e) => {
      location.hash = "#/inbox?" + new URLSearchParams({ type, ...(e.target.value ? { status: e.target.value } : {}) });
    });

    view.querySelectorAll("[data-id]").forEach((card) => {
      const id = card.dataset.id;
      card.querySelector("[data-status]")?.addEventListener("change", async (e) => {
        try {
          await api("inbox_status", { body: formData(document.createElement("form"), { id, status: e.target.value }) });
          card.className = card.className.replace(/status-\w+/, "status-" + e.target.value);
          refreshInboxBadge();
        } catch (err) {
          flash(err.message, "error");
        }
      });
      card.querySelector("[data-delete]")?.addEventListener("click", async () => {
        if (!confirm("Delete this permanently?")) return;
        try {
          await api("inbox_delete", { body: formData(document.createElement("form"), { id }) });
          clearFlash();
          flash("Deleted.");
          await inboxView();
          refreshInboxBadge();
        } catch (err) {
          flash(err.message, "error");
        }
      });
    });
  }

  function subscribersTable(items) {
    if (!items.length) return '<p class="card empty">No subscribers yet.</p>';
    return `
      <p class="hint">Copy all emails: <button type="button" class="link" id="copy-emails">Copy</button></p>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Email</th><th>Subscribed</th><th></th></tr></thead>
          <tbody>${items.map((s) => `<tr data-id="${s.id}"><td><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></td><td>${whenText(s.createdAt)}</td><td><button type="button" class="link-danger" data-delete>Remove</button></td></tr>`).join("")}</tbody>
        </table>
      </div>`;
  }

  // "Copy" on the subscribers tab
  view.addEventListener("click", async (e) => {
    if (e.target.id !== "copy-emails") return;
    const emails = [...view.querySelectorAll(".data-table td a[href^='mailto:']")].map((a) => a.textContent).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      flash("Emails copied.");
    } catch {
      prompt("Copy these emails:", emails);
    }
  });

  async function categoriesView() {
    const { categories } = await api("categories");
    const card = (c) => `
      <form class="card cat-card" data-id="${c.id}">
        <img src="${esc(c.hero || "")}" alt="" class="cat-hero">
        <div class="form">
          <div class="row">
            <label>Name<input name="name" value="${esc(c.name)}" required maxlength="120"></label>
            <label>Web address (slug)<input name="slug" value="${esc(c.slug)}" maxlength="80"></label>
          </div>
          <div class="row">
            <label>Sort order<input type="number" name="sort_order" value="${c.sort_order}"></label>
            <label>New banner photo<input type="file" name="hero" accept="image/jpeg,image/png,image/webp"></label>
          </div>
          <div class="cat-actions">
            <button type="submit" class="btn">Save</button>
            <a href="#/products?category=${c.id}">${c.products} products</a>
            <a href="${esc(c.site_link)}" target="_blank" rel="noopener">View page</a>
            <button type="button" class="link-danger" data-delete="${c.id}" ${c.products ? 'disabled title="Move or delete its products first"' : ""}>Delete</button>
          </div>
        </div>
      </form>`;

    view.innerHTML = `
      <div class="page-head"><h1>Categories <span class="count">${categories.length}</span></h1></div>
      <div class="cat-list">
        ${categories.map(card).join("")}
        <form class="card cat-card cat-new" data-id="0">
          <h2>Add Category</h2>
          <div class="form">
            <div class="row">
              <label>Name*<input name="name" required maxlength="120" placeholder="e.g. Waistcoat"></label>
              <label>Sort order<input type="number" name="sort_order" value="${categories.length + 1}"></label>
            </div>
            <label>Banner photo<input type="file" name="hero" accept="image/jpeg,image/png,image/webp"></label>
            <button type="submit" class="btn">Add Category</button>
          </div>
        </form>
      </div>`;

    view.querySelectorAll(".cat-card").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        busy(form, async () => {
          const big = tooBig(form.querySelector('[type="file"]').files);
          if (big) throw new Error(`${big.name} is larger than ${MAX_UPLOAD_MB} MB.`);
          const res = await api("category_save", { body: formData(form, { id: form.dataset.id }) });
          clearFlash();
          flash(res.message);
          await categoriesView();
        });
      });
      form.querySelector("[data-delete]")?.addEventListener("click", () => {
        if (!confirm("Delete this category?")) return;
        busy(form, async () => {
          const res = await api("category_delete", { body: formData(document.createElement("form"), { id: form.dataset.id }) });
          clearFlash();
          flash(res.message);
          await categoriesView();
        });
      });
    });
  }

  // ------------------------------------------------------------------------
  // Router
  // ------------------------------------------------------------------------
  async function route() {
    const path = location.hash.replace(/^#/, "").split("?")[0] || "/products";
    bar.querySelectorAll("[data-nav]").forEach((a) =>
      a.classList.toggle("active", path.startsWith("/" + a.dataset.nav) || (a.dataset.nav === "products" && path.startsWith("/product")))
    );

    try {
      if (!token) {
        const { needsSetup } = await api("status");
        if (needsSetup) return authView({ title: "Create Admin Account", intro: "This works only once. After this account is created it locks itself.", button: "Create Account", action: "setup" });
        return authView({ title: "Admin Log In", button: "Log In", action: "login" });
      }
      if (path === "/login" || path === "/setup") {
        location.hash = "#/products";
        return;
      }
      bar.hidden = false;
      document.getElementById("logout-btn").textContent = `Log Out (${storage(USER_KEY) || "admin"})`;
      view.innerHTML = '<p class="muted loading">Loading&hellip;</p>';
      if (path.startsWith("/product/")) await productView(path.split("/")[2]);
      else if (path === "/categories") await categoriesView();
      else if (path === "/inbox") await inboxView();
      else await productsView();
      refreshInboxBadge();
      window.scrollTo(0, 0);
    } catch (err) {
      if (!token) {
        view.innerHTML = `<div class="card narrow"><h1>Cannot reach the backend</h1><p class="muted">${esc(err.message)}</p></div>`;
      } else {
        flash(err.message, "error");
      }
    }
  }

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await api("logout", { body: new FormData() });
    } catch {
      // Already logged out on the server
    }
    setSession(null);
    clearFlash();
    location.hash = "#/login";
    route();
  });

  window.addEventListener("hashchange", route);
  route();
})();
