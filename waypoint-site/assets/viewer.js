/* Waypoint prototype viewer.
   Loads the original screens (screens/*.dc.html) into an iframe and frames them
   as a desktop browser, an iPad (loader) or a phone (driver). The screens are not
   modified: the frame is built around them, and design notes (.anno) are read
   from the screen and shown in the side panel. */
(function () {
  "use strict";
  var PEOPLE = {
    dispatcher: { page: "dispatcher.html", name: "Kavindi Perera", role: "Dispatcher", initials: "KP", device: "desktop", label: "Desktop · depot office", url: "waypoint.app/dispatch",
      screens: [["DP1-Dashboard", "Today's run"], ["DP2-OrderQueue", "Orders for Wednesday"], ["DP3-PlanAllocate", "Plan and allocate"], ["DP4-DeferralDecision", "Deferral decision"], ["DP5-LiveTracking", "Live tracking"], ["DP6-DeferredLog", "Deferral log"]] },
    loader: { page: "loader.html", name: "Ruwan Jayasinghe", role: "Loader", initials: "RJ", device: "tablet", label: "Shared dock tablet", url: "",
      screens: [["LD1-DockHome", "Dock home"], ["LD2-LoadList", "Load plan"], ["LD3-ItemCheck", "Item check"], ["LD4-FlagShortfall", "Flag shortfall (degradation 1)"], ["LD5-LoadComplete", "Load complete"], ["LD6-LoadingHistory", "Loading history"]] },
    driver: { page: "driver.html", name: "Chamara Wickramasinghe", role: "Driver", initials: "CW", device: "phone", label: "Own phone · the A1 to Kandy", url: "",
      screens: [["DR1-TodaysRoute", "Today's route"], ["DR2-ActiveStop", "Active stop"], ["DR3-ProofOfDelivery", "Proof of delivery"], ["DR4-IssueAtStop", "Issue at stop"], ["DR5-OfflineMode", "Offline (degradation 2)"], ["DR6-SyncReconcile", "Sync and reconcile"], ["DR7-TripSummary", "Trip summary"]] },
    store: { page: "store.html", name: "Nadeeka Fernando", role: "Store manager", initials: "NF", device: "desktop", label: "Desktop · OUT014 Dehiwala", url: "waypoint.app/store",
      screens: [["SM1-Dashboard", "Today"], ["SM2-PlaceOrder", "Place order"], ["SM3-OrderQueue", "Orders"], ["SM4-OrderDetail", "Order detail"], ["SM5-DeferralNotice", "Deferral notice"], ["SM6-ConfirmReceipt", "Check what arrived"], ["SM7-ReportIssue", "Report a problem"]] },
    docs: { page: "docs.html", name: "Design documents", role: "Waypoint", initials: "", device: "doc", label: "Foundations", url: "",
      screens: [["Main", "Cover"], ["Problems", "The three problems"], ["Personas", "Personas"], ["Tradeoff", "Core tradeoff"], ["StyleGuide", "Style guide"], ["BrandGuide", "Brand guide: identity"], ["BrandVoice", "Brand guide: type, voice and use"], ["AIDisclosure", "AI tool disclosure"]] }
  };
  function ownerOf(name) {
    var p = name.slice(0, 2);
    return p === "DP" ? "dispatcher" : p === "LD" ? "loader" : p === "DR" ? "driver" : p === "SM" ? "store" : "docs";
  }
  var key = document.body.getAttribute("data-persona");
  var P = PEOPLE[key];
  var names = P.screens.map(function (s) { return s[0]; });
  var $ = function (id) { return document.getElementById(id); };
  var frame = $("frame"), screen = $("screen"), box = $("devicebox"), sizer = $("sizer"), stage = $("stage");
  var list = $("list"), note = $("note"), count = $("count"), prev = $("prev"), next = $("next"), urlEl = $("url");
  var current = null, crop = { w: 1440, h: 900 }, sameOrigin = true;

  // header
  $("pname").textContent = P.name;
  $("prole").textContent = P.role + " · " + P.label;
  if (P.initials) { $("avatar").textContent = P.initials; } else { $("avatar").hidden = true; }
  box.className = "devicebox " + P.device;
  if (P.device !== "desktop") { $("chrome").hidden = true; }
  document.title = P.name + " · Waypoint prototype";

  // screen list
  P.screens.forEach(function (s, i) {
    var li = document.createElement("li"), a = document.createElement("a");
    a.href = "#" + s[0];
    a.innerHTML = '<span class="code">' + (s[0].indexOf("-") > 0 ? s[0].split("-")[0] : String(i + 1).padStart(2, "0")) + "</span><span></span>";
    a.lastChild.textContent = s[1];
    li.appendChild(a); list.appendChild(li);
  });

  function show(name) {
    if (names.indexOf(name) < 0) name = names[0];
    current = name;
    var target = "screens/" + name + ".dc.html";
    if (!frame.getAttribute("src") || frame.getAttribute("src").indexOf(name + ".dc.html") < 0) frame.setAttribute("src", target);
    var i = names.indexOf(name);
    count.textContent = (i + 1) + " / " + names.length;
    prev.disabled = i === 0; next.disabled = i === names.length - 1;
    Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) {
      if (a.getAttribute("href") === "#" + name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (urlEl) urlEl.textContent = P.url + "/" + name.split("-")[0].toLowerCase();
    frame.title = P.screens[i][1] + " (" + P.role + " prototype)";
  }

  function go(name) {
    if (location.hash !== "#" + name) location.hash = name; else show(name);
  }
  window.addEventListener("hashchange", function () { show(decodeURIComponent(location.hash.slice(1))); });
  prev.addEventListener("click", function () { var i = names.indexOf(current); if (i > 0) go(names[i - 1]); });
  next.addEventListener("click", function () { var i = names.indexOf(current); if (i < names.length - 1) go(names[i + 1]); });
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    if (e.key === "ArrowLeft") { prev.click(); }
    if (e.key === "ArrowRight") { next.click(); }
  });

  function fit() {
    var bw = crop.w, bh = crop.h;
    var pad = P.device === "tablet" ? 60 : P.device === "phone" ? 26 : 0;
    var chrome = P.device === "desktop" ? 44 : 0;
    var border = P.device === "desktop" ? 4 : P.device === "doc" ? 2 : 0;
    var dw = bw + pad + border, dh = bh + pad + chrome + border;
    var sw = stage.clientWidth - 48, sh = stage.clientHeight - 48;
    if (window.innerWidth <= 1000) sh = Math.max(window.innerHeight * 0.78, 320);
    var s = Math.min(sw / dw, sh / dh, 1);
    if (!(s > 0)) s = 1;
    screen.style.width = bw + "px"; screen.style.height = bh + "px";
    box.style.transform = "scale(" + s + ")";
    sizer.style.width = Math.floor(dw * s) + "px"; sizer.style.height = Math.floor(dh * s) + "px";
  }
  window.addEventListener("resize", fit);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function viewerHref(file) {
    var n = file.replace(/^.*\//, "").replace(/\.dc\.html.*$/, "");
    return PEOPLE[ownerOf(n)].page + "#" + n;
  }

  frame.addEventListener("load", function () {
    var doc;
    try { doc = frame.contentDocument; if (!doc || !doc.body) throw new Error("no access"); }
    catch (e) { sameOrigin = false; }
    if (!sameOrigin) {
      $("fileWarn").hidden = false;
      frame.style.width = "1440px"; frame.style.height = "900px"; crop = { w: 1440, h: 900 }; fit(); return;
    }
    // follow links that lead to another persona or back to the documents
    var loaded = decodeURIComponent(frame.contentWindow.location.pathname.replace(/^.*\//, "").replace(/\.dc\.html$/, ""));
    if (loaded && ownerOf(loaded) !== key) { window.location.href = PEOPLE[ownerOf(loaded)].page + "#" + loaded; return; }
    if (loaded && loaded !== current && names.indexOf(loaded) >= 0) { history.replaceState(null, "", "#" + loaded); show(loaded); }

    // artboard size from the screen's own preview declaration
    var W = 1440, H = 900;
    try {
      var sc = doc.querySelector("script[data-dc-script]");
      var pv = JSON.parse(sc.getAttribute("data-props")).$preview; W = pv.width; H = pv.height;
    } catch (e) {}
    var st = doc.createElement("style");
    st.textContent = "html,body{margin:0!important;overflow:hidden!important;background:transparent!important}" +
      (P.device === "phone" || P.device === "tablet" ? ".anno{display:none!important}" : "");
    doc.head.appendChild(st);
    frame.style.width = W + "px"; frame.style.height = H + "px";

    // design rationale (degradation screens) moves to the side panel
    var an = doc.querySelector(".anno");
    if (an && (P.device === "phone" || P.device === "tablet")) {
      var html = "";
      var tag = an.querySelector(".anno-tag"), ti = an.querySelector(".anno-title");
      if (tag) html += '<span class="tag">' + esc(tag.textContent.trim()) + "</span>";
      if (ti) html += "<h3>" + esc(ti.textContent.trim()) + "</h3>";
      Array.prototype.forEach.call(an.querySelectorAll(":scope > p"), function (p) { html += "<p>" + esc(p.textContent.trim()) + "</p>"; });
      var items = an.querySelectorAll(".anno-item");
      if (items.length) {
        html += "<ol>";
        Array.prototype.forEach.call(items, function (it) {
          var c = it.cloneNode(true); var pin = c.querySelector(".pin"); if (pin) pin.remove();
          html += "<li>" + esc(c.textContent.trim()) + "</li>";
        });
        html += "</ol>";
      }
      var ft = an.querySelector(".anno-foot");
      if (ft) {
        var f = ft.cloneNode(true);
        Array.prototype.forEach.call(f.querySelectorAll("a"), function (a) { a.setAttribute("href", viewerHref(a.getAttribute("href"))); a.removeAttribute("style"); });
        Array.prototype.forEach.call(f.querySelectorAll("*"), function (el) { if (el.tagName !== "A") el.removeAttribute("style"); });
        html += '<p class="nfoot">' + f.innerHTML + "</p>";
      }
      note.innerHTML = '<h2 class="sr-only">Design rationale</h2>' + html; note.hidden = false;
    } else { note.hidden = true; note.innerHTML = ""; }

    // crop to the device screen inside the artboard
    requestAnimationFrame(function () {
      var sel = P.device === "phone" ? ".phone-screen" : P.device === "tablet" ? ".tablet-screen" : ".w";
      var el = doc.querySelector(sel) || doc.querySelector(".w") || doc.body;
      var r = el.getBoundingClientRect();
      crop = { w: Math.round(r.width) || W, h: Math.round(r.height) || H };
      frame.style.left = (-Math.round(r.left)) + "px"; frame.style.top = (-Math.round(r.top)) + "px";
      fit();
    });
  });

  show(decodeURIComponent(location.hash.slice(1)) || names[0]);
  fit();
})();
