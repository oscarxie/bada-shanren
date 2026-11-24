const asset = (name) => "assets/" + name + ".webp";
const byId = (id) => document.getElementById(id);
const museumNames = new Map([
  ["www.dpm.org.cn", "北京故宫博物院"],
  ["www.shanghaimuseum.cn", "上海博物馆"],
  ["www.tjbwg.cn", "天津博物馆"],
  ["www.metmuseum.org", "大都会艺术博物馆"],
  ["www.bdsrjng.cn", "八大山人纪念馆"],
]);

const lookButtons = [...document.querySelectorAll("[data-look]")];
lookButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    lookButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    const [name, caption] = lotusFrames[index];
    const [title, story] = looking[index];
    byId("look-image").src = asset(name);
    byId("look-image").alt = caption;
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
    image.src = asset(work.cover);
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

filters.forEach((button) => button.addEventListener("click", () => {
  filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  showWorks(button.dataset.filter);
}));
showWorks("全部");

const dialog = byId("work-dialog");
const image = byId("detail-image");
const previous = byId("detail-prev");
const next = byId("detail-next");
let activeWork;
let activeFrame = 0;
let opener;

function showFrame(index) {
  const [name, caption] = activeWork.frames[index];
  activeFrame = index;
  image.src = asset(name);
  image.alt = caption;
  byId("detail-caption").textContent = caption;
  byId("detail-position").textContent = (index + 1) + " / " + activeWork.frames.length;
  byId("detail-pager").hidden = activeWork.frames.length < 2;
  previous.disabled = index === 0;
  next.disabled = index === activeWork.frames.length - 1;
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
  const museum = museumNames.get(new URL(work.source).hostname);
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
  dialog.showModal();
  dialog.scrollTop = 0;
}
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
dialog.addEventListener("close", () => opener?.focus({ preventScroll: true }));
