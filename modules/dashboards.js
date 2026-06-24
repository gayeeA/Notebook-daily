/* ==========================================================
   MYDIARY V3
   DASHBOARDS MODULE
   modules/dashboards.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   JOURNAL CONFIG
========================================================== */

const JOURNALS = {

    personal: {
        title: "🌸 Personal Diary",
        subtitle: "Capture memories beautifully",
        theme: "personal-theme"
    },

    work: {
        title: "💼 Work Dashboard",
        subtitle: "Professional productivity workspace",
        theme: "work-theme"
    },

    travel: {
        title: "✈️ Travel Journal",
        subtitle: "Every destination tells a story",
        theme: "travel-theme"
    },

    study: {
        title: "📚 Study Notes",
        subtitle: "Learning & growth hub",
        theme: "study-theme"
    },

    dream: {
        title: "🌙 Dream Journal",
        subtitle: "Track dreams and reflections",
        theme: "dream-theme"
    }

};

/* ==========================================================
   ACTIVE JOURNAL
========================================================== */

let activeJournal =
    localStorage.getItem(
        "activeJournal"
    ) || "personal";

/* ==========================================================
   HELPERS
========================================================== */

function saveJournal(name) {

    activeJournal = name;

    localStorage.setItem(
        "activeJournal",
        name
    );

}

function getEntries() {

    return JSON.parse(
        localStorage.getItem(
            "myDiaryEntries"
        ) || "[]"
    );

}

function getJournalEntries(
    journal
) {

    return getEntries().filter(
        entry =>
        entry.journal === journal
    );

}

/* ==========================================================
   SWITCH JOURNAL
========================================================== */

function switchJournal(
    journal
) {

    saveJournal(journal);

    document
        .querySelectorAll(
            ".journal-pill"
        )
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

            if (
                btn.dataset.journal ===
                journal
            ) {

                btn.classList.add(
                    "active"
                );

            }

        });

    document
        .querySelectorAll(
            ".workspace"
        )
        .forEach(ws =>
            ws.classList.remove(
                "active-workspace"
            )
        );

    const workspace =
        document.getElementById(
            `${journal}Workspace`
        );

    if (workspace) {

        workspace.classList.add(
            "active-workspace"
        );

    }

    renderDashboard(
        journal
    );

}

/* ==========================================================
   DASHBOARD STATS
========================================================== */

function getStats(
    journal
) {

    const entries =
        getJournalEntries(
            journal
        );

    let words = 0;

    entries.forEach(
        entry => {

            const text =
                (
                    entry.content ||
                    ""
                )
                .replace(
                    /<[^>]+>/g,
                    ""
                );

            words +=
                text
                .split(/\s+/)
                .filter(Boolean)
                .length;

        }
    );

    return {

        entries:
            entries.length,

        words,

        latest:
            entries[0]
            ?.title ||
            "No entries"

    };

}

/* ==========================================================
   WORK DASHBOARD
========================================================== */

function renderWorkDashboard() {

    const section =
        document.getElementById(
            "workWorkspace"
        );

    if (!section)
        return;

    const stats =
        getStats(
            "work"
        );

    section.innerHTML = `

        <div class="workspace-hero work-theme">

            <h1>
                💼 Work Dashboard
            </h1>

            <p>
                Productivity Workspace
            </p>

        </div>

        <div class="dashboard-grid">

            <div class="dashboard-card">

                <h3>
                    Tasks
                </h3>

                <h2>
                    ${stats.entries}
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Notes Written
                </h3>

                <h2>
                    ${stats.words}
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Latest Note
                </h3>

                <p>
                    ${stats.latest}
                </p>

            </div>

        </div>

        <div class="dashboard-empty">

            <h2>
                🚀 Productivity Hub
            </h2>

            <p>
                Create work notes,
                projects and meetings.
            </p>

        </div>

    `;

}

/* ==========================================================
   TRAVEL DASHBOARD
========================================================== */

