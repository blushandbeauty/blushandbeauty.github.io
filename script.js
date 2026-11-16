/* The shop content now lives in the content/ folder and is edited in the CMS at /admin.
   You normally never need to touch this file. */

const $ = id => document.getElementById(id);
const load = name => fetch("content/" + name + ".json").then(r => {
  if (!r.ok) throw new Error(name);
  return r.json();
});

// Sample content, used only when the page is opened by double-click (file://),
// because browsers block loading the content/ files that way.
const FALLBACK = {
  shopName: "Shop Name",
  headline: "Handmade accessories, made to be worn daily",
  tagline: "Hair bands, clips and scrunchies crafted by hand in small batches.",
  owner: "Name",
  story: "I started making hair accessories at my desk for friends, and soon everyone wanted a set of their own. Each piece is cut, sewn and finished by me, with soft fabrics and lots of patience. I hope it makes your day a little better.",
  aboutPhoto: "", whatsapp: "8801XXXXXXXXX", instagram: "", facebook: "", currency: "৳",
  perks: ["Handmade in small batches", "Order on WhatsApp", "Gift packing on request"],
  categories: [
    {name: "Scrunchies", icon: "🎀"}, {name: "Hair bands", icon: "🧶"},
    {name: "Clips", icon: "✨"}, {name: "Headbands", icon: "💐"}
  ],
  products: [
    {name: "Satin scrunchie", cat: "Scrunchies", price: 150, emoji: "🎀"},
    {name: "Crochet hair band", cat: "Hair bands", price: 200, emoji: "🧶"},
    {name: "Beaded hair clip", cat: "Clips", price: 120, emoji: "✨"},
    {name: "Bow clip set", cat: "Clips", price: 180, emoji: "🌸"},
    {name: "Floral headband", cat: "Headbands", price: 250, emoji: "💐"},
    {name: "Pearl claw clip", cat: "Clips", price: 220, emoji: "🤍"}
  ]
};

Promise.all([load("shop"), load("categories"), load("products")])
  .then(([shop, cats, prods]) => start(Object.assign({}, shop, {
    categories: cats.categories || [],
    products: prods.products || []
  })))
  .catch(() => {
    if (location.protocol === "file:") {
      start(FALLBACK);
      const n = document.createElement("div");
      n.style.cssText = "background:#2B1B2E;color:#fff;text-align:center;padding:.6rem 1rem;font-size:.9rem";
      n.textContent = "Preview mode: showing sample content. Your own content shows on the live site or through a local server.";
      document.body.prepend(n);
    } else {
      $("grid").textContent = "The shop could not load. Please refresh the page or try again later.";
    }
  });

