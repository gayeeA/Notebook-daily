/* ==========================================================
   MYDIARY V3
   JOURNAL NOTES (per-dashboard quick notes)
   modules/journal-notes.js
========================================================== */

(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function getJournalNotesKey(journal) {
    return `mydiary_${journal}_quick_notes`;
  }

  function loadQuickNotes(journal) {
    try {
      return JSON.parse(localStorage.getItem(getJournalNotesKey(journal)) || "[]");
    } catch {
      return [];
    }
  }

  function saveQuickNotes(journal, notes) {
    localStorage.setItem(getJournalNotesKey(journal), JSON.stringify(notes));
  }

  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  function truncateText(text, max) {
    const t = text || "";
    if (t.length <= max) return t;
    return t.substring(0, max) + "...";
  }

  function renderNotesBox(root, journal) {
    const feed = qs(".journal-notes-feed", root);
    const searchInput = qs(".journal-note-search", root);
    const emptyEl = qs(".journal-notes-empty", root);

    if (!feed) return;

    const allNotes = loadQuickNotes(journal);
    const query = (searchInput?.value || "").toLowerCase().trim();

    const filtered = !query
      ? allNotes
      : allNotes.filter((n) => {
          const t = `${n.title || ""}\n${n.content || ""}`.toLowerCase();
          return t.includes(query);
        });

    feed.innerHTML = "";

    if (filtered.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    filtered
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((note) => {
        const card = document.createElement("div");
        card.className = "dashboard-card";
        card.style.marginBottom = "14px";
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <div style="font-weight:800;font-size:1.05rem;margin-bottom:6px;">${escapeHTML(
                note.title || "Untitled"
              )}</div>
              <div style="color:#64748b;font-size:0.85rem;margin-bottom:10px;">${escapeHTML(
                formatDate(note.createdAt)
              )}</div>
            </div>
            <button class="action-btn journal-note-delete" data-id="${escapeHTML(
              String(note.id)
            )}" title="Delete">🗑</button>
          </div>
          <div style="color:#555;line-height:1.7;">${escapeHTML(
            truncateText(note.content, 220)
          )}</div>
          <button class="action-btn journal-note-open" data-id="${escapeHTML(
            String(note.id)
          )}" style="margin-top:10px;font-weight:700;">Read more</button>
        `;

        feed.appendChild(card);

        qs(".journal-note-delete", card)?.addEventListener("click", () => {
          if (!confirm("Delete this note?")) return;
          const notes = loadQuickNotes(journal);
          const next = notes.filter((n) => String(n.id) !== String(note.id));
          saveQuickNotes(journal, next);
          renderNotesBox(root, journal);
        });

        qs(".journal-note-open", card)?.addEventListener("click", () => {
          const modal = document.getElementById("memoryModal");
          const body = document.getElementById("modalBody");
          const closeBtn = document.getElementById("closeModal");

          if (modal && body) {
            body.innerHTML = `
              <h1 style="margin-bottom:10px;">${escapeHTML(
                note.title || "Untitled"
              )}</h1>
              <p style="color:#888;margin-bottom:20px;">${escapeHTML(
                formatDate(note.createdAt)
              )}</p>
              <div style="white-space:pre-wrap;line-height:1.8;">${escapeHTML(
                note.content || ""
              )}</div>
            `;
            modal.classList.add("show");
            closeBtn && closeBtn.addEventListener("click", () => modal.classList.remove("show"), { once: true });
            modal.addEventListener(
              "click",
              (e) => {
                if (e.target === modal) modal.classList.remove("show");
              },
              { once: true }
            );
          } else {
            alert(`${note.title || "Untitled"}\n\n${note.content || ""}`);
          }
        });
      });
  }

  function bindPage(root) {
    const journal = root.dataset.journalNotes;
    if (!journal) return;

    const titleInput = qs(".journal-note-title", root);
    const contentArea = qs(".journal-note-content", root);
    const saveBtn = qs(".journal-note-save", root);
    const clearBtn = qs(".journal-note-clear", root);

    renderNotesBox(root, journal);

    qs(".journal-note-search", root)?.addEventListener("input", () => {
      renderNotesBox(root, journal);
    });

    saveBtn?.addEventListener("click", () => {
      const title = (titleInput?.value || "").trim();
      const content = (contentArea?.value || "").trim();

      if (!content) {
        alert("Write something in the note.");
        return;
      }

      const notes = loadQuickNotes(journal);
      notes.push({
        id: Date.now() + "_" + Math.random().toString(36).slice(2),
        title: title || "Untitled",
        content,
        createdAt: new Date().toISOString(),
      });
      saveQuickNotes(journal, notes);

      if (titleInput) titleInput.value = "";
      if (contentArea) contentArea.value = "";

      renderNotesBox(root, journal);
    });

    clearBtn?.addEventListener("click", () => {
      if (titleInput) titleInput.value = "";
      if (contentArea) contentArea.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    qsa("[data-journal-notes]").forEach((root) => bindPage(root));
  });

  window.MyDiaryJournalNotes = {
    renderNotesBox,
  };
})();