function renderTravelDashboard() {

    const section =
        document.getElementById(
            "travelWorkspace"
        );

    if (!section)
        return;

    const stats =
        getStats(
            "travel"
        );

    section.innerHTML = `

        <div class="workspace-hero travel-theme">

            <h1>
                ✈️ Travel Journal
            </h1>

            <p>
                Adventure Book
            </p>

        </div>

        <div class="dashboard-grid">

            <div class="dashboard-card">

                <h3>
                    Travel Stories
                </h3>

                <h2>
                    ${stats.entries}
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Countries
                </h3>

                <h2>
                    🌎
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Latest Story
                </h3>

                <p>
                    ${stats.latest}
                </p>

            </div>

        </div>

        <div class="travel-gallery-placeholder">

            📷 Travel Gallery

        </div>

    `;

}

/* ==========================================================
   STUDY DASHBOARD
========================================================== */

function renderStudyDashboard() {

    const section =
        document.getElementById(
            "studyWorkspace"
        );

    if (!section)
        return;

    const stats =
        getStats(
            "study"
        );

    section.innerHTML = `

        <div class="workspace-hero study-theme">

            <h1>
                📚 Study Hub
            </h1>

            <p>
                Learning Workspace
            </p>

        </div>

        <div class="dashboard-grid">

            <div class="dashboard-card">

                <h3>
                    Study Notes
                </h3>

                <h2>
                    ${stats.entries}
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Words Learned
                </h3>

                <h2>
                    ${stats.words}
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Revision Status
                </h3>

                <h2>
                    🎯
                </h2>

            </div>

        </div>

    `;

}

/* ==========================================================
   DREAM DASHBOARD
========================================================== */

function renderDreamDashboard() {

    const section =
        document.getElementById(
            "dreamWorkspace"
        );

    if (!section)
        return;

    const stats =
        getStats(
            "dream"
        );

    section.innerHTML = `

        <div class="workspace-hero dream-theme">

            <h1>
                🌙 Dream Journal
            </h1>

            <p>
                Night Reflections
            </p>

        </div>

        <div class="dashboard-grid">

            <div class="dashboard-card">

                <h3>
                    Dreams Logged
                </h3>

                <h2>
                    ${stats.entries}
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Symbols
                </h3>

                <h2>
                    ✨
                </h2>

            </div>

            <div class="dashboard-card">

                <h3>
                    Latest Dream
                </h3>

                <p>
                    ${stats.latest}
                </p>

            </div>

        </div>

    `;

}

/* ==========================================================
   PERSONAL DASHBOARD
========================================================== */

function renderPersonalDashboard() {

    const count =
        getJournalEntries(
            "personal"
        ).length;

    const entryCount =
        document.getElementById(
            "entryCount"
        );

    if (entryCount) {

        entryCount.textContent =
            count;

    }

}

/* ==========================================================
   MAIN RENDER
========================================================== */

function renderDashboard(
    journal
) {

    switch (
        journal
    ) {

        case "personal":
            renderPersonalDashboard();
            break;

        case "work":
            renderWorkDashboard();
            break;

        case "travel":
            renderTravelDashboard();
            break;

        case "study":
            renderStudyDashboard();
            break;

        case "dream":
            renderDreamDashboard();
            break;

    }

}

/* ==========================================================
   JOURNAL EVENTS
========================================================== */

function bindJournalEvents() {

    document
        .querySelectorAll(
            ".journal-pill"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    switchJournal(
                        btn.dataset.journal
                    );

                }
            );

        });

}

/* ==========================================================
   ENTRY SAVED UPDATE
========================================================== */

document.addEventListener(
    "entrySaved",
    () => {

        renderDashboard(
            activeJournal
        );

    }
);

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        bindJournalEvents();

        switchJournal(
            activeJournal
        );

    }
);

/* ==========================================================
   GLOBAL
========================================================== */

window.MyDiaryDashboards = {

    switchJournal,

    renderDashboard,

    getJournalEntries,

    getStats

};

})();