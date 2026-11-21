/* Order popup. Used by index.html (through script.js) and by product.html. */
function openOrder(p, shop) {
  const cur = shop.currency || "";
  const num = (v, d) => (v === undefined || v === null || v === "") ? d : Number(v);
  const feeIn = num(shop.deliveryInside, 120);
  const feeOut = num(shop.deliveryOutside, 150);
  const unit = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
  const sizes = (p.sizes || []).filter(Boolean);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const field = (label, input) => {
    const w = el("label", "of");
    w.append(el("span", "", label), input);
    return w;
  };

  let qty = 1, zone = "";
  const ovl = el("div", "ovl");
  const box = el("div", "obox");
  ovl.appendChild(box);
  const onKey = e => { if (e.key === "Escape") close(); };
  const close = () => {
    ovl.remove();
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
  };

  const x = el("button", "oclose", "×");
  x.type = "button"; x.setAttribute("aria-label", "Close"); x.onclick = close;
  box.append(x, el("h2", "", "Your order"));

  // product row
  const row = el("div", "oprod");
  const pic = el("div", "opic");
  if (p.img) { const im = el("img"); im.src = p.img; im.alt = ""; pic.appendChild(im); }
  else pic.textContent = p.emoji || "🎀";
  const pt = el("div");
  pt.append(el("strong", "", p.name), el("div", "", cur + unit));
  row.append(pic, pt);
  box.appendChild(row);

  // size (only if this product has sizes)
  let sizeSel = null;
  if (sizes.length) {
    sizeSel = el("select");
    sizeSel.append(new Option("Choose size", ""));
    sizes.forEach(s => sizeSel.append(new Option(s, s)));
    box.appendChild(field("Size", sizeSel));
  }

  // quantity
  const qv = el("span", "qv", "1");
  const minus = el("button", "", "−"), plus = el("button", "", "+");
  minus.type = "button"; plus.type = "button";
  minus.onclick = () => { if (qty > 1) { qty--; update(); } };
  plus.onclick = () => { if (qty < 20) { qty++; update(); } };
  const qrow = el("div", "qty");
  qrow.append(minus, qv, plus);
  const qw = el("div", "of");
  qw.append(el("span", "", "Quantity"), qrow);
  box.appendChild(qw);

  // name and mobile
  const nameIn = el("input"); nameIn.type = "text"; nameIn.autocomplete = "name";
  const phoneIn = el("input"); phoneIn.type = "tel"; phoneIn.inputMode = "numeric";
  phoneIn.placeholder = "01XXXXXXXXX"; phoneIn.autocomplete = "tel";
  box.append(field("Your name", nameIn), field("Mobile number", phoneIn));

  // district
  const zw = el("div", "of");
  zw.appendChild(el("span", "", "District"));
  const zrow = el("div", "zones");
  [["in", "Inside Sylhet"], ["out", "Outside Sylhet"]].forEach(([v, t]) => {
    const l = el("label", "zone");
    const r = el("input"); r.type = "radio"; r.name = "zone"; r.value = v;
    r.onchange = () => { zone = v; update(); };
    l.append(r, document.createTextNode(" " + t));
    zrow.appendChild(l);
  });
  zw.append(zrow, el("small", "", "Delivery charge: inside Sylhet " + cur + feeIn + ", outside Sylhet " + cur + feeOut));
  box.appendChild(zw);

  // address and note
  const addr = el("textarea"); addr.rows = 3; addr.placeholder = "Area, road, house no, landmark";
  const note = el("input"); note.type = "text"; note.placeholder = "Colour, gift wrap, or anything else";
  box.append(field("Delivery address", addr), field("Note (optional)", note));

  // total
  const sum = el("div", "osum");
  box.appendChild(sum);
  function update() {
    qv.textContent = qty;
    const fee = zone === "in" ? feeIn : zone === "out" ? feeOut : null;
    const sub = unit * qty;
    sum.innerHTML = "";
    const line = (a, b, strong) => {
      const d = el("div", strong ? "tot" : "");
      d.append(el("span", "", a), el("span", "", b));
      sum.appendChild(d);
    };
    line(cur + unit + " × " + qty, cur + sub);
    line("Delivery", fee === null ? "Choose district" : cur + fee);
    line("Total", fee === null ? cur + sub + " + delivery" : cur + (sub + fee), true);
  }

  if (shop.paymentNote) box.appendChild(el("p", "opay", shop.paymentNote));

  const err = el("p", "oerr"); err.hidden = true;
  const send = el("button", "btn osend", "Send order on WhatsApp");
  send.type = "button";
  box.append(err, send);

  send.onclick = () => {
    const phone = phoneIn.value.replace(/[\s-]/g, "");
    let m = "";
    if (sizeSel && !sizeSel.value) m = "Please choose a size.";
    else if (!nameIn.value.trim()) m = "Please write your name.";
    else if (!/^(\+?88)?01\d{9}$/.test(phone)) m = "Please write a valid mobile number, like 01712345678.";
    else if (!zone) m = "Please choose Inside Sylhet or Outside Sylhet.";
    else if (!addr.value.trim()) m = "Please write your delivery address.";
    if (m) { err.textContent = m; err.hidden = false; return; }

    const fee = zone === "in" ? feeIn : feeOut;
    const link = new URL("product.html?p=" + encodeURIComponent(p.code || p.name), location.href).href;
    const L = ["Hi! I’d like to place an order.", "", "Product: " + p.name];
    if (sizeSel) L.push("Size: " + sizeSel.value);
    L.push(
      "Quantity: " + qty,
      "Price: " + cur + unit + " each",
      "Delivery: " + cur + fee + (zone === "in" ? " (Inside Sylhet)" : " (Outside Sylhet)"),
      "Total: " + cur + (unit * qty + fee),
      "",
      "Name: " + nameIn.value.trim(),
      "Mobile: " + phone,
      "Address: " + addr.value.trim()
    );
    if (note.value.trim()) L.push("Note: " + note.value.trim());
    L.push("", "Product link: " + link);
    const number = String(shop.whatsapp || "").replace(/\D/g, "");
    window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(L.join("\n")), "_blank");
    close();
  };

  ovl.addEventListener("click", e => { if (e.target === ovl) close(); });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(ovl);
  document.body.style.overflow = "hidden";
  update();
}
