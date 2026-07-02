/* ==========================================================
   MYDIARY V3
   PDF EXPORT MODULE
   modules/pdf-export.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   HELPERS
========================================================== */

function getCurrentDateTime() {

    return new Date()
    .toLocaleString();

}

function getEntries() {

    if (
        window.state &&
        Array.isArray(window.state.entries)
    ) {

        return window.state.entries;

    }

    return JSON.parse(
        localStorage.getItem(
            "myDiaryEntries"
        ) || "[]"
    );

}

function getActiveJournal() {

    return (
        localStorage.getItem(
            "activeJournal"
        ) || "personal"
    );

}

/* ==========================================================
   PDF OPTIONS
========================================================== */

function getPdfOptions(
    filename
) {

    return {

        margin: 10,

        filename,

        image: {
            type: "jpeg",
            quality: 1
        },

        html2canvas: {
            scale: 2,
            useCORS: true
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }

    };

}

/* ==========================================================
   EXPORT CURRENT EDITOR
========================================================== */

async function exportCurrentEntryPDF() {

    const title =
        document.getElementById(
            "entryTitle"
        )?.value || "Untitled";

    const mood =
        document.getElementById(
            "moodSelect"
        )?.value || "";

    const editor =
        document.getElementById(
            "editor"
        );

    if (
        !editor ||
        editor.innerText.trim() === ""
    ) {

        showToastSafe(
            "Nothing to export",
            "error"
        );

        return;

    }

    const wrapper =
        document.createElement("div");

    wrapper.style.padding =
        "30px";

    wrapper.style.fontFamily =
        "Inter,sans-serif";

    wrapper.innerHTML = `

        <h1>${title}</h1>

        <p>
            <strong>Date:</strong>
            ${getCurrentDateTime()}
        </p>

        <p>
            <strong>Mood:</strong>
            ${mood}
        </p>

        <hr>

        ${editor.innerHTML}

    `;

    await html2pdf()
        .set(
            getPdfOptions(
                `${title}.pdf`
            )
        )
        .from(wrapper)
        .save();

    showToastSafe(
        "PDF Exported"
    );

}

/* ==========================================================
   EXPORT SINGLE MEMORY
========================================================== */

async function exportMemoryPDF(
    entry
) {

    if (!entry) return;

    const container =
        document.createElement(
            "div"
        );

    container.style.padding =
        "40px";

    container.style.fontFamily =
        "Inter,sans-serif";

    container.innerHTML = `

        <h1>
            ${entry.title}
        </h1>

        <p>
            ${entry.createdAt}
        </p>

        <p>
            Mood:
            ${entry.mood}
        </p>

        <hr>

        <div>
            ${entry.content}
        </div>

    `;

    await html2pdf()
        .set(
            getPdfOptions(
                `${entry.title}.pdf`
            )
        )
        .from(container)
        .save();

}

/* ==========================================================
   EXPORT ALL ENTRIES
========================================================== */

async function exportAllEntriesPDF() {

    const entries =
        getEntries();

    if (
        entries.length === 0
    ) {

        showToastSafe(
            "No entries available",
            "error"
        );

        return;

    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.style.padding =
        "30px";

    wrapper.style.fontFamily =
        "Inter,sans-serif";

    let html = `

        <h1>
            MyDiary Export
        </h1>

        <p>
            Generated:
            ${getCurrentDateTime()}
        </p>

        <hr>

    `;

    entries.forEach(
        entry => {

            html += `

                <div
                    style="
                    margin-bottom:40px;
                    page-break-inside:avoid;
                    "
                >

                    <h2>
                        ${entry.title}
                    </h2>

                    <p>
                        ${entry.createdAt}
                    </p>

                    <p>
                        Mood:
                        ${entry.mood}
                    </p>

                    <div>
                        ${entry.content}
                    </div>

                </div>

            `;

        }
    );

    wrapper.innerHTML =
        html;

    await html2pdf()
        .set(
            getPdfOptions(
                "MyDiary-Full-Export.pdf"
            )
        )
        .from(wrapper)
        .save();

    showToastSafe(
        "Diary Exported"
    );

}

async function exportCurrentEntry() {
    return exportCurrentEntryPDF();
}

/* ==========================================================
   EXPORT ACTIVE JOURNAL
========================================================== */

async function exportJournalPDF() {

    const journal =
        getActiveJournal();

    const entries =
        getEntries()
        .filter(
            entry =>
            entry.journal ===
            journal
        );

    if (
        entries.length === 0
    ) {

        showToastSafe(
            "No journal entries",
            "error"
        );

        return;

    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.style.padding =
        "30px";

    wrapper.style.fontFamily =
        "Inter,sans-serif";

    let html = `

        <h1>
            ${journal.toUpperCase()}
            Journal
        </h1>

        <hr>

    `;

    entries.forEach(
        entry => {

            html += `

                <div
                    style="
                    margin-bottom:40px;
                    "
                >

                    <h2>
                        ${entry.title}
                    </h2>

                    <p>
                        ${entry.createdAt}
                    </p>

                    <p>
                        ${entry.mood}
                    </p>

                    <div>
                        ${entry.content}
                    </div>

                </div>

            `;

        }
    );

    wrapper.innerHTML =
        html;

    await html2pdf()
        .set(
            getPdfOptions(
                `${journal}-journal.pdf`
            )
        )
        .from(wrapper)
        .save();

}

/* ==========================================================
   EXPORT FAVORITES
========================================================== */

async function exportFavoritesPDF() {

    const entries =
        getEntries()
        .filter(
            entry =>
            entry.favorite
        );

    if (
        entries.length === 0
    ) {

        showToastSafe(
            "No favorites found",
            "error"
        );

        return;

    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.style.padding =
        "30px";

    let html =
        "<h1>Favorite Memories</h1>";

    entries.forEach(
        entry => {

            html += `

                <div
                style="
                margin-bottom:30px;
                ">

                    <h2>
                    ⭐
                    ${entry.title}
                    </h2>

                    <p>
                    ${entry.createdAt}
                    </p>

                    <div>
                    ${entry.content}
                    </div>

                </div>

            `;

        }
    );

    wrapper.innerHTML =
        html;

    await html2pdf()
        .set(
            getPdfOptions(
                "Favorite-Memories.pdf"
            )
        )
        .from(wrapper)
        .save();

}

/* ==========================================================
   SAFE TOAST
========================================================== */

function showToastSafe(
    message,
    type="success"
) {

    if (
        typeof window.showToast ===
        "function"
    ) {

        showToast(
            message,
            type
        );

    }

}

/* ==========================================================
   EVENT LISTENERS
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const exportBtn =
            document.getElementById(
                "exportPDFBtn"
            );

        exportBtn?.addEventListener(
            "click",
            exportCurrentEntryPDF
        );

    }
);

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryPDF = {

    exportCurrentEntryPDF,
    exportCurrentEntry,


    exportMemoryPDF,

    exportAllEntriesPDF,

    exportJournalPDF,

    exportFavoritesPDF

};

})();