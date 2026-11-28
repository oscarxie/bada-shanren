const asset = (name) => "assets/" + name + ".webp";
const byId = (id) => document.getElementById(id);
const museumNames = new Map([
  ["www.dpm.org.cn", "北京故宫博物院"],
  ["www.shanghaimuseum.cn", "上海博物馆"],
  ["www.tjbwg.cn", "天津博物馆"],
  ["www.metmuseum.org", "大都会艺术博物馆"],
  ["www.bdsrjng.cn", "八大山人纪念馆"],
]);

const preloadedAssets = new Set();
function preloadAsset(name) {
  if (!name || preloadedAssets.has(name)) return;
  preloadedAssets.add(name);
  const preloader = new Image();
  preloader.decoding = "async";
  preloader.src = asset(name);
}

let imageLoadCounter = 0;
function swapImage(imgEl, containerEl, name, alt, onReady) {
  const targetSrc = asset(name);
  const token = String(++imageLoadCounter);
  imgEl.dataset.loadToken = token;
  imgEl.alt = alt;

  const finish = () => {
    if (imgEl.dataset.loadToken !== token) return;
    containerEl.classList.remove("is-loading");
    onReady?.();
  };

  if (imgEl.getAttribute("src") === targetSrc && imgEl.complete && imgEl.naturalWidth > 0) {
    finish();
    return;
  }

  containerEl.classList.add("is-loading");
  imgEl.src = targetSrc;

  if (imgEl.complete && imgEl.naturalWidth > 0) {
    finish();
    return;
  }

  const handleLoad = () => {
    if (imgEl.dataset.loadToken !== token) return;
    if (typeof imgEl.decode === "function") {
      imgEl.decode().catch(() => {}).finally(finish);
    } else {
      finish();
    }
  };
  imgEl.addEventListener("load", handleLoad, { once: true });
  imgEl.addEventListener("error", finish, { once: true });
}

const lookImage = byId("look-image");
const lookArt = lookImage.closest(".looking-art");
const lookButtons = [...document.querySelectorAll("[data-look]")];
let lookPreloaded = false;
function preloadLookFrames() {
  if (lookPreloaded) return;
  lookPreloaded = true;
  lotusFrames.forEach(([name]) => preloadAsset(name));
}
lookButtons.forEach((button) => {
  button.addEventListener("pointerenter", preloadLookFrames, { once: true });
  button.addEventListener("focus", preloadLookFrames, { once: true });
  button.addEventListener("click", () => {
    preloadLookFrames();
    const index = Number(button.dataset.look);
    lookButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    const [name, caption] = lotusFrames[index];
    const [title, story] = looking[index];
    swapImage(lookImage, lookArt, name, caption);
    byId("look-caption").textContent = caption;
    byId("look-title").textContent = title;
    byId("look-text").textContent = story;
  });
});

const grid = byId("work-grid");
const filters = [...document.querySelectorAll("[data-filter]")];
function showWorks(type) {
  const selected = works.filter((work) => type === "全部" || work.type === type);
  const cards = selected.map((work) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.dataset.work = work.id;
    const art = document.createElement("span");
    art.className = "card-art";
    const image = new Image();
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.src = asset(work.thumb || work.cover);
    art.append(image);
    const copy = document.createElement("span");
    copy.className = "card-copy";
    for (const [className, value] of [["card-category",work.type],["card-title",work.title],["card-summary",work.summary]]) {
      const line = document.createElement("span");
      line.className = className;
      line.textContent = value;
      copy.append(line);
    }
    card.append(art, copy);
    return card;
  });
  grid.replaceChildren(...cards);
  byId("filter-status").textContent = "显示 " + selected.length + " 件作品";
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    showWorks(button.dataset.filter);
  });
});
showWorks("全部");

const dialog = byId("work-dialog");
const detailArt = byId("detail-art");
const image = byId("detail-image");
const detailZoom = byId("detail-zoom");
const previous = byId("detail-prev");
const next = byId("detail-next");
const lightbox = byId("lightbox-dialog");
const lightboxStage = byId("lightbox-stage");
const lightboxImage = byId("lightbox-image");
const lightboxCaption = byId("lightbox-caption");
const lightboxPosition = byId("lightbox-position");
const lightboxZoom = byId("lightbox-zoom");
const lightboxClose = byId("lightbox-close");
const lightboxNav = byId("lightbox-nav");
const lightboxPrev = byId("lightbox-prev");
const lightboxNext = byId("lightbox-next");
const lightboxHint = byId("lightbox-hint");
let activeWork;
let activeFrame = 0;
let opener;
let lightboxOpener;
let isActualSize = false;
let canUseActual = false;

