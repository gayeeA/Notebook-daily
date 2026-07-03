const navigationScriptUrl = document.currentScript?.src || "";

function getNavigationFallbackUrl(url) {
  if (!navigationScriptUrl) return null;

  const fileName = url.split("/").pop();
  return new URL(fileName, new URL("./", navigationScriptUrl)).href;
}

async function loadNavigationComponent(url) {
  const urls = [
    new URL(url, document.baseURI).href,
    getNavigationFallbackUrl(url),
  ].filter(Boolean);

  for (const componentUrl of [...new Set(urls)]) {
    try {
      const res = await fetch(componentUrl, { cache: "no-store" });

      if (res.ok) {
        return await res.text();
      }

      console.error(`Failed to load navigation component: ${componentUrl}`, res.statusText);
    } catch (error) {
      console.error(`Failed to load navigation component: ${componentUrl}`, error);
    }
  }

  return "";
}

async function renderNavigation() {
  const appShell = document.getElementById("appShell");
  const sidebarMount = document.getElementById("sidebarNavigationMount");
  const topNavigationMount = document.getElementById("topNavigationMount");
  const aside = document.querySelector("aside.sidebar");
  const main = document.querySelector("main.main-content");
  const currentEntryCount = document.getElementById("entryCount")?.textContent;
  const currentStreakCount = document.getElementById("streakCount")?.textContent;

  if (sidebarMount) {
    const sidebarHtml = await loadNavigationComponent(sidebarMount.dataset.navigationSrc);
    if (sidebarHtml) {
      sidebarMount.outerHTML = sidebarHtml;
    }
  } else if (aside) {
    const sidebarHtml = await loadNavigationComponent("/sidebar/sidebar-glass.html");
    aside.outerHTML = sidebarHtml || aside.outerHTML;
  } else if (appShell) {
    const sidebarHtml = await loadNavigationComponent("/sidebar/sidebar-glass.html");
    const placeholder = document.createElement("div");
    placeholder.innerHTML = sidebarHtml;
    appShell.insertBefore(placeholder.firstElementChild, appShell.querySelector("main.main-content"));
  }

  if (topNavigationMount) {
    const topNavHtml = await loadNavigationComponent(topNavigationMount.dataset.navigationSrc);
    if (topNavHtml) {
      topNavigationMount.outerHTML = topNavHtml;
    }
  } else if (main && !document.getElementById("topNavComponent")) {
    const topNavHtml = await loadNavigationComponent("/sidebar/top-navigation.html");
    const wrapper = document.createElement("div");
    wrapper.innerHTML = topNavHtml;
    main.prepend(wrapper.firstElementChild);
  }

  const entryCount = document.getElementById("entryCount");
  const streakCount = document.getElementById("streakCount");

  if (entryCount && currentEntryCount) {
    entryCount.textContent = currentEntryCount;
  }

  if (streakCount && currentStreakCount) {
    streakCount.textContent = currentStreakCount;
  }

  updateNavigationActiveState();
}

function updateNavigationActiveState() {
  const pageKey = document.body.dataset.page || "diary";
  const journalKey = document.body.dataset.journal || "personal";

  document
    .querySelectorAll(".nav-item")
    .forEach((link) => {
      link.classList.toggle(
        "active",
        link.dataset.view === pageKey
      );
    });

  document
    .querySelectorAll(".journal-pill")
    .forEach((link) => {
      const isActive = link.dataset.journal === journalKey;
      link.classList.toggle("active", isActive);
    });
}

function patchSafeRootLinks() {
  document.querySelectorAll("a[href='./index.html'], a[href='index.html'], a[href='/index.html']").forEach((anchor) => {
    anchor.href = "/";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  patchSafeRootLinks();
  await renderNavigation();
});
