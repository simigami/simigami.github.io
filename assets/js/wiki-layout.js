(function () {

  "use strict";



  const body = document.body;

  if (!body.hasAttribute("data-wiki-layout")) return;



  const base = body.getAttribute("data-wiki-base") || "";

  const activeTab = body.getAttribute("data-wiki-active-tab") || "documentation";

  const currentDocId = document.querySelector("[data-document-id]")?.getAttribute("data-document-id") || "";



  function tabClass(tab) {

    return `topnav__tab${tab === activeTab ? " is-active" : ""}`;

  }



  function fixedNavActive(page) {

    const path = window.location.pathname;

    if (page === "home") {

      return path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("\\index.html");

    }

    if (page === "guide") return path.includes("documentation.html");

    if (page === "library") return path.includes("library.html");

    return false;

  }



  function depthPadding(depth) {

    return 12 + Math.max(0, depth - 1) * 16;

  }



  function subtreeContainsDoc(node, docId) {

    if (!docId) return false;

    if (node.documentId === docId) return true;

    return (node.children || []).some((child) => subtreeContainsDoc(child, docId));

  }



  function nodeLabelHref(node, docMap) {

    if (node.documentId) {

      const doc = docMap.get(node.documentId);

      if (doc) return `${base}${doc.path}`;

    }

    if (node.tagId) return `${base}library.html#${node.tagId}`;

    return null;

  }



  function renderTreeNodes(nodes, depth, docMap) {

    return nodes

      .map((node) => {

        if (node.children?.length) {

          const expanded = subtreeContainsDoc(node, currentDocId);

          const href = nodeLabelHref(node, docMap);

          const isBranchActive = node.documentId === currentDocId;
          const labelClass = `sidenav__tree-label${href ? "" : " sidenav__tree-label--static"}${isBranchActive ? " is-active" : ""}`;

          const labelHtml = href

            ? `<a class="${labelClass}" href="${href}">${node.label}</a>`

            : `<span class="${labelClass}">${node.label}</span>`;



          return `

            <li class="sidenav__tree-branch">

              <div class="sidenav__tree-row" style="padding-left: ${depthPadding(depth)}px">

                <button type="button" class="sidenav__tree-toggle" aria-expanded="${expanded}" aria-label="${node.label} 하위 목록 ${expanded ? "접기" : "펼치기"}">

                  <span class="material-symbols-outlined sidenav__tree-chevron${expanded ? " is-expanded" : ""}">chevron_right</span>

                </button>

                ${labelHtml}

              </div>

              <ul class="sidenav__tree-children"${expanded ? "" : " hidden"}>

                ${renderTreeNodes(node.children, depth + 1, docMap)}

              </ul>

            </li>`;

        }



        const doc = docMap.get(node.documentId);

        if (!doc) return "";



        const label = node.label || doc.title;

        const isActive = currentDocId === node.documentId;



        return `

          <li class="sidenav__tree-leaf">

            <div class="sidenav__tree-row sidenav__tree-row--leaf" style="padding-left: ${depthPadding(depth)}px">

              <span class="sidenav__tree-spacer" aria-hidden="true"></span>

              <a class="sidenav__tree-label sidenav__tree-label--doc${isActive ? " is-active" : ""}" href="${base}${doc.path}">${label}</a>

            </div>

          </li>`;

      })

      .join("");

  }



  function bindTreeToggles() {

    document.querySelectorAll(".sidenav__tree-toggle").forEach((btn) => {

      btn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();



        const expanded = btn.getAttribute("aria-expanded") === "true";

        const branch = btn.closest(".sidenav__tree-branch");

        const children = branch?.querySelector(":scope > .sidenav__tree-children");

        const chevron = btn.querySelector(".sidenav__tree-chevron");

        const label = branch?.querySelector(".sidenav__tree-label, .sidenav__tree-label--static")?.textContent?.trim() || "목록";

        const nextExpanded = !expanded;



        btn.setAttribute("aria-expanded", String(nextExpanded));

        btn.setAttribute("aria-label", `${label} 하위 목록 ${nextExpanded ? "접기" : "펼치기"}`);

        chevron?.classList.toggle("is-expanded", nextExpanded);

        if (children) children.hidden = !nextExpanded;

      });

    });

  }



  function renderSidenav(taxonomy) {

    const el = document.querySelector('[data-wiki-inject="sidenav"]');

    if (!el) return;



    const docMap = new Map((taxonomy.documents || []).map((doc) => [doc.id, doc]));

    const treeHtml = renderTreeNodes(taxonomy.navTree || [], 1, docMap);

    const treeSection = treeHtml

      ? `<li class="sidenav__tree-divider" aria-hidden="true"></li>${treeHtml}`

      : "";



    el.innerHTML = `

      <div class="sidenav__header">

        <div class="sidenav__label">Documentation</div>

        <div class="sidenav__version">V1.0.0-STABLE</div>

      </div>

      <nav>

        <ul class="sidenav__nav">

          <li>

            <a class="sidenav__link${fixedNavActive("home") ? " is-active" : ""}" href="${base}index.html">

              <span class="material-symbols-outlined${fixedNavActive("home") ? " is-filled" : ""}">home</span>

              <span>Home</span>

            </a>

          </li>

          <li>

            <a class="sidenav__link${fixedNavActive("guide") ? " is-active" : ""}" href="${base}documentation.html">

              <span class="material-symbols-outlined${fixedNavActive("guide") ? " is-filled" : ""}">menu_book</span>

              <span>WikiGuide</span>

            </a>

          </li>

          <li>

            <a class="sidenav__link${fixedNavActive("library") ? " is-active" : ""}" href="${base}library.html">

              <span class="material-symbols-outlined${fixedNavActive("library") ? " is-filled" : ""}">library_books</span>

              <span>Library</span>

            </a>

          </li>

          ${treeSection}

        </ul>

      </nav>`;



    bindTreeToggles();

  }



  function renderFooter() {

    const el = document.querySelector('[data-wiki-inject="footer"]');

    if (!el) return;



    el.innerHTML = `

      <div>

        <div class="site-footer__brand">simigami</div>

        <p class="site-footer__copy">&copy; 2026 simigami Study Wiki. All rights reserved.</p>

      </div>

      <ul class="site-footer__links">

        <li><a href="https://github.com/simigami/simigami.github.io" target="_blank" rel="noopener noreferrer">GitHub</a></li>

        <li><a href="${base}documentation.html">Documentation</a></li>

        <li><a href="${base}library.html">Library</a></li>

        <li><a href="#">Changelog</a></li>

      </ul>`;

  }



  function renderToc() {

    const el = document.querySelector('[data-wiki-inject="toc"]');

    if (!el) return;



    const sections = [...document.querySelectorAll("[data-section]")];

    if (sections.length === 0) {

      el.remove();

      document.querySelector(".doc-layout")?.classList.add("doc-layout--no-toc");

      return;

    }



    const links = sections

      .map((section, i) => {

        const title = section.querySelector(".section__title");

        const num = title?.querySelector(".section__num")?.textContent?.trim() || "";

        const label = title?.textContent.replace(num, "").trim() || section.id;

        const active = i === 0 ? " is-active" : "";

        const dot = i === 0 ? '<span class="toc__dot"></span> ' : "";

        return `<li><a class="toc__link${active}" href="#${section.id}">${dot}${num} ${label}</a></li>`;

      })

      .join("");



    el.innerHTML = `

      <div class="toc__label">On This Page</div>

      <nav><ul class="toc__list">${links}</ul></nav>`;

  }



  function patchTopnav() {

    const tabs = document.querySelector(".topnav__tabs");

    if (!tabs) return;



    tabs.innerHTML = `

      <li><a class="${tabClass("library")}" href="${base}library.html">Library</a></li>

      <li><a class="${tabClass("documentation")}" href="${base}documentation.html">Documentation</a></li>

      <li><a class="${tabClass("research")}" href="#">Research</a></li>`;



    const right = document.querySelector(".topnav__right");

    if (right && !right.querySelector(".topnav__search")) {

      right.insertAdjacentHTML(

        "afterbegin",

        `<div class="topnav__search">

          <span class="material-symbols-outlined topnav__search-icon">search</span>

          <input class="topnav__search-input" type="search" placeholder="Search documentation..." aria-label="문서 검색">

        </div>`

      );

    }



    if (right && !right.querySelector(".topnav__menu-btn")) {

      right.insertAdjacentHTML(

        "beforeend",

        `<button class="topnav__menu-btn" type="button" aria-label="메뉴 열기">

          <span class="material-symbols-outlined">menu</span>

          Menu

        </button>`

      );

    }

  }



  async function init() {

    let taxonomy = { navTree: [], documents: [] };

    try {

      const response = await fetch(`${base}assets/data/wiki-taxonomy.json`);

      if (response.ok) taxonomy = await response.json();

    } catch (error) {

      console.error(error);

    }



    renderSidenav(taxonomy);

    renderFooter();

    renderToc();

    patchTopnav();

    window.__wikiLayoutReady = true;

    window.dispatchEvent(new Event("wiki-layout-ready"));

  }



  init();

})();

