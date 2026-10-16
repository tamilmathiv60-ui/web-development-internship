"use strict";

/* =========================================================
   TAMIL MATHI V. — PORTFOLIO INTERACTIONS
   Vanilla JavaScript. No libraries required.
   ========================================================= */

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-link");
  const yearElement = document.getElementById("current-year");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* 1. AUTOMATIC FOOTER YEAR */

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  /* 2. MOBILE NAVIGATION */

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
    navLinks.classList.add("is-open");
    document.body.classList.add("menu-open");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isExpanded =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close the menu after navigating to a section.
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close the menu with the Escape key.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const wasOpen =
          menuToggle.getAttribute("aria-expanded") === "true";

        closeMenu();

        if (wasOpen && window.innerWidth <= 720) {
          menuToggle.focus();
        }
      }
    });

    // Reset menu state when returning to desktop width.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) {
        closeMenu();
      }
    });

    // Close when clicking outside the open navigation.
    document.addEventListener("click", (event) => {
      const isExpanded =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (
        isExpanded &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  /* 3. ACTIVE SECTION NAVIGATION */

  const sections = Array.from(
    document.querySelectorAll("main section[id]")
  );

  function setActiveLink(sectionId) {
    navItems.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      if (isActive) {
        link.classList.add("active");
        link.setAttribute("aria-current", "location");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleSections.length > 0) {
          setActiveLink(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  } else if (sections.length > 0) {
    // Fallback for browsers without IntersectionObserver.
    window.addEventListener(
      "scroll",
      () => {
        let currentSection = sections[0];

        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= 160) {
            currentSection = section;
          }
        });

        setActiveLink(currentSection.id);
      },
      { passive: true }
    );
  }

  /* 4. SUBTLE SCROLL REVEALS */

  const revealSelectors = [
    ".about-grid",
    ".about-strip",
    ".section-intro",
    ".skill-card",
    ".learning-note",
    ".project-card",
    ".github-note",
    ".contact-main",
    ".contact-details"
  ];

  const revealElements = document.querySelectorAll(
    revealSelectors.join(", ")
  );

  if (
    !reducedMotion &&
    "IntersectionObserver" in window
  ) {
    revealElements.forEach((element) => {
      element.classList.add("reveal");
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /* 5. INTERNAL LINK FALLBACK */

  // Ensure the home link and other section links work normally.
  // No click interception is needed; the browser handles anchors.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.getElementById(targetId.slice(1));

      if (target) {
        target.setAttribute("tabindex", "-1");

        target.addEventListener(
          "blur",
          () => {
            target.removeAttribute("tabindex");
          },
          { once: true }
        );
      }
    });
  });
});