function start(C) {
  // categories marked "hidden": true are skipped, along with their products
  const hiddenCats = new Set(C.categories.filter(c => c.hidden).map(c => c.name));
  C.categories = C.categories.filter(c => !c.hidden);
  C.products = C.products.filter(p => !hiddenCats.has(p.cat));
  const tints = ["#F7ECEE", "#E8EEEA", "#F1E4EC", "#EFE9DD"];
  const number = String(C.whatsapp || "").replace(/\D/g, "");
  const cur = C.currency || "";
  const wa = text => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  const isImg = v => /[\/.]/.test(v);
  let activeCat = "All", query = "", page = 1;
  const PER_PAGE = 12;   // products shown per page
  const pager = document.createElement("nav");
  pager.className = "pager"; pager.setAttribute("aria-label", "Pages");
  $("grid").insertAdjacentElement("afterend", pager);

  document.title = C.shopName + " | Handmade hair bands & more";
  $("brand").textContent = C.shopName;
  $("fbrand").textContent = C.shopName;
  $("headline").textContent = C.headline;
  $("tagline").textContent = C.tagline;
  $("owner").textContent = C.owner;
  $("story").textContent = C.story;
  $("copy").textContent = "© " + new Date().getFullYear() + " " + C.shopName + ". Made by hand.";
  $("waTop").href = wa("Hi! I found you through your website.");
  $("waHero").href = wa("Hi! I found you through your website.");
  (C.perks || []).forEach(t => { const li = document.createElement("li"); li.textContent = t; $("perks").appendChild(li); });
  (C.notes || []).forEach(t => { const li = document.createElement("li"); li.textContent = t; $("notes").appendChild(li); });
  if (!C.story) $("about").style.display = "none";   // no story = no About section
  if (C.aboutPhoto) { const im = document.createElement("img"); im.src = C.aboutPhoto; im.alt = C.owner; $("aboutPic").textContent = ""; $("aboutPic").appendChild(im); }
  else { $("aboutPic").style.display = "none"; document.querySelector(".about-grid").classList.add("nophoto"); }

  // hero collage from the first three products
  C.products.slice(0, 3).forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "m"; d.style.background = ["#fff", "#E8EEEA", "#EBD3DB"][i];
    if (p.img) { const im = document.createElement("img"); im.src = p.img; im.alt = ""; d.appendChild(im); }
    else d.textContent = p.emoji || "🎀";
    $("mosaic").appendChild(d);
  });

  function iconNode(icon) {
    const i = document.createElement("i");
    if (icon && isImg(icon)) { const im = document.createElement("img"); im.src = icon; im.alt = ""; i.appendChild(im); }
    else i.textContent = icon || "🏷️";
    return i;
  }

  // category chips
  const catBox = $("cats");
  [{name: "All", icon: "🛍️"}].concat(C.categories).forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "cat";
    b.setAttribute("aria-pressed", c.name === "All");
    b.appendChild(iconNode(c.logo || c.icon));
    b.appendChild(document.createTextNode(c.name));
    b.onclick = () => {
      activeCat = c.name; page = 1;
      catBox.querySelectorAll(".cat").forEach(x => x.setAttribute("aria-pressed", x === b));
      render();
    };
    catBox.appendChild(b);
  });

  function render() {
    const q = query.trim().toLowerCase();
    const all = C.products.map((p, i) => ({p, i})).filter(({p}) =>
      (activeCat === "All" || p.cat === activeCat) &&
      (!q || (p.name + " " + (p.cat || "")).toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
    if (page > pages) page = pages;
    const first = (page - 1) * PER_PAGE;
    const list = all.slice(first, first + PER_PAGE);

    $("grid").innerHTML = "";
    list.forEach(({p, i}) => {
      const t = document.createElement("article");
      t.className = "tile";
      const ph = document.createElement("div");
      ph.className = "ph"; ph.style.background = tints[i % tints.length];
      if (p.img) { const im = document.createElement("img"); im.src = p.img; im.alt = p.name; im.loading = "lazy"; ph.appendChild(im); }
      else ph.textContent = p.emoji || "🎀";
      const cn = document.createElement("p"); cn.className = "cn"; cn.textContent = p.cat || "";
      const h3 = document.createElement("h3"); h3.textContent = p.name;
      const pr = document.createElement("p"); pr.className = "price"; pr.textContent = cur + p.price;
      let a;
      if (p.soldOut) {
        a = document.createElement("span");
        a.className = "btn out"; a.textContent = "Sold out";
      } else {
        a = document.createElement("a");
        a.className = "btn"; a.target = "_blank"; a.rel = "noopener";
        a.href = wa("Hi! I’d like to order the " + p.name + " (" + cur + p.price + ").");
        a.textContent = "Order on WhatsApp";
      }
      t.append(ph, cn, h3, pr, a);
      $("grid").appendChild(t);
    });

    const n = all.length;
    $("count").textContent = (q
      ? n + (n === 1 ? " result" : " results") + " for “" + query.trim() + "”"
      : n + (n === 1 ? " item" : " items") + (activeCat === "All" ? "" : " in " + activeCat))
      + (pages > 1 ? " (showing " + (first + 1) + "-" + (first + list.length) + ")" : "");
    $("empty").hidden = n > 0;
    $("count").hidden = n === 0;
    $("askBtn").href = wa("Hi! I’m looking for: " + (query.trim() || activeCat) + ". Can you make it?");
    renderPager(pages);
  }

  function renderPager(pages) {
    pager.innerHTML = "";
    if (pages <= 1) return;
    const add = (label, p, o) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = label;
      if (o.aria) b.setAttribute("aria-label", o.aria);
      if (o.current) { b.classList.add("on"); b.setAttribute("aria-current", "page"); }
      if (o.disabled) b.disabled = true;
      b.onclick = () => { page = p; render(); $("cats").scrollIntoView({behavior: "smooth"}); };
      pager.appendChild(b);
    };
    add("Prev", page - 1, {disabled: page === 1, aria: "Previous page"});
    let last = 0;
    for (let p = 1; p <= pages; p++) {
      if (p === 1 || p === pages || Math.abs(p - page) <= 1) {
        if (last && p - last > 1) { const d = document.createElement("span"); d.textContent = "…"; pager.appendChild(d); }
        add(String(p), p, {current: p === page, aria: "Page " + p});
        last = p;
      }
    }
    add("Next", page + 1, {disabled: page === pages, aria: "Next page"});
  }

  $("q").addEventListener("input", e => {
    query = e.target.value; page = 1;
    $("clear").hidden = !query;
    render();
  });
  $("clear").onclick = () => { $("q").value = ""; query = ""; page = 1; $("clear").hidden = true; render(); $("q").focus(); };
  render();

  const full = u => /^https?:\/\//i.test(u) ? u : "https://" + u;
  const ICONS = {
    Facebook: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#1877F2" d="M13.5 22v-8h2.7l.5-3.2h-3.2V8.7c0-.9.4-1.7 1.8-1.7h1.5V4.2c-.3 0-1.3-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v2.6H7.7V14h2.6v8z"/></svg>',
    Instagram: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2B1B2E" stroke-width="2" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="#2B1B2E" stroke="none"/></svg>'
  };
  const wab = document.createElement("a");
  wab.className = "btn"; wab.href = wa("Hi! I found you through your website.");
  wab.target = "_blank"; wab.rel = "noopener"; wab.textContent = "Message on WhatsApp";
  $("links").appendChild(wab);
  [["Facebook", C.facebook], ["Instagram", C.instagram]].forEach(([name, url]) => {
    if (!url) return;
    const a = document.createElement("a");
    a.className = "soc"; a.href = full(url); a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("aria-label", name);
    a.innerHTML = ICONS[name];
    $("links").appendChild(a);
  });
}
