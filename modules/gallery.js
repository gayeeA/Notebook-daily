/* ==========================================================
   MYDIARY V3
   POLAROID GALLERY MODULE
   modules/gallery.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   STORAGE
========================================================== */

const GALLERY_KEY =
    "myDiaryGallery";

/* ==========================================================
   HELPERS
========================================================== */

function getPhotos() {

    return JSON.parse(
        localStorage.getItem(
            GALLERY_KEY
        ) || "[]"
    );

}

function savePhotos(
    photos
) {

    localStorage.setItem(
        GALLERY_KEY,
        JSON.stringify(
            photos
        )
    );

}

/* ==========================================================
   GENERATE ID
========================================================== */

function generateId() {

    return Date.now() +
        Math.random();

}

/* ==========================================================
   ADD PHOTO
========================================================== */

async function addPhoto(
    file
) {

    if (!file)
        return;

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            const photos =
                getPhotos();

            photos.unshift({

                id:
                    generateId(),

                image:
                    e.target.result,

                favorite:
                    false,

                createdAt:
                    new Date()
                    .toISOString()

            });

            savePhotos(
                photos
            );

            renderGallery();

            showToastSafe(
                "Photo Added"
            );

        };

    reader.readAsDataURL(
        file
    );

}

/* ==========================================================
   DELETE PHOTO
========================================================== */

function deletePhoto(
    id
) {

    const photos =
        getPhotos()
        .filter(
            p =>
            p.id != id
        );

    savePhotos(
        photos
    );

    renderGallery();

}

/* ==========================================================
   TOGGLE FAVORITE
========================================================== */

function toggleFavorite(
    id
) {

    const photos =
        getPhotos();

    const photo =
        photos.find(
            p =>
            p.id == id
        );

    if (!photo)
        return;

    photo.favorite =
        !photo.favorite;

    savePhotos(
        photos
    );

    renderGallery();

}

/* ==========================================================
   DOWNLOAD PHOTO
========================================================== */

function downloadPhoto(
    image
) {

    const a =
        document.createElement(
            "a"
        );

    a.href =
        image;

    a.download =
        "memory-photo.png";

    document.body.appendChild(
        a
    );

    a.click();

    a.remove();

}

/* ==========================================================
   OPEN MODAL
========================================================== */

function openPhotoModal(
    image
) {

    let modal =
        document.getElementById(
            "photoModal"
        );

    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "photoModal";

        modal.className =
            "photo-modal";

        modal.innerHTML = `

            <div class="photo-modal-content">

                <button
                    class="photo-close"
                >
                    ✕
                </button>

                <img
                    id="photoModalImage"
                    src=""
                    alt=""
                >

            </div>

        `;

        document.body.appendChild(
            modal
        );

        modal
        .querySelector(
            ".photo-close"
        )
        .addEventListener(
            "click",
            () => {

                modal.classList
                .remove(
                    "show"
                );

            }
        );

    }

    modal
    .querySelector(
        "#photoModalImage"
    )
    .src =
    image;

    modal.classList
    .add(
        "show"
    );

}

/* ==========================================================
   RENDER
========================================================== */

function renderGallery() {

    const grid =
        document.getElementById(
            "galleryGrid"
        );

    if (!grid)
        return;

    const photos =
        getPhotos();

    if (
        photos.length === 0
    ) {

        grid.innerHTML = `

            <div
                class="
                gallery-empty
                "
            >

                📸

                <h3>
                    No Photos Yet
                </h3>

                <p>
                    Add memories
                    to your gallery.
                </p>

            </div>

        `;

        return;

    }

    grid.innerHTML =

        photos
        .map(
            photo =>

            `

            <div
                class="
                polaroid-card
                "
            >

                <div
                    class="
                    tape
                    "
                ></div>

                <img
                    src="${photo.image}"
                    class="
                    polaroid-image
                    "
                    data-open="${photo.id}"
                >

                <div
                    class="
                    polaroid-footer
                    "
                >

                    <span>
                        ${
                            new Date(
                                photo.createdAt
                            )
                            .toLocaleDateString()
                        }
                    </span>

                </div>

                <div
                    class="
                    photo-actions
                    "
                >

                    <button
                        class="
                        favorite-photo
                        "
                        data-id="${photo.id}"
                    >

                        ${
                            photo.favorite
                            ? "⭐"
                            : "☆"
                        }

                    </button>

                    <button
                        class="
                        download-photo
                        "
                        data-id="${photo.id}"
                    >

                        ⬇

                    </button>

                    <button
                        class="
                        delete-photo
                        "
                        data-id="${photo.id}"
                    >

                        🗑

                    </button>

                </div>

            </div>

        `
        )
        .join("");

    bindGalleryEvents();

}

/* ==========================================================
   EVENTS
========================================================== */

function bindGalleryEvents() {

    document
    .querySelectorAll(
        ".favorite-photo"
    )
    .forEach(
        btn => {

            btn.onclick =
            () => {

                toggleFavorite(
                    btn.dataset.id
                );

            };

        }
    );

    document
    .querySelectorAll(
        ".delete-photo"
    )
    .forEach(
        btn => {

            btn.onclick =
            () => {

                deletePhoto(
                    btn.dataset.id
                );

            };

        }
    );

    document
    .querySelectorAll(
        ".download-photo"
    )
    .forEach(
        btn => {

            btn.onclick =
            () => {

                const photo =
                    getPhotos()
                    .find(
                        p =>
                        p.id ==
                        btn.dataset.id
                    );

                if (photo) {

                    downloadPhoto(
                        photo.image
                    );

                }

            };

        }
    );

    document
    .querySelectorAll(
        ".polaroid-image"
    )
    .forEach(
        image => {

            image.onclick =
            () => {

                openPhotoModal(
                    image.src
                );

            };

        }
    );

}

/* ==========================================================
   FILE INPUT
========================================================== */

function bindUpload() {

    const input =
        document.getElementById(
            "galleryUpload"
        );

    if (!input)
        return;

    input.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            addPhoto(
                file
            );

        }
    );

}

/* ==========================================================
   TOAST
========================================================== */

function showToastSafe(
    message
) {

    if (
        typeof window.showToast ===
        "function"
    ) {

        showToast(
            message
        );

    }

}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        bindUpload();

        renderGallery();

    }
);

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryGallery = {

    renderGallery,

    addPhoto,

    deletePhoto,

    toggleFavorite

};

})();