function isDetailZoomable() {
  if (!image.naturalWidth || !image.naturalHeight) return false;
  if (Math.max(image.naturalWidth, image.naturalHeight) < 560) return false;
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return true;
  return image.naturalWidth > rect.width * 1.12 || image.naturalHeight > rect.height * 1.12;
}

function syncDetailZoom() {
  if (detailArt.classList.contains("is-loading")) return;
  const zoomable = isDetailZoomable();
  detailZoom.hidden = !zoomable;
  image.classList.toggle("is-zoomable", zoomable);
  if (zoomable) {
    image.title = "点击放大细看";
  } else {
    image.removeAttribute("title");
  }
}

function setLightboxActual(actual, anchor) {
  isActualSize = actual && canUseActual;
  lightboxStage.classList.toggle("is-actual", isActualSize);
  lightboxZoom.setAttribute("aria-pressed", String(isActualSize));
  lightboxZoom.textContent = isActualSize ? "适应屏幕" : "原寸 1:1";
  updateLightboxHint();
  if (!isActualSize) {
    lightboxStage.scrollTo(0, 0);
    return;
  }
  requestAnimationFrame(() => {
    const maxX = Math.max(0, lightboxStage.scrollWidth - lightboxStage.clientWidth);
    const maxY = Math.max(0, lightboxStage.scrollHeight - lightboxStage.clientHeight);
    if (anchor) {
      const targetX = anchor.rx * lightboxStage.scrollWidth - lightboxStage.clientWidth / 2;
      const targetY = anchor.ry * lightboxStage.scrollHeight - lightboxStage.clientHeight / 2;
      lightboxStage.scrollTo(Math.min(maxX, Math.max(0, targetX)), Math.min(maxY, Math.max(0, targetY)));
    } else if (lightboxImage.naturalWidth / lightboxImage.naturalHeight >= 2.2) {
      lightboxStage.scrollTo(maxX, maxY / 2);
    } else {
      lightboxStage.scrollTo(maxX / 2, Math.min(maxY, maxY * 0.2));
    }
  });
}

function updateLightboxHint() {
  if (!canUseActual) {
    lightboxHint.textContent = "已按原图尺寸显示";
  } else if (isActualSize) {
    lightboxHint.textContent = "原寸 1:1 · 拖拽或滑动细看，点击切回适应屏幕";
  } else {
    lightboxHint.textContent = "点击画面或按钮查看 1:1 原寸细节";
  }
}

function syncLightboxScale() {
  if (!lightbox.open || lightboxStage.classList.contains("is-loading") || !lightboxImage.naturalWidth) return;
  const style = getComputedStyle(lightboxStage);
  const availW = lightboxStage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const availH = lightboxStage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  canUseActual = lightboxImage.naturalWidth > availW * 1.05 || lightboxImage.naturalHeight > availH * 1.05;
  lightboxStage.classList.toggle("can-actual", canUseActual);
  lightboxZoom.hidden = !canUseActual;
  if (!canUseActual && isActualSize) {
    isActualSize = false;
    lightboxStage.classList.remove("is-actual");
  }
  lightboxZoom.setAttribute("aria-pressed", String(isActualSize));
  lightboxZoom.textContent = isActualSize ? "适应屏幕" : "原寸 1:1";
  updateLightboxHint();
}

function preloadAdjacentFrames(work, index) {
  if (!work || work.frames.length < 2) return;
  if (index + 1 < work.frames.length) preloadAsset(work.frames[index + 1][0]);
  if (index - 1 >= 0) preloadAsset(work.frames[index - 1][0]);
}

