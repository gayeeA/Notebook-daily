/* ==========================================================
   MYDIARY V3
   WRITING HEATMAP MODULE
   modules/heatmap.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   CONFIG
========================================================== */

const DAYS_TO_SHOW = 365;

const LEVELS = [
    "#f3f4f6", // none
    "#dbeafe", // low
    "#93c5fd", // medium
    "#60a5fa", // high
    "#2563eb"  // very high
];

/* ==========================================================
   GET ENTRIES
========================================================== */

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

/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(date) {

    return date
        .toISOString()
        .split("T")[0];

}

/* ==========================================================
   ACTIVITY MAP
========================================================== */

function buildActivityMap() {

    const map = {};

    const entries =
        getEntries();

    entries.forEach(entry => {

        const key =
            formatDate(
                new Date(
                    entry.createdAt
                )
            );

        map[key] =
            (map[key] || 0) + 1;

    });

    return map;

}

/* ==========================================================
   LEVEL CALCULATION
========================================================== */

function getLevel(count) {

    if (count === 0)
        return 0;

    if (count <= 1)
        return 1;

    if (count <= 3)
        return 2;

    if (count <= 5)
        return 3;

    return 4;

}

/* ==========================================================
   STREAKS
========================================================== */

function calculateStreaks() {

    const map =
        buildActivityMap();

    let current = 0;
    let longest = 0;

    let streak = 0;

    const today =
        new Date();

    /* Current streak */

    let temp =
        new Date(today);

    while (true) {

        const key =
            formatDate(temp);

        if (map[key]) {

            current++;

            temp.setDate(
                temp.getDate() - 1
            );

        } else {

            break;

        }

    }

    /* Longest streak */

    const dates =
        Object.keys(map)
        .sort();

    for (
        let i = 0;
        i < dates.length;
        i++
    ) {

        if (i === 0) {

            streak = 1;

        } else {

            const prev =
                new Date(
                    dates[i - 1]
                );

            const curr =
                new Date(
                    dates[i]
                );

            const diff =
                (
                    curr - prev
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                );

            if (diff === 1) {

                streak++;

            } else {

                streak = 1;

            }

        }

        longest =
            Math.max(
                longest,
                streak
            );

    }

    return {
        current,
        longest
    };

}

/* ==========================================================
   RENDER HEATMAP
========================================================== */

function renderHeatmap() {

    const container =
        document.getElementById(
            "heatmapGrid"
        );

    if (!container)
        return;

    const activityMap =
        buildActivityMap();

    container.innerHTML = "";

    const start =
        new Date();

    start.setDate(
        start.getDate() -
        DAYS_TO_SHOW
    );

    for (
        let i = 0;
        i < DAYS_TO_SHOW;
        i++
    ) {

        const day =
            new Date(start);

        day.setDate(
            start.getDate() + i
        );

        const key =
            formatDate(day);

        const count =
            activityMap[key] || 0;

        const level =
            getLevel(count);

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "heatmap-cell";

        cell.style.background =
            LEVELS[level];

        cell.title =
            `${key} • ${count} entries`;

        container.appendChild(
            cell
        );

    }

    updateStats();

}

/* ==========================================================
   UPDATE STATS
========================================================== */

function updateStats() {

    const stats =
        calculateStreaks();

    const current =
        document.getElementById(
            "currentHeatmapStreak"
        );

    const longest =
        document.getElementById(
            "longestHeatmapStreak"
        );

    if (current) {

        current.textContent =
            stats.current +
            " Days";

    }

    if (longest) {

        longest.textContent =
            stats.longest +
            " Days";

    }

}

/* ==========================================================
   MONTH SUMMARY
========================================================== */

function getMonthlyActivity() {

    const entries =
        getEntries();

    const currentMonth =
        new Date()
        .getMonth();

    const currentYear =
        new Date()
        .getFullYear();

    return entries.filter(
        entry => {

            const d =
                new Date(
                    entry.createdAt
                );

            return (
                d.getMonth() ===
                currentMonth &&
                d.getFullYear() ===
                currentYear
            );

        }
    ).length;

}

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryHeatmap = {

    renderHeatmap,

    calculateStreaks,

    getMonthlyActivity

};

/* ==========================================================
   AUTO UPDATE
========================================================== */

document.addEventListener(
    "entrySaved",
    () => {

        renderHeatmap();

    }
);

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setTimeout(
            renderHeatmap,
            500
        );

    }
);

})();