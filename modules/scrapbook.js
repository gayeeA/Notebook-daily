/* ==========================================================
   MYDIARY V3
   SCRAPBOOK BOARD MODULE
   modules/scrapbook.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   STORAGE
========================================================== */

const SCRAPBOOK_KEY =
    "myDiaryScrapbook";

/* ==========================================================
   GET ITEMS
========================================================== */

function getItems() {

    return JSON.parse(
        localStorage.getItem(
            SCRAPBOOK_KEY
        ) || "[]"
    );

}

/* ==========================================================
   SAVE ITEMS
========================================================== */

function saveItems(items) {

    localStorage.setItem(
        SCRAPBOOK_KEY,
        JSON.stringify(items)
    );

}

/* ==========================================================
   ID
========================================================== */

function generateId() {

    return Date.now() +
        Math.random();

}

/* ==========================================================
   ADD STICKY NOTE
========================================================== */

function addStickyNote() {

    const text =
        prompt(
            "Write your note"
        );

    if (!text) return;

    const items =
        getItems();

    items.push({

        id: generateId(),

        type: "note",

        text,

        x: 20,

        y: 20,

        rotation:
            Math.floor(
                Math.random() * 10
            ) - 5

    });

    saveItems(items);

    renderScrapbook();

}

/* ==========================================================
   ADD MEMORY CARD
========================================================== */

function addMemoryCard() {

    const title =
        prompt(
            "Memory title"
        );

    if (!title) return;

    const items =
        getItems();

    items.push({

        id: generateId(),

        type: "memory",

        title,

        x: 60,

        y: 60,

        rotation:
            Math.floor(
                Math.random() * 8
            ) - 4

    });

    saveItems(items);

    renderScrapbook();

}

/* ==========================================================
   ADD STICKER
========================================================== */

function addSticker() {

    const stickers = [

        "🌸",
        "⭐",
        "💌",
        "📸",
        "🎀",
        "🦋",
        "🌙",
        "☁️",
        "✨",
        "🌻"

    ];

    const random =
        stickers[
            Math.floor(
                Math.random() *
                stickers.length
            )
        ];

    const items =
        getItems();

    items.push({

        id: generateId(),

        type: "sticker",

        emoji: random,

        x: 100,

        y: 100,

        rotation:
            Math.floor(
                Math.random() * 20
            ) - 10

    });

    saveItems(items);

    renderScrapbook();

}

/* ==========================================================
   DELETE ITEM
========================================================== */

function deleteItem(id) {

    const items =
        getItems()
        .filter(
            item =>
            item.id != id
        );

    saveItems(items);

    renderScrapbook();

}

/* ==========================================================
   UPDATE POSITION
========================================================== */

function updatePosition(
    id,
    x,
    y
) {

    const items =
        getItems();

    const item =
        items.find(
            i =>
            i.id == id
        );

    if (!item) return;

    item.x = x;
    item.y = y;

    saveItems(items);

}

/* ==========================================================
   RENDER
========================================================== */

function renderScrapbook() {

    const board =
        document.getElementById(
            "scrapbookGrid"
        );

    if (!board)
        return;

    const items =
        getItems();

    if (
        items.length === 0
    ) {

        board.innerHTML = `

        <div
        class="scrapbook-empty">

            ✨

            <h3>
                Your Scrapbook Is Empty
            </h3>

            <p>
                Add notes, memories
                and stickers.
            </p>

        </div>

        `;

        return;

    }

    board.innerHTML =
        items.map(item => {

        if (
            item.type === "note"
        ) {

            return `

            <div
            class="scrap-item sticky-note draggable"
            data-id="${item.id}"

            style="
            left:${item.x}px;
            top:${item.y}px;
            transform:
            rotate(${item.rotation}deg);
            ">

                <button
                class="scrap-delete"
                data-id="${item.id}">
                    ✕
                </button>

                ${item.text}

            </div>

            `;

        }

        if (
            item.type === "memory"
        ) {

            return `

            <div
            class="scrap-item memory-card draggable"
            data-id="${item.id}"

            style="
            left:${item.x}px;
            top:${item.y}px;
            transform:
            rotate(${item.rotation}deg);
            ">

                <div class="washi-tape"></div>

                <button
                class="scrap-delete"
                data-id="${item.id}">
                    ✕
                </button>

                <div
                class="memory-photo">

                    📷

                </div>

                <h4>

                    ${item.title}

                </h4>

            </div>

            `;

        }

        if (
            item.type === "sticker"
        ) {

            return `

            <div
            class="scrap-item sticker draggable"
            data-id="${item.id}"

            style="
            left:${item.x}px;
            top:${item.y}px;
            transform:
            rotate(${item.rotation}deg);
            ">

                ${item.emoji}

            </div>

            `;

        }

    }).join("");

    bindEvents();

}

/* ==========================================================
   DRAG
========================================================== */

function bindEvents() {

    document
    .querySelectorAll(
        ".scrap-delete"
    )
    .forEach(btn => {

        btn.onclick =
        () => {

            deleteItem(
                btn.dataset.id
            );

        };

    });

    document
    .querySelectorAll(
        ".draggable"
    )
    .forEach(el => {

        let active = false;

        let startX = 0;
        let startY = 0;

        el.addEventListener(
            "mousedown",
            e => {

                active = true;

                startX =
                    e.clientX -
                    el.offsetLeft;

                startY =
                    e.clientY -
                    el.offsetTop;

            }
        );

        document.addEventListener(
            "mousemove",
            e => {

                if (!active)
                    return;

                const x =
                    e.clientX -
                    startX;

                const y =
                    e.clientY -
                    startY;

                el.style.left =
                    x + "px";

                el.style.top =
                    y + "px";

            }
        );

        document.addEventListener(
            "mouseup",
            () => {

                if (!active)
                    return;

                active = false;

                updatePosition(

                    el.dataset.id,

                    parseInt(
                        el.style.left
                    ),

                    parseInt(
                        el.style.top
                    )

                );

            }
        );

    });

}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
        .getElementById(
            "addStickyNote"
        )
        ?.addEventListener(
            "click",
            addStickyNote
        );

        document
        .getElementById(
            "addMemoryCard"
        )
        ?.addEventListener(
            "click",
            addMemoryCard
        );

        document
        .getElementById(
            "addSticker"
        )
        ?.addEventListener(
            "click",
            addSticker
        );

        renderScrapbook();

    }
);

/* ==========================================================
   GLOBAL
========================================================== */

window.MyDiaryScrapbook = {

    renderScrapbook,

    addStickyNote,

    addMemoryCard,

    addSticker

};

})();