/* ==========================================================
   MYDIARY V3
   MOOD ANALYTICS MODULE
   modules/mood-charts.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   CHART INSTANCE
========================================================== */

let moodChart = null;

/* ==========================================================
   DEFAULT MOODS
========================================================== */

const MOODS = [
    "Happy",
    "Calm",
    "Reflective",
    "Productive",
    "Excited",
    "Sad",
    "Anxious"
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

    const localEntries =
        JSON.parse(
            localStorage.getItem(
                "myDiaryEntries"
            ) || "[]"
        );

    return localEntries;

}

/* ==========================================================
   TOTAL ENTRIES
========================================================== */

function getTotalEntries() {

    return getEntries().length;

}

/* ==========================================================
   TOTAL WORDS
========================================================== */

function getTotalWords() {

    const entries =
        getEntries();

    let total = 0;

    entries.forEach(entry => {

        const text =
            entry.plainText ||
            entry.content ||
            "";

        total += text
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

    });

    return total;

}

/* ==========================================================
   MOST USED MOOD
========================================================== */

function getMostUsedMood() {

    const entries =
        getEntries();

    const moodCount = {};

    entries.forEach(entry => {

        const mood =
            entry.mood || "Happy";

        moodCount[mood] =
            (moodCount[mood] || 0) + 1;

    });

    let winner = "None";
    let highest = 0;

    Object.keys(moodCount)
        .forEach(mood => {

            if (
                moodCount[mood] > highest
            ) {

                highest =
                    moodCount[mood];

                winner = mood;

            }

        });

    return winner;

}

/* ==========================================================
   WRITING STREAK
========================================================== */

function calculateWritingStreak() {

    const entries =
        getEntries();

    if (
        entries.length === 0
    ) {
        return 0;
    }

    const dates =
        entries.map(entry => {

            return new Date(
                entry.createdAt
            )
            .toISOString()
            .split("T")[0];

        });

    const uniqueDates =
        [...new Set(dates)]
        .sort()
        .reverse();

    let streak = 0;

    let current =
        new Date();

    while (true) {

        const formatted =
            current
            .toISOString()
            .split("T")[0];

        if (
            uniqueDates.includes(
                formatted
            )
        ) {

            streak++;

            current.setDate(
                current.getDate() - 1
            );

        }
        else {

            break;

        }

    }

    return streak;

}

/* ==========================================================
   MOOD COUNTS
========================================================== */

function getMoodCounts() {

    const entries =
        getEntries();

    const counts = {};

    MOODS.forEach(mood => {

        counts[mood] = 0;

    });

    entries.forEach(entry => {

        const mood =
            entry.mood ||
            "Happy";

        if (
            counts[mood] ===
            undefined
        ) {

            counts[mood] = 1;

        }
        else {

            counts[mood]++;

        }

    });

    return counts;

}

/* ==========================================================
   MONTHLY WORDS
========================================================== */

function getMonthlyWords() {

    const entries =
        getEntries();

    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();

    let total = 0;

    entries.forEach(entry => {

        const date =
            new Date(
                entry.createdAt
            );

        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {

            const words =
                (
                    entry.plainText ||
                    ""
                )
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .length;

            total += words;

        }

    });

    return total;

}

/* ==========================================================
   UPDATE CARDS
========================================================== */

function updateAnalyticsCards() {

    const totalEntries =
        document.getElementById(
            "totalEntriesCard"
        );

    const totalWords =
        document.getElementById(
            "totalWordsCard"
        );

    const moodCard =
        document.getElementById(
            "mostUsedMood"
        );

    const streakCard =
        document.getElementById(
            "writingStreakCard"
        );

    if (totalEntries) {

        totalEntries.textContent =
            getTotalEntries();

    }

    if (totalWords) {

        totalWords.textContent =
            getTotalWords()
            .toLocaleString();

    }

    if (moodCard) {

        moodCard.textContent =
            getMostUsedMood();

    }

    if (streakCard) {

        streakCard.textContent =
            calculateWritingStreak()
            + " 🔥";

    }

}

/* ==========================================================
   BUILD CHART
========================================================== */

function buildMoodChart() {

    const canvas =
        document.getElementById(
            "moodChart"
        );

    if (!canvas) return;

    const counts =
        getMoodCounts();

    const labels =
        Object.keys(counts);

    const values =
        Object.values(counts);

    if (moodChart) {

        moodChart.destroy();

    }

    moodChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor: [

                                "#FFB6C1",
                                "#A5F3FC",
                                "#C4B5FD",
                                "#86EFAC",
                                "#FDE68A",
                                "#FDA4AF",
                                "#F9A8D4"

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }

        );

}

/* ==========================================================
   MONTHLY ACTIVITY
========================================================== */

function getMonthlyActivity() {

    const entries =
        getEntries();

    const months = {};

    entries.forEach(entry => {

        const date =
            new Date(
                entry.createdAt
            );

        const key =
            `${date.getFullYear()}-${date.getMonth()+1}`;

        months[key] =
            (months[key] || 0) + 1;

    });

    return months;

}

/* ==========================================================
   SUMMARY OBJECT
========================================================== */

function getAnalyticsSummary() {

    return {

        totalEntries:
            getTotalEntries(),

        totalWords:
            getTotalWords(),

        mostUsedMood:
            getMostUsedMood(),

        writingStreak:
            calculateWritingStreak(),

        monthlyWords:
            getMonthlyWords(),

        monthlyActivity:
            getMonthlyActivity()

    };

}

/* ==========================================================
   REFRESH
========================================================== */

function refreshAnalytics() {

    updateAnalyticsCards();

    buildMoodChart();

}

/* ==========================================================
   AUTO REFRESH
========================================================== */

document.addEventListener(
    "entrySaved",
    () => {

        refreshAnalytics();

    }
);

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setTimeout(() => {

            refreshAnalytics();

        }, 500);

    }
);

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryCharts = {

    refreshAnalytics,

    getAnalyticsSummary,

    getMoodCounts,

    calculateWritingStreak,

    getTotalWords,

    getMostUsedMood

};

})();