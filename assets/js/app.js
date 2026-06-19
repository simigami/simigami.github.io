(function () {
  "use strict";

  const topnav = document.querySelector(".topnav");
  const sidenav = document.querySelector(".sidenav");
  const overlay = document.querySelector(".sidenav-overlay");
  const menuBtn = document.querySelector(".topnav__menu-btn");
  const tocLinks = document.querySelectorAll(".toc__link");
  const sidenavLinks = document.querySelectorAll(".sidenav__link[href^='#']");
  const sections = document.querySelectorAll("[data-section]");

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

  menuBtn?.addEventListener("click", () => {
    if (sidenav?.classList.contains("is-open")) {
      closeSidenav();
    } else {
      openSidenav();
    }
  });

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

  sidenavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sidenavLinks.forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("is-active", href === `#${id}`);
        });
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

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
