/* ==========================================================
   MYDIARY V3
   HABIT TRACKER MODULE
   modules/habits.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   STORAGE
========================================================== */

const HABIT_KEY =
    "myDiaryHabits";

/* ==========================================================
   DEFAULT HABITS
========================================================== */

const DEFAULT_HABITS = [

    {
        id: 1,
        name: "Exercise",
        progress: 80,
        streak: 15
    },

    {
        id: 2,
        name: "Reading",
        progress: 60,
        streak: 9
    },

    {
        id: 3,
        name: "Water",
        progress: 100,
        streak: 22
    },

    {
        id: 4,
        name: "Coding",
        progress: 40,
        streak: 12
    }

];

/* ==========================================================
   GET HABITS
========================================================== */

function getHabits() {

    const habits =
        localStorage.getItem(
            HABIT_KEY
        );

    if (!habits) {

        localStorage.setItem(
            HABIT_KEY,
            JSON.stringify(
                DEFAULT_HABITS
            )
        );

        return DEFAULT_HABITS;

    }

    return JSON.parse(
        habits
    );

}

/* ==========================================================
   SAVE HABITS
========================================================== */

function saveHabits(
    habits
) {

    localStorage.setItem(
        HABIT_KEY,
        JSON.stringify(
            habits
        )
    );

}

/* ==========================================================
   GENERATE ID
========================================================== */

function generateId() {

    return Date.now();

}

/* ==========================================================
   ADD HABIT
========================================================== */

function addHabit() {

    const name =
        prompt(
            "Enter habit name"
        );

    if (
        !name ||
        !name.trim()
    ) {
        return;
    }

    const habits =
        getHabits();

    habits.push({

        id:
            generateId(),

        name:
            name.trim(),

        progress: 0,

        streak: 0

    });

    saveHabits(
        habits
    );

    renderHabits();

}

/* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress(
    id,
    value
) {

    const habits =
        getHabits();

    const habit =
        habits.find(
            h => h.id == id
        );

    if (!habit) return;

    habit.progress =
        Number(value);

    if (
        habit.progress === 100
    ) {

        habit.streak++;

    }

    saveHabits(
        habits
    );

    renderHabits();

}

/* ==========================================================
   DELETE HABIT
========================================================== */

function deleteHabit(
    id
) {

    const habits =
        getHabits()
        .filter(
            h =>
            h.id != id
        );

    saveHabits(
        habits
    );

    renderHabits();

}

/* ==========================================================
   TOTAL STREAK
========================================================== */

function getTotalStreak() {

    return getHabits()
        .reduce(
            (
                total,
                habit
            ) =>
                total +
                habit.streak,
            0
        );

}

/* ==========================================================
   AVG PROGRESS
========================================================== */

function getAverageProgress() {

    const habits =
        getHabits();

    if (
        habits.length === 0
    ) {
        return 0;
    }

    const total =
        habits.reduce(
            (
                sum,
                habit
            ) =>
                sum +
                habit.progress,
            0
        );

    return Math.round(
        total /
        habits.length
    );

}

/* ==========================================================
   RENDER
========================================================== */

function renderHabits() {

    const container =
        document.getElementById(
            "habitGrid"
        );

    if (!container)
        return;

    const habits =
        getHabits();

    if (
        habits.length === 0
    ) {

        container.innerHTML = `

            <div class="habit-empty">

                ✨ No habits yet

            </div>

        `;

        return;

    }

    container.innerHTML =

        habits
        .map(
            habit =>

            `

            <div
                class="habit-card"
            >

                <div
                    class="habit-top"
                >

                    <h3>
                        ${habit.name}
                    </h3>

                    <button
                        class="habit-delete"
                        data-id="${habit.id}"
                    >
                        ✕
                    </button>

                </div>

                <div
                    class="habit-progress-row"
                >

                    <span>
                        ${habit.progress}%
                    </span>

                    <span>
                        🔥 ${habit.streak}
                    </span>

                </div>

                <div
                    class="habit-progress-bar"
                >

                    <div
                        class="habit-progress-fill"
                        style="
                        width:${habit.progress}%;
                        "
                    >
                    </div>

                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value="${habit.progress}"
                    class="habit-slider"
                    data-id="${habit.id}"
                >

            </div>

        `
        )
        .join("");

    bindHabitEvents();

}

/* ==========================================================
   BIND EVENTS
========================================================== */

function bindHabitEvents() {

    document
        .querySelectorAll(
            ".habit-slider"
        )
        .forEach(
            slider => {

                slider.addEventListener(
                    "input",
                    function () {

                        updateProgress(
                            this.dataset.id,
                            this.value
                        );

                    }
                );

            }
        );

    document
        .querySelectorAll(
            ".habit-delete"
        )
        .forEach(
            btn => {

                btn.addEventListener(
                    "click",
                    function () {

                        deleteHabit(
                            this.dataset.id
                        );

                    }
                );

            }
        );

}

/* ==========================================================
   DASHBOARD SUMMARY
========================================================== */

function getHabitStats() {

    return {

        totalHabits:
            getHabits().length,

        totalStreak:
            getTotalStreak(),

        averageProgress:
            getAverageProgress()

    };

}

/* ==========================================================
   INIT BUTTON
========================================================== */

function createAddButton() {

    const section =
        document.getElementById(
            "habitTracker"
        );

    if (
        !section
    ) return;

    const existing =
        document.getElementById(
            "addHabitBtn"
        );

    if (existing)
        return;

    const btn =
        document.createElement(
            "button"
        );

    btn.id =
        "addHabitBtn";

    btn.className =
        "primary-btn";

    btn.textContent =
        "+ Add Habit";

    btn.addEventListener(
        "click",
        addHabit
    );

    section.prepend(
        btn
    );

}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createAddButton();

        renderHabits();

    }
);

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryHabits = {

    renderHabits,

    addHabit,

    getHabitStats,

    updateProgress,

    deleteHabit

};

})();