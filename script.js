(() => {
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(".project-card")];
  const filterStatus = document.querySelector(".filter-status");
  const projectDialog = document.querySelector("#project-dialog");
  const projectDialogContent = document.querySelector("#project-dialog-content");
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxCaption = document.querySelector("#lightbox-caption");
  let lastProjectTrigger = null;
  let lightboxTrigger = null;
  let lightboxItems = [];
  let lightboxIndex = -1;

  function setFilter(filter) {
    let visibleCount = 0;
    cards.forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const filterName = filterButtons.find((button) => button.dataset.filter === filter)?.childNodes[0]?.textContent.trim().toLowerCase() || "all work";
    filterStatus.textContent = filter === "all"
      ? `Showing all ${visibleCount} productions`
      : `Showing ${visibleCount} ${filterName.toLowerCase()} production${visibleCount === 1 ? "" : "s"}`;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  function openProject(projectId, trigger) {
    const template = document.querySelector(`#project-${projectId}`);
    if (!template) return;
    lastProjectTrigger = trigger;
    projectDialogContent.replaceChildren(template.content.cloneNode(true));
    projectDialog.showModal();
    projectDialog.querySelector("[data-close-project]").focus();
  }

  document.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.openProject, button));
  });

  function closeProject() {
    if (!projectDialog.open) return;
    projectDialog.close();
  }

  projectDialog.querySelector("[data-close-project]").addEventListener("click", closeProject);
  projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) closeProject();
  });
  projectDialog.addEventListener("close", () => {
    projectDialogContent.replaceChildren();
    lastProjectTrigger?.focus();
  });

  function readLightboxItems() {
    return [...document.querySelectorAll("[data-lightbox]")]
      .filter((button) => !button.closest("[hidden]"))
      .map((button) => ({
        button,
        src: button.dataset.src || button.querySelector("img")?.currentSrc || button.querySelector("img")?.src,
        alt: button.dataset.alt || button.querySelector("img")?.alt || "Portfolio image",
      }))
      .filter((item) => item.src);
  }

  function showLightboxItem(index) {
    if (!lightboxItems.length) return;
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = `${item.alt} · ${lightboxIndex + 1} / ${lightboxItems.length}`;
  }

  function openLightbox(button) {
    lightboxItems = readLightboxItems();
    lightboxTrigger = button;
    lightboxIndex = lightboxItems.findIndex((item) => item.button === button);
    if (lightboxIndex < 0) return;
    showLightboxItem(lightboxIndex);
    lightbox.showModal();
    lightbox.querySelector("[data-close-lightbox]").focus();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lightbox]");
    if (button) openLightbox(button);
  });

  function closeLightbox() {
    if (!lightbox.open) return;
    lightbox.close();
  }

  lightbox.querySelector("[data-close-lightbox]").addEventListener("click", closeLightbox);
  lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => showLightboxItem(lightboxIndex - 1));
  lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => showLightboxItem(lightboxIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxTrigger?.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showLightboxItem(lightboxIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showLightboxItem(lightboxIndex - 1);
    }
  });
})();
