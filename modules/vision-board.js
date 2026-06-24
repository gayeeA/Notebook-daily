/* ==========================================================
   MYDIARY V3
   VISION BOARD MODULE
   modules/vision-board.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY =
    "myDiaryVisionBoard";

/* ==========================================================
   HELPERS
========================================================== */

function getGoals() {

    return JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        ) || "[]"
    );

}

function saveGoals(goals) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(goals)
    );

}

function generateId() {

    return Date.now() +
           Math.random();

}

/* ==========================================================
   ADD GOAL
========================================================== */

function addGoal() {

    const title =
        prompt(
            "Goal title?"
        );

    if (!title) return;

    const category =
        prompt(
            "Category (Career, Travel, Health, Learning, Personal)"
        ) || "Personal";

    const image =
        prompt(
            "Image URL (optional)"
        ) || "";

    const goal = {

        id: generateId(),

        title,

        category,

        image,

        progress: 0,

        createdAt:
            new Date()
            .toISOString()

    };

    const goals =
        getGoals();

    goals.unshift(goal);

    saveGoals(goals);

    renderVisionBoard();

}

/* ==========================================================
   DELETE GOAL
========================================================== */

function deleteGoal(id) {

    const goals =
        getGoals()
        .filter(
            goal =>
            goal.id != id
        );

    saveGoals(goals);

    renderVisionBoard();

}

/* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress(
    id,
    progress
) {

    const goals =
        getGoals();

    const goal =
        goals.find(
            g =>
            g.id == id
        );

    if (!goal) return;

    goal.progress =
        Number(progress);

    saveGoals(goals);

    renderVisionBoard();

}

/* ==========================================================
   EDIT GOAL
========================================================== */

function editGoal(id) {

    const goals =
        getGoals();

    const goal =
        goals.find(
            g =>
            g.id == id
        );

    if (!goal) return;

    const newTitle =
        prompt(
            "Edit title",
            goal.title
        );

    if (!newTitle) return;

    goal.title =
        newTitle;

    saveGoals(goals);

    renderVisionBoard();

}

/* ==========================================================
   EMPTY STATE
========================================================== */

function renderEmptyState() {

    const container =
        document.getElementById(
            "visionBoardGrid"
        );

    if (!container) return;

    container.innerHTML = `

        <div class="vision-empty">

            ✨

            <h3>
                Create Your Dream Board
            </h3>

            <p>
                Add your first goal.
            </p>

        </div>

    `;

}

/* ==========================================================
   RENDER
========================================================== */

function renderVisionBoard() {

    const container =
        document.getElementById(
            "visionBoardGrid"
        );

    if (!container)
        return;

    const goals =
        getGoals();

    if (
        goals.length === 0
    ) {

        renderEmptyState();
        return;

    }

    container.innerHTML =

        goals.map(goal => `

        <div class="vision-card">

            <div class="vision-image-wrap">

                ${
                    goal.image
                    ? `
                    <img
                    src="${goal.image}"
                    class="vision-image"
                    >
                    `
                    :
                    `
                    <div
                    class="vision-placeholder">
                    🎯
                    </div>
                    `
                }

                <div class="vision-tape"></div>

            </div>

            <div class="vision-content">

                <span
                class="vision-category">

                    ${goal.category}

                </span>

                <h3>

                    ${goal.title}

                </h3>

                <div
                class="vision-progress">

                    <div
                    class="vision-progress-fill"
                    style="
                    width:
                    ${goal.progress}%;
                    ">
                    </div>

                </div>

                <div
                class="vision-progress-info">

                    <span>

                        ${goal.progress}%

                    </span>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value="${goal.progress}"
                        data-id="${goal.id}"
                        class="vision-slider"
                    >

                </div>

                <div
                class="vision-actions">

                    <button
                    class="vision-edit"
                    data-id="${goal.id}">
                        ✏
                    </button>

                    <button
                    class="vision-delete"
                    data-id="${goal.id}">
                        🗑
                    </button>

                </div>

            </div>

        </div>

        `).join("");

    bindEvents();

}

/* ==========================================================
   EVENTS
========================================================== */

function bindEvents() {

    document
    .querySelectorAll(
        ".vision-delete"
    )
    .forEach(btn => {

        btn.onclick =
        () => {

            deleteGoal(
                btn.dataset.id
            );

        };

    });

    document
    .querySelectorAll(
        ".vision-edit"
    )
    .forEach(btn => {

        btn.onclick =
        () => {

            editGoal(
                btn.dataset.id
            );

        };

    });

    document
    .querySelectorAll(
        ".vision-slider"
    )
    .forEach(slider => {

        slider.oninput =
        () => {

            updateProgress(
                slider.dataset.id,
                slider.value
            );

        };

    });

}

/* ==========================================================
   STATS
========================================================== */

function getStats() {

    const goals =
        getGoals();

    const completed =
        goals.filter(
            goal =>
            goal.progress === 100
        ).length;

    return {

        totalGoals:
            goals.length,

        completedGoals:
            completed

    };

}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const addBtn =
            document.getElementById(
                "addVisionGoal"
            );

        addBtn?.addEventListener(
            "click",
            addGoal
        );

        renderVisionBoard();

    }
);

/* ==========================================================
   GLOBAL
========================================================== */

window.MyDiaryVisionBoard = {

    addGoal,

    renderVisionBoard,

    getStats

};

})();