function syncLightboxFrame() {
  if (!activeWork) return;
  const [name, caption] = activeWork.frames[activeFrame];
  isActualSize = false;
  lightboxStage.classList.remove("is-actual", "can-actual", "is-dragging");
  lightboxStage.scrollTo(0, 0);
  lightboxCaption.textContent = activeWork.title + " · " + caption;
  const multi = activeWork.frames.length > 1;
  lightboxPosition.textContent = multi ? (activeFrame + 1) + " / " + activeWork.frames.length : "";
  lightboxPrev.hidden = !multi;
  lightboxNext.hidden = !multi;
  lightboxPrev.disabled = activeFrame === 0;
  lightboxNext.disabled = activeFrame === activeWork.frames.length - 1;
  lightboxZoom.hidden = true;
  swapImage(lightboxImage, lightboxStage, name, caption, syncLightboxScale);
  preloadAdjacentFrames(activeWork, activeFrame);
}

function openLightbox(trigger) {
  if (!activeWork) return;
  lightboxOpener = trigger;
  syncLightboxFrame();
  lightbox.showModal();
  requestAnimationFrame(syncLightboxScale);
}

function setWorkHash(workId) {
  const target = "#work=" + encodeURIComponent(workId);
  if (location.hash === target) return;
  try {
    history.replaceState(null, "", target);
  } catch {
    // Ignore history restrictions on non-standard protocols
  }
}

function clearWorkHash() {
  if (!location.hash.startsWith("#work=")) return;
  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch {
    // Ignore history restrictions on non-standard protocols
  }
}

function showFrame(index) {
  const [name, caption] = activeWork.frames[index];
  activeFrame = index;
  detailZoom.hidden = true;
  image.classList.remove("is-zoomable");
  byId("detail-caption").textContent = caption;
  byId("detail-position").textContent = (index + 1) + " / " + activeWork.frames.length;
  byId("detail-pager").hidden = activeWork.frames.length < 2;
  previous.disabled = index === 0;
  next.disabled = index === activeWork.frames.length - 1;
  swapImage(image, detailArt, name, caption, syncDetailZoom);
  preloadAdjacentFrames(activeWork, index);
  if (lightbox.open) syncLightboxFrame();
}

function openWork(work, trigger) {
  activeWork = work;
  opener = trigger;
  byId("work-title").textContent = work.title;
  byId("work-category").textContent = work.type;
  byId("work-meta").textContent = work.meta;
  byId("work-note").textContent = work.note;
  const tips = work.tips.map((tip) => {
    const listItem = document.createElement("li");
    listItem.textContent = tip;
    return listItem;
  });
  byId("work-tips").replaceChildren(...tips);
  const source = byId("work-source");
  source.href = work.source;
  let museum;
  try {
    museum = museumNames.get(new URL(work.source).hostname);
  } catch {
    museum = undefined;
  }
  source.textContent = museum ? "查看" + museum + "藏品资料" : "查看馆方资料";
  const extra = byId("work-extra");
  extra.hidden = !work.extra;
  if (work.extra) {
    [extra.textContent, extra.href] = work.extra;
  } else {
    extra.removeAttribute("href");
    extra.textContent = "";
  }
  showFrame(0);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  setWorkHash(work.id);
  requestAnimationFrame(syncDetailZoom);
}

image.addEventListener("click", () => {
  if (isDetailZoomable()) openLightbox(detailZoom);
});
detailZoom.addEventListener("click", () => openLightbox(detailZoom));
lightboxZoom.addEventListener("click", () => setLightboxActual(!isActualSize));
lightboxClose.addEventListener("click", () => lightbox.close());
lightboxPrev.addEventListener("click", () => {
  if (activeFrame > 0) showFrame(activeFrame - 1);
});
lightboxNext.addEventListener("click", () => {
  if (activeWork && activeFrame < activeWork.frames.length - 1) showFrame(activeFrame + 1);
});

