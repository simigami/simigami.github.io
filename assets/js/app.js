(function () {
  "use strict";

  const wikiBase = document.body.getAttribute("data-wiki-base") ?? "";
  const topnav = document.querySelector(".topnav");
  const sidenav = document.querySelector(".sidenav");
  const overlay = document.querySelector(".sidenav-overlay");
  let menuBtn = document.querySelector(".topnav__menu-btn");
  let tocLinks = document.querySelectorAll(".toc__link");
  let sidenavLinks = document.querySelectorAll(".sidenav__link[href^='#']");
  const sections = document.querySelectorAll("[data-section]");
  const documentTagList = document.querySelector("#document-tag-list");
  const documentLevelBadge = document.querySelector("#doc-level-badge");
  const algorithmIndexBody = document.querySelector("#algorithm-index-body");
  const currentDocumentId = document.querySelector("[data-document-id]")?.getAttribute("data-document-id");

  window.addEventListener("scroll", () => {
    topnav?.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });

  function closeSidenav() {
    sidenav?.classList.remove("is-open");
    overlay?.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  function openSidenav() {
    sidenav?.classList.add("is-open");
    overlay?.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function bindMenuButton() {
    menuBtn = document.querySelector(".topnav__menu-btn");
    menuBtn?.addEventListener("click", () => {
      if (sidenav?.classList.contains("is-open")) {
        closeSidenav();
      } else {
        openSidenav();
      }
    });
  }

  bindMenuButton();
  overlay?.addEventListener("click", closeSidenav);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      if (window.innerWidth < 768) closeSidenav();
    });
  });

  function bindSidenavLinks() {
    sidenavLinks = document.querySelectorAll(".sidenav__link[href^='#']");
    sidenavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        sidenavLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      });
    });
  }

  bindSidenavLinks();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks = document.querySelectorAll(".toc__link");
        tocLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("is-active", href === `#${id}`);
        });
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

  window.addEventListener("wiki-layout-ready", () => {
    bindMenuButton();
    bindSidenavLinks();
    tocLinks = document.querySelectorAll(".toc__link");
  });

  if (window.__wikiLayoutReady) {
    bindMenuButton();
    bindSidenavLinks();
    tocLinks = document.querySelectorAll(".toc__link");
  }

  async function loadTaxonomy() {
    if (!currentDocumentId && !algorithmIndexBody) return;
    try {
      const response = await fetch(`${wikiBase}assets/data/wiki-taxonomy.json`);
      if (!response.ok) throw new Error("taxonomy load failed");
      const taxonomy = await response.json();
      const tagMap = new Map((taxonomy.tags || []).map((tag) => [tag.id, tag]));
      const docMap = new Map((taxonomy.documents || []).map((doc) => [doc.id, doc]));

      if (algorithmIndexBody) {
        renderAlgorithmIndex(taxonomy, docMap);
      }

      if (!currentDocumentId || !documentTagList) return;
      const doc = docMap.get(currentDocumentId);
      if (!doc) return;

      if (documentLevelBadge) {
        documentLevelBadge.textContent = `Lv. ${doc.level}`;
      }

      const renderTag = (tagId) => {
        const tag = tagMap.get(tagId);
        if (!tag) return null;
        const li = document.createElement("li");
        const link = document.createElement("a");
        const level = document.createElement("span");
        link.className = "chip chip--link";
        link.href = `${wikiBase}library.html#${tag.id}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = tag.name;
        link.setAttribute("aria-label", `${tag.name} 태그 문서 보기`);
        level.className = "chip__level";
        level.textContent = `Lv.${tag.level}`;
        link.appendChild(level);
        li.appendChild(link);
        return li;
      };

      documentTagList.replaceChildren();
      (doc.tags || []).forEach((tagId) => {
        const metaChip = renderTag(tagId);
        if (metaChip) documentTagList.appendChild(metaChip);
      });
    } catch (error) {
      console.error(error);
    }
  }

  function renderAlgorithmIndex(taxonomy, docMap) {
    const overview = docMap.get("algorithms-overview");
    const entryIds = overview?.indexEntries || [];
    algorithmIndexBody.replaceChildren();

    entryIds.forEach((docId) => {
      const doc = docMap.get(docId);
      if (!doc) return;

      const row = document.createElement("tr");
      const titleCell = document.createElement("td");
      const categoryCell = document.createElement("td");
      const timeCell = document.createElement("td");
      const spaceCell = document.createElement("td");
      const summaryCell = document.createElement("td");
      const actionCell = document.createElement("td");

      const titleLink = document.createElement("a");
      titleLink.className = "doc-table__title";
      titleLink.href = `./${doc.path.split("/").pop()}`;
      titleLink.textContent = doc.title;

      titleCell.appendChild(titleLink);
      categoryCell.textContent = doc.index?.category || "—";
      categoryCell.className = "doc-table__category";

      const time = document.createElement("code");
      time.className = "doc-table__mono";
      time.textContent = doc.index?.timeComplexity || "—";
      timeCell.appendChild(time);

      const space = document.createElement("code");
      space.className = "doc-table__mono";
      space.textContent = doc.index?.spaceComplexity || "—";
      spaceCell.appendChild(space);

      summaryCell.className = "doc-table__summary";
      summaryCell.textContent = doc.summary || "";

      const actionLink = document.createElement("a");
      actionLink.className = "doc-table__action";
      actionLink.href = `./${doc.path.split("/").pop()}`;
      actionLink.setAttribute("aria-label", `${doc.title} 문서 열기`);
      actionLink.innerHTML = '<span class="material-symbols-outlined">arrow_forward</span>';
      actionCell.appendChild(actionLink);

      row.append(titleCell, categoryCell, timeCell, spaceCell, summaryCell, actionCell);
      algorithmIndexBody.appendChild(row);
    });
  }

  loadTaxonomy();

  document.querySelectorAll(".code-block__copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const code = btn.closest(".code-block")?.querySelector("code");
      if (!code) return;
      const icon = btn.querySelector(".material-symbols-outlined");
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        if (icon) icon.textContent = "check";
        setTimeout(() => { if (icon) icon.textContent = "content_copy"; }, 2000);
      } catch {
        if (icon) icon.textContent = "error";
        setTimeout(() => { if (icon) icon.textContent = "content_copy"; }, 2000);
      }
    });
  });

  const searchInput = document.querySelector(".topnav__search-input");
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()) {
      const q = encodeURIComponent(searchInput.value.trim());
      window.open(`https://www.google.com/search?q=site:simigami.github.io+${q}`, "_blank");
    }
  });

  window.Wiki = {
    loadPage(path) {
      return fetch(path)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${path}`);
          return res.text();
        })
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const main = doc.querySelector("[data-wiki-content]");
          const target = document.querySelector("[data-wiki-content]");
          if (main && target) {
            target.innerHTML = main.innerHTML;
            document.title = doc.title || document.title;
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
    },
  };
})();
