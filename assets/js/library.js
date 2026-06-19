(function () {
  "use strict";

  const searchInput = document.querySelector("#library-search");
  const tagList = document.querySelector("#library-tag-list");
  const resultRoot = document.querySelector("#library-result");
  const emptyState = document.querySelector("#library-empty");
  const activeFilter = document.querySelector("#library-active-filter");

  let taxonomy = { tags: [], documents: [] };
  let selectedTag = window.location.hash.replace("#", "").trim();
  let keyword = "";

  function normalize(text) {
    return (text || "").toLowerCase();
  }

  function matchDocument(doc) {
    const byTag = !selectedTag || doc.tags.includes(selectedTag);
    const byKeyword =
      !keyword ||
      normalize(doc.title).includes(keyword) ||
      normalize(doc.summary).includes(keyword) ||
      doc.tags.some((tag) => normalize(tag).includes(keyword));
    return byTag && byKeyword;
  }

  function renderTags() {
    const tags = taxonomy.tags || [];
    tagList.replaceChildren();

    const allLi = document.createElement("li");
    const allBtn = document.createElement("button");
    allBtn.className = "chip chip--link";
    allBtn.type = "button";
    allBtn.textContent = "All";
    allBtn.addEventListener("click", () => {
      selectedTag = "";
      window.history.replaceState({}, "", "/library.html");
      render();
    });
    allLi.appendChild(allBtn);
    tagList.appendChild(allLi);

    tags.forEach((tag) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const level = document.createElement("span");
      a.className = "chip chip--link";
      a.href = `#${tag.id}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = tag.name;
      level.className = "chip__level";
      level.textContent = `Lv.${tag.level}`;
      a.appendChild(level);
      li.appendChild(a);
      tagList.appendChild(li);
    });
  }

  function renderResults() {
    const tagMap = new Map((taxonomy.tags || []).map((tag) => [tag.id, tag]));
    const docs = (taxonomy.documents || []).filter(matchDocument);
    resultRoot.replaceChildren();

    docs.forEach((doc) => {
      const card = document.createElement("article");
      const title = document.createElement("h2");
      const titleLink = document.createElement("a");
      const meta = document.createElement("div");
      const summary = document.createElement("p");
      const chips = document.createElement("ul");

      card.className = "library-card";
      title.className = "library-card__title";
      titleLink.href = `/${doc.path}`;
      titleLink.target = "_blank";
      titleLink.rel = "noopener noreferrer";
      titleLink.textContent = doc.title;
      title.appendChild(titleLink);
      meta.className = "library-card__meta";
      meta.textContent = `${doc.path} · Lv.${doc.level}`;
      summary.className = "library-card__summary";
      summary.textContent = doc.summary;
      chips.className = "chip-list";

      doc.tags.forEach((tagId) => {
        const tag = tagMap.get(tagId);
        if (!tag) return;
        const li = document.createElement("li");
        const a = document.createElement("a");
        const level = document.createElement("span");
        a.className = "chip chip--link";
        a.href = `#${tag.id}`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = tag.name;
        level.className = "chip__level";
        level.textContent = `Lv.${tag.level}`;
        a.appendChild(level);
        li.appendChild(a);
        chips.appendChild(li);
      });

      card.append(title, meta, summary, chips);
      resultRoot.appendChild(card);
    });

    emptyState.hidden = docs.length > 0;
  }

  function renderActiveFilter() {
    if (!selectedTag) {
      activeFilter.textContent = "선택된 태그: 없음";
      return;
    }
    const tag = (taxonomy.tags || []).find((item) => item.id === selectedTag);
    activeFilter.textContent = tag
      ? `선택된 태그: ${tag.name} (Lv.${tag.level})`
      : `선택된 태그: ${selectedTag}`;
  }

  function render() {
    renderTags();
    renderActiveFilter();
    renderResults();
  }

  async function init() {
    const response = await fetch("/assets/data/wiki-taxonomy.json");
    if (!response.ok) return;
    taxonomy = await response.json();
    render();
  }

  window.addEventListener("hashchange", () => {
    selectedTag = window.location.hash.replace("#", "").trim();
    render();
  });

  searchInput?.addEventListener("input", () => {
    keyword = normalize(searchInput.value.trim());
    renderResults();
  });

  init().catch(console.error);
})();