let dragState = null;
let suppressClick = false;
lightboxStage.addEventListener("pointerdown", (event) => {
  if (!isActualSize || event.pointerType !== "mouse" || event.button !== 0) return;
  dragState = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    left: lightboxStage.scrollLeft,
    top: lightboxStage.scrollTop,
    moved: false,
  };
  lightboxStage.setPointerCapture(event.pointerId);
});
lightboxStage.addEventListener("pointermove", (event) => {
  if (!dragState || event.pointerId !== dragState.id) return;
  const dx = event.clientX - dragState.x;
  const dy = event.clientY - dragState.y;
  if (!dragState.moved && Math.hypot(dx, dy) > 5) {
    dragState.moved = true;
    lightboxStage.classList.add("is-dragging");
  }
  if (dragState.moved) {
    lightboxStage.scrollLeft = dragState.left - dx;
    lightboxStage.scrollTop = dragState.top - dy;
  }
});
function endDrag(event) {
  if (!dragState || event.pointerId !== dragState.id) return;
  if (dragState.moved) suppressClick = true;
  lightboxStage.classList.remove("is-dragging");
  if (lightboxStage.hasPointerCapture(event.pointerId)) {
    lightboxStage.releasePointerCapture(event.pointerId);
  }
  dragState = null;
}
lightboxStage.addEventListener("pointerup", endDrag);
lightboxStage.addEventListener("pointercancel", endDrag);

lightboxImage.addEventListener("click", (event) => {
  if (suppressClick) {
    suppressClick = false;
    return;
  }
  if (!canUseActual) return;
  if (isActualSize) {
    setLightboxActual(false);
  } else {
    const rect = lightboxImage.getBoundingClientRect();
    const rx = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
    const ry = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
    setLightboxActual(true, { rx, ry });
  }
});

lightboxStage.addEventListener("click", (event) => {
  if (suppressClick) {
    suppressClick = false;
    return;
  }
  if (event.target === lightboxStage && !isActualSize) {
    lightbox.close();
  }
});

lightbox.addEventListener("close", () => {
  isActualSize = false;
  lightboxStage.classList.remove("is-actual", "can-actual", "is-dragging");
  lightboxOpener?.focus({ preventScroll: true });
});

window.addEventListener("resize", () => {
  if (dialog.open) syncDetailZoom();
  if (lightbox.open) syncLightboxScale();
});

document.addEventListener("keydown", (event) => {
  if (!activeWork || activeWork.frames.length < 2) return;
  const canStepLightbox = lightbox.open && !isActualSize;
  const canStepDialog = dialog.open && !lightbox.open;
  if (!canStepLightbox && !canStepDialog) return;
  if (event.key === "ArrowLeft" && activeFrame > 0) {
    event.preventDefault();
    showFrame(activeFrame - 1);
  } else if (event.key === "ArrowRight" && activeFrame < activeWork.frames.length - 1) {
    event.preventDefault();
    showFrame(activeFrame + 1);
  }
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-work]");
  if (!trigger) return;
  const work = works.find((item) => item.id === trigger.dataset.work);
  if (work) openWork(work, trigger);
});
previous.addEventListener("click", () => {
  showFrame(activeFrame - 1);
  if (previous.disabled) next.focus({ preventScroll: true });
});
next.addEventListener("click", () => {
  showFrame(activeFrame + 1);
  if (next.disabled) previous.focus({ preventScroll: true });
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }
});
dialog.addEventListener("close", () => {
  clearWorkHash();
  opener?.focus({ preventScroll: true });
});

function syncWorkFromHash() {
  if (!location.hash.startsWith("#work=")) {
    if (dialog.open) dialog.close();
    return;
  }
  const workId = decodeURIComponent(location.hash.slice(6));
  const work = works.find((item) => item.id === workId);
  if (!work) return;
  if (dialog.open && activeWork?.id === work.id) return;
  const fallbackTrigger = document.querySelector('[data-work="' + work.id + '"]');
  openWork(work, fallbackTrigger);
}
window.addEventListener("hashchange", syncWorkFromHash);
syncWorkFromHash();

const backToTop = byId("back-to-top");
function syncBackToTop() {
  backToTop.hidden = window.scrollY < 600;
}
window.addEventListener("scroll", syncBackToTop, { passive: true });
syncBackToTop();

const navLinks = [...document.querySelectorAll('header nav a[href^="#"]')];
const navSections = navLinks.map((link) => ({
  link,
  section: byId(link.getAttribute("href").slice(1)),
})).filter((entry) => entry.section);

if ("IntersectionObserver" in window && navSections.length) {
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    const current = navSections.find((item) => visible.has(item.section.id));
    navSections.forEach((item) => {
      if (current && item === current) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
  navSections.forEach((item) => observer.observe(item.section));
}
