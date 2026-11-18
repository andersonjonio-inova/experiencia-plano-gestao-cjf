(function () {
  "use strict";
  const data = window.PLANO;
  const byId = (id) => document.getElementById(id);
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function renderPerspectives() {
    const grid = byId("perspective-grid");
    const detail = byId("perspective-detail");
    data.perspectives.forEach(function (item, index) {
      const button = el("button", "perspective-card");
      button.type = "button";
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.dataset.index = String(index);
      button.append(el("span", "perspective-number", item.number));
      button.append(el("strong", "", item.title));
      button.append(el("span", "perspective-description", item.description));
      button.append(el("span", "perspective-prompt", item.question));
      button.addEventListener("click", function () {
        grid.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        button.setAttribute("aria-pressed", "true");
        detail.replaceChildren();
        detail.append(el("h3", "", item.title));
        const list = el("ul", "axis-list");
        item.axes.forEach(function (axis) { list.append(el("li", "", axis)); });
        detail.append(list);
      });
      grid.append(button);
    });
    grid.querySelector("button").click();
  }
  function renderAxes() {
    const tabs = byId("axis-tabs");
    const panel = byId("axis-panel");
    function show(index, focus) {
      const item = data.axes[index];
      Array.from(tabs.querySelectorAll('[role="tab"]')).forEach(function (tab, i) {
        const selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });
      panel.replaceChildren();
      const top = el("div", "axis-panel-top");
      top.append(el("span", "axis-number", "EIXO " + item.number));
      top.append(el("span", "axis-perspective", item.perspective));
      panel.append(top, el("h3", "", item.title), el("p", "axis-purpose", item.purpose), el("h4", "", "Ações prioritárias no plano"));
      const list = el("div", "action-grid");
      item.actions.forEach(function (action) {
        const card = el("article", "action-card");
        card.append(el("h5", "", action[0]), el("p", "", action[1]));
        list.append(card);
      });
      panel.append(list);
      panel.setAttribute("aria-labelledby", "tab-" + item.id);
    }
    data.axes.forEach(function (item, index) {
      const tab = el("button", "axis-tab", item.number);
      tab.type = "button";
      tab.id = "tab-" + item.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "axis-panel");
      tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.setAttribute("aria-label", "Eixo " + item.number + ": " + item.title);
      tab.addEventListener("click", function () { show(index, false); });
      tab.addEventListener("keydown", function (event) {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % data.axes.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + data.axes.length) % data.axes.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = data.axes.length - 1;
        else return;
        event.preventDefault();
        show(next, true);
      });
      tabs.append(tab);
    });
    show(0, false);
  }
  function renderSupport() {
    const grid = byId("support-grid");
    data.support.forEach(function (item) {
      const article = el("article", "support-card");
      article.append(el("span", "support-number", item.number), el("h3", "", item.title), el("p", "", item.summary));
      if (item.items.length) {
        const list = el("ul", "support-list");
        item.items.forEach(function (entry) {
          const li = el("li");
          li.append(el("strong", "", entry[0] + " "), document.createTextNode(entry[1]));
          list.append(li);
        });
        article.append(list);
      }
      grid.append(article);
    });
  }
  function renderCulture() {
    const grid = byId("culture-activities");
    data.culture.forEach(function (item, index) {
      const article = el("article", "culture-item");
      article.append(el("span", "culture-index", String(index + 1).padStart(2, "0")), el("h3", "", item[0]), el("p", "", item[1]));
      grid.append(article);
    });
  }
  function renderScenario() {
    const options = byId("scenario-options");
    const feedback = byId("scenario-feedback");
    data.scenario.forEach(function (item) {
      const button = el("button", "scenario-option", item.label);
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        feedback.hidden = false;
        feedback.classList.toggle("feedback-correct", item.correct);
        feedback.classList.toggle("feedback-review", !item.correct);
        feedback.textContent = item.feedback;
        options.querySelectorAll("button").forEach(function (choice) { choice.setAttribute("aria-pressed", choice === button ? "true" : "false"); });
      });
      options.append(button);
    });
  }
  function observeProgress() {
    const sections = Array.from(document.querySelectorAll(".observe-section"));
    const progress = byId("page-progress");
    const label = byId("progress-label");
    const navLinks = Array.from(document.querySelectorAll(".main-nav a"));
    const names = {inicio:"Início", mapa:"Mapa estratégico", eixos:"Seis eixos", sustentacao:"Pilar de sustentação", cultura:"Cultura institucional", atividade:"Prática de leitura", fechamento:"Considerações finais"};
    const update = function () {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
      progress.value = value;
      progress.setAttribute("aria-valuetext", value + "% percorrido");
    };
    update();
    window.addEventListener("scroll", update, {passive:true});
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          label.textContent = names[entry.target.id] || "Percurso";
          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, {rootMargin:"-24% 0px -66% 0px"});
      sections.forEach(function (section) { observer.observe(section); });
    }
  }
  const menuButton = document.querySelector(".menu-toggle");
  const nav = byId("main-nav");
  menuButton.addEventListener("click", function () {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("nav-open", !expanded);
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      nav.classList.remove("nav-open");
    }
  });
  renderPerspectives();
  renderAxes();
  renderSupport();
  renderCulture();
  renderScenario();
  observeProgress();
}());
