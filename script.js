"use strict";

document.documentElement.classList.replace("no-js", "js");

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-link");
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function closeMenu() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute(
        "aria-label",
        open ? "Open navigation menu" : "Close navigation menu"
      );

      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const wasOpen = toggle.getAttribute("aria-expanded") === "true";
        closeMenu();
        if (wasOpen) toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        toggle.getAttribute("aria-expanded") === "true" &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  const sections = document.querySelectorAll("main section[id]");

  function updateActiveLink(id) {
    navItems.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length) updateActiveLink(visible[0].target.id);
    }, {
      rootMargin: "-18% 0px -60% 0px",
      threshold: [0, 0.1, 0.25, 0.5]
    });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const elements = document.querySelectorAll(
      ".about-grid, .about-strip, .section-intro, " +
      ".skill-card, .learning-note, .project-card, " +
      ".github-note, .contact-main, .contact-details"
    );

    elements.forEach((element) => element.classList.add("reveal"));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => revealObserver.observe(element));
  }
});
