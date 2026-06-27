/* ==========================================================
   MYDIARY V3
   CALENDAR MODULE
   modules/calendar.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   STATE
========================================================== */

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/* ==========================================================
   DOM
========================================================== */

function getCalendarGrid() {
    return document.getElementById("calendarGrid");
}

function getCalendarMonthLabel() {
    return document.getElementById("calendarMonth");
}

/* ==========================================================
   MONTH NAMES
========================================================== */

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const WEEKDAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];

/* ==========================================================
   GET ENTRIES
========================================================== */

function readJournalEntries(journal) {

    try {

        const raw =
            localStorage.getItem(
                `mydiary_${journal}`
            );

        return raw ? JSON.parse(raw) : [];

    }
    catch {

        return [];

    }

}

function getEntries() {

    const journals = [
        "personal",
        "work",
        "travel",
        "study",
        "dream"
    ];

    return journals.flatMap(journal =>
        readJournalEntries(journal)
        .map(entry => ({
            ...entry,
            journal: entry.journal || journal
        }))
    );

}

/* ==========================================================
   ENTRIES FOR DAY
========================================================== */

function getEntriesForDate(dateString) {

    return getEntries().filter(entry => {

        if (!entry.createdAt) return false;

        const entryDate =
            new Date(entry.createdAt)
            .toISOString()
            .split("T")[0];

        return entryDate === dateString;

    });

}

/* ==========================================================
   FORMAT YYYY-MM-DD
========================================================== */

function formatDate(year, month, day) {

    const m =
        String(month + 1)
        .padStart(2, "0");

    const d =
        String(day)
        .padStart(2, "0");

    return `${year}-${m}-${d}`;

}

/* ==========================================================
   RENDER CALENDAR
========================================================== */

function renderCalendar() {

    const grid =
        getCalendarGrid();

    if (!grid) return;

    grid.innerHTML = "";

    const label =
        getCalendarMonthLabel();

    if (label) {

        label.textContent =
            `${MONTHS[currentMonth]} ${currentYear}`;

    }

    /* Week Headers */

    WEEKDAYS.forEach(day => {

        const header =
            document.createElement("div");

        header.className =
            "calendar-weekday";

        header.textContent =
            day;

        grid.appendChild(header);

    });

    const firstDay =
        new Date(
            currentYear,
            currentMonth,
            1
        );

    const startDay =
        firstDay.getDay();

    const totalDays =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();

    /* Empty cells */

    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-empty";

        grid.appendChild(empty);

    }

    /* Days */

    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const dateString =
            formatDate(
                currentYear,
                currentMonth,
                day
            );

        const entries =
            getEntriesForDate(
                dateString
            );

        const dayCard =
            document.createElement("div");

        dayCard.className =
            "calendar-day";

        const today =
            new Date();

        if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        ) {

            dayCard.classList.add(
                "today"
            );

        }

        if (
            entries.length > 0
        ) {

            dayCard.classList.add(
                "has-entry"
            );

        }

        dayCard.innerHTML = `

            <div class="calendar-date">
                ${day}
            </div>

            ${
                entries.length > 0
                ? `
                <div class="calendar-entry-count">
                    ${entries.length}
                </div>
                `
                : ""
            }

        `;

        dayCard.addEventListener(
            "click",
            () => {

                openDayEntries(
                    dateString,
                    entries
                );

            }
        );

        grid.appendChild(
            dayCard
        );

    }

}

/* ==========================================================
   DAY MODAL
========================================================== */

function openDayEntries(
    dateString,
    entries
) {

    if (
        entries.length === 0
    ) {

        if (
            window.showToast
        ) {

            showToast(
                "No entries for this day",
                "error"
            );

        }

        return;

    }

    const modal =
        document.getElementById(
            "memoryModal"
        );

    const body =
        document.getElementById(
            "modalBody"
        );

    if (
        !modal ||
        !body
    ) {
        return;
    }

    let html = `
        <h2>
            ðŸ“… ${dateString}
        </h2>
    `;

    entries.forEach(
        entry => {

            html += `

                <div
                    class="calendar-entry-card"
                >

                    <h3>
                        ${entry.title}
                    </h3>

                    <p>
                        ${entry.mood || ""} · ${entry.journal || "personal"}
                    </p>

                    <div>
                        ${
                            (
                                entry.plainText ||
                                ""
                            )
                            .substring(0,150)
                        }...
                    </div>

                </div>

            `;

        }
    );

    body.innerHTML =
        html;

    modal.classList.add(
        "show"
    );

}

/* ==========================================================
   NEXT MONTH
========================================================== */

function nextMonth() {

    currentMonth++;

    if (
        currentMonth > 11
    ) {

        currentMonth = 0;

        currentYear++;

    }

    renderCalendar();

}

/* ==========================================================
   PREVIOUS MONTH
========================================================== */

function previousMonth() {

    currentMonth--;

    if (
        currentMonth < 0
    ) {

        currentMonth = 11;

        currentYear--;

    }

    renderCalendar();

}

/* ==========================================================
   REFRESH
========================================================== */

function refreshCalendar() {

    renderCalendar();

}

/* ==========================================================
   EVENTS
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const nextBtn =
            document.getElementById(
                "nextMonthBtn"
            );

        const prevBtn =
            document.getElementById(
                "prevMonthBtn"
            );

        nextBtn?.addEventListener(
            "click",
            nextMonth
        );

        prevBtn?.addEventListener(
            "click",
            previousMonth
        );

        renderCalendar();

    }
);

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryCalendar = {

    renderCalendar,

    refreshCalendar,

    nextMonth,

    previousMonth,

    getEntriesForDate

};

})();
