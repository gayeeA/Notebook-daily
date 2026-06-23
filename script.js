/* ==========================================================
   MYDIARY V3
   SCRIPT.JS — PART 1
   CORE APP FOUNDATION
========================================================== */

/* ==========================================================
   GLOBAL STORAGE KEYS
========================================================== */

const STORAGE_KEYS = {
    PASSWORD: "mydiary_password",
    SESSION: "mydiary_session",
    ACTIVE_JOURNAL: "mydiary_active_journal",
    DRAFT: "mydiary_draft"
};

/* ==========================================================
   JOURNALS
========================================================== */

const JOURNALS = [
    "personal",
    "work",
    "travel",
    "study",
    "dream"
];

/* ==========================================================
   APP STATE
========================================================== */

const state = {

    activeJournal:
        localStorage.getItem(
            STORAGE_KEYS.ACTIVE_JOURNAL
        ) || "personal",

    currentUser: null,

    entries: [],

    draft: {},

    analytics: {
        totalEntries: 0,
        totalWords: 0,
        streak: 0
    }

};

/* ==========================================================
   DOM REFERENCES
========================================================== */

const authScreen =
document.getElementById("authScreen");

const appShell =
document.getElementById("appShell");

const loginForm =
document.getElementById("loginForm");

const loginPassword =
document.getElementById("loginPassword");

const rememberMe =
document.getElementById("rememberMe");

const createPasswordBtn =
document.getElementById("createPasswordBtn");

const currentDate =
document.getElementById("currentDate");

const journalButtons =
document.querySelectorAll(
    ".journal-pill"
);

const workspaces =
document.querySelectorAll(
    ".workspace"
);

/* ==========================================================
   LOCAL STORAGE HELPERS
========================================================== */

function saveLocal(key, value){

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}

function loadLocal(key){

    const data =
    localStorage.getItem(key);

    if(!data) return null;

    try{
        return JSON.parse(data);
    }
    catch{
        return null;
    }

}

function removeLocal(key){

    localStorage.removeItem(key);

}

/* ==========================================================
   JOURNAL STORAGE
========================================================== */

function getJournalStorageKey(){

    return `mydiary_${state.activeJournal}`;

}

function getTrashStorageKey(){

    return `mydiary_${state.activeJournal}_trash`;

}

function getFavoritesStorageKey(){

    return `mydiary_${state.activeJournal}_favorites`;

}

/* ==========================================================
   PASSWORD SETUP
========================================================== */

function setupPassword(){

    const existingPassword =
    localStorage.getItem(
        STORAGE_KEYS.PASSWORD
    );

    if(existingPassword){

        showToast(
            "Password already exists",
            "error"
        );

        return;
    }

    const password =
    prompt(
        "Create your diary password"
    );

    if(!password){

        showToast(
            "Password required",
            "error"
        );

        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.PASSWORD,
        password
    );

    showToast(
        "Password created successfully",
        "success"
    );

}

createPasswordBtn?.addEventListener(
    "click",
    setupPassword
);

/* ==========================================================
   LOGIN SYSTEM
========================================================== */

function login(password){

    const savedPassword =
    localStorage.getItem(
        STORAGE_KEYS.PASSWORD
    );

    if(!savedPassword){

        showToast(
            "Create password first",
            "error"
        );

        return;
    }

    if(password !== savedPassword){

        showToast(
            "Invalid password",
            "error"
        );

        return;
    }

    if(rememberMe.checked){

        localStorage.setItem(
            STORAGE_KEYS.SESSION,
            "loggedin"
        );

    }

    authScreen.style.display =
    "none";

    appShell.hidden =
    false;

    showToast(
        "Welcome Back 🌸",
        "success"
    );

    initializeApp();

}

loginForm?.addEventListener(
    "submit",
    (e)=>{

        e.preventDefault();

        login(
            loginPassword.value.trim()
        );

    }
);

/* ==========================================================
   AUTO LOGIN
========================================================== */

function checkSession(){

    const session =
    localStorage.getItem(
        STORAGE_KEYS.SESSION
    );

    if(session === "loggedin"){

        authScreen.style.display =
        "none";

        appShell.hidden =
        false;

        initializeApp();

    }

}

/* ==========================================================
   LOGOUT
========================================================== */

function logout(){

    localStorage.removeItem(
        STORAGE_KEYS.SESSION
    );

    location.reload();

}

/* ==========================================================
   JOURNAL SWITCHING
========================================================== */

function switchJournal(journal){

    state.activeJournal =
    journal;

    localStorage.setItem(
        STORAGE_KEYS.ACTIVE_JOURNAL,
        journal
    );

    journalButtons.forEach(btn=>{

        btn.classList.remove(
            "active"
        );

        if(
            btn.dataset.journal ===
            journal
        ){

            btn.classList.add(
                "active"
            );

        }

    });

    workspaces.forEach(space=>{

        space.classList.remove(
            "active-workspace"
        );

    });

    const targetWorkspace =
    document.getElementById(
        `${journal}Workspace`
    );

    if(targetWorkspace){

        targetWorkspace.classList.add(
            "active-workspace"
        );

    }

    loadJournalEntries();

    updateAnalytics();

    showToast(
        `${capitalize(journal)} Journal Opened`,
        "success"
    );

}

journalButtons.forEach(btn=>{

    btn.addEventListener(
        "click",
        ()=>{

            switchJournal(
                btn.dataset.journal
            );

        }
    );

});

/* ==========================================================
   LOAD JOURNAL ENTRIES
========================================================== */

function loadJournalEntries(){

    state.entries =
        loadLocal(
            getJournalStorageKey()
        ) || [];

    if(
        typeof renderMemoryFeed ===
        "function"
    ){

        renderMemoryFeed();

    }

}

/* ==========================================================
   SAVE JOURNAL ENTRIES
========================================================== */

function saveJournalEntries(){

    saveLocal(
        getJournalStorageKey(),
        state.entries
    );

}

/* ==========================================================
   DATE
========================================================== */

function updateDate(){

    if(!currentDate) return;

    const today =
    new Date();

    currentDate.textContent =
    today.toLocaleDateString(
        "en-US",
        {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        }
    );

}

/* ==========================================================
   QUOTES
========================================================== */

const quotes = [

"Every memory matters.",

"The little moments become the big memories.",

"Collect moments, not things.",

"Your story deserves to be remembered.",

"Write what your heart cannot forget.",

"Life is made of beautiful memories."

];

function loadRandomQuote(){

    const quoteElement =
    document.getElementById(
        "dailyQuote"
    );

    if(!quoteElement) return;

    const random =
    quotes[
        Math.floor(
            Math.random() *
            quotes.length
        )
    ];

    quoteElement.textContent =
    random;

}

/* ==========================================================
   ANALYTICS FOUNDATION
========================================================== */

function updateAnalytics(){

    const entryCount =
    document.getElementById(
        "entryCount"
    );

    if(entryCount){

        entryCount.textContent =
        state.entries.length;

    }

}

/* ==========================================================
   APP INIT
========================================================== */

function initializeApp(){

    updateDate();

    loadRandomQuote();

    switchJournal(
        state.activeJournal
    );

}

/* ==========================================================
   UTILITIES
========================================================== */

function capitalize(text){

    return (
        text.charAt(0)
        .toUpperCase()
        +
        text.slice(1)
    );

}

/* ==========================================================
   APP START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        checkSession();

    }
);
/* ==========================================================
   MYDIARY V3
   SCRIPT.JS — PART 2
   EDITOR + AUTOSAVE + VOICE
========================================================== */

/* ==========================================================
   DOM REFERENCES
========================================================== */

const editor =
document.getElementById("editor");

const entryTitle =
document.getElementById("entryTitle");

const entryQuote =
document.getElementById("entryQuote");

const moodSelect =
document.getElementById("moodSelect");

const weatherSelect =
document.getElementById("weatherSelect");

const imageUpload =
document.getElementById("imageUpload");

const imageBtn =
document.getElementById("imageBtn");

const imagePreviewContainer =
document.getElementById(
    "imagePreviewContainer"
);

const wordCountEl =
document.getElementById(
    "wordCount"
);

const charCountEl =
document.getElementById(
    "charCount"
);

const readingTimeEl =
document.getElementById(
    "readingTime"
);

const saveStatusEl =
document.getElementById(
    "saveStatus"
);

const toolbarButtons =
document.querySelectorAll(
    ".toolbar button[data-command]"
);

/* ==========================================================
   DRAFT STATE
========================================================== */

let draftTimer = null;

let attachedImages = [];

/* ==========================================================
   WRITING STATS
========================================================== */

function updateWritingStats(){

    if(!editor) return;

    const text =
    editor.innerText || "";

    const trimmed =
    text.trim();

    const words =
    trimmed.length === 0
        ? 0
        : trimmed.split(/\s+/).length;

    const characters =
    text.length;

    const readingTime =
    Math.max(
        1,
        Math.ceil(words / 200)
    );

    if(wordCountEl){

        wordCountEl.textContent =
        `${words} Words`;

    }

    if(charCountEl){

        charCountEl.textContent =
        `${characters} Characters`;

    }

    if(readingTimeEl){

        readingTimeEl.textContent =
        `${readingTime} Min Read`;

    }

}

/* ==========================================================
   SAVE STATUS
========================================================== */

function setSaveStatus(text){

    if(!saveStatusEl) return;

    saveStatusEl.textContent =
    text;

}

/* ==========================================================
   DRAFT OBJECT
========================================================== */

function getDraftObject(){

    return {

        title:
            entryTitle?.value || "",

        quote:
            entryQuote?.value || "",

        mood:
            moodSelect?.value || "",

        weather:
            weatherSelect?.value || "",

        content:
            editor?.innerHTML || "",

        images:
            attachedImages,

        updatedAt:
            Date.now()

    };

}

/* ==========================================================
   AUTO SAVE DRAFT
========================================================== */

function autoSaveDraft(){

    clearTimeout(draftTimer);

    setSaveStatus(
        "Saving..."
    );

    draftTimer =
    setTimeout(()=>{

        const draft =
        getDraftObject();

        saveLocal(
            STORAGE_KEYS.DRAFT,
            draft
        );

        setSaveStatus(
            `Saved ${new Date().toLocaleTimeString()}`
        );

    },2000);

}

/* ==========================================================
   LOAD DRAFT
========================================================== */

function loadDraft(){

    const draft =
    loadLocal(
        STORAGE_KEYS.DRAFT
    );

    if(!draft) return;

    if(entryTitle){

        entryTitle.value =
        draft.title || "";

    }

    if(entryQuote){

        entryQuote.value =
        draft.quote || "";

    }

    if(moodSelect){

        moodSelect.value =
        draft.mood || "Happy";

    }

    if(weatherSelect){

        weatherSelect.value =
        draft.weather || "☀️ Sunny";

    }

    if(editor){

        editor.innerHTML =
        draft.content || "";

    }

    attachedImages =
        draft.images || [];

    renderImagePreview();

    updateWritingStats();

}

/* ==========================================================
   CLEAR DRAFT
========================================================== */

function clearDraft(){

    removeLocal(
        STORAGE_KEYS.DRAFT
    );

}

/* ==========================================================
   EDITOR EVENTS
========================================================== */

[
editor,
entryTitle,
entryQuote
].forEach(el=>{

    if(!el) return;

    el.addEventListener(
        "input",
        ()=>{

            updateWritingStats();

            autoSaveDraft();

        }
    );

});

/* ==========================================================
   IMAGE UPLOAD
========================================================== */

imageBtn?.addEventListener(
    "click",
    ()=>{

        imageUpload.click();

    }
);

imageUpload?.addEventListener(
    "change",
    handleImageUpload
);

function handleImageUpload(e){

    const file =
    e.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload = function(evt){

        attachedImages.push(
            evt.target.result
        );

        renderImagePreview();

        autoSaveDraft();

    };
    const imageId = `image-${Date.now()}`;
    reader.readAsDataURL(file);

}

function renderImagePreview(){

    if(!imagePreviewContainer)
        return;

    imagePreviewContainer.innerHTML =
    "";

    attachedImages.forEach(
        (src,index)=>{

            const wrapper =
            document.createElement(
                "div"
            );

            wrapper.style.position =
            "relative";

            const img =
            document.createElement(
                "img"
            );

            img.src = src;

            img.className =
            "preview-image";

            const removeBtn =
            document.createElement(
                "button"
            );

            removeBtn.innerHTML =
            "✕";

            removeBtn.style.position =
            "absolute";

            removeBtn.style.top =
            "8px";

            removeBtn.style.right =
            "8px";

            removeBtn.style.border =
            "none";

            removeBtn.style.width =
            "30px";

            removeBtn.style.height =
            "30px";

            removeBtn.style.borderRadius =
            "50%";

            removeBtn.style.cursor =
            "pointer";

            removeBtn.addEventListener(
                "click",
                ()=>{

                    attachedImages.splice(
                        index,
                        1
                    );

                    renderImagePreview();

                    autoSaveDraft();

                }
            );

            wrapper.appendChild(img);

            wrapper.appendChild(
                removeBtn
            );

            imagePreviewContainer.appendChild(
                wrapper
            );

        }
    );

}

/* ==========================================================
   TOOLBAR
========================================================== */

toolbarButtons.forEach(btn=>{

    btn.addEventListener(
        "click",
        ()=>{

            const command =
            btn.dataset.command;

            applyFormatting(
                command
            );

        }
    );

});

function applyFormatting(command){

    editor.focus();

    switch(command){

        case "bold":
            document.execCommand(
                "bold"
            );
            break;

        case "italic":
            document.execCommand(
                "italic"
            );
            break;

        case "underline":
            document.execCommand(
                "underline"
            );
            break;

        case "bullet":
            document.execCommand(
                "insertUnorderedList"
            );
            break;

        case "h1":

            document.execCommand(
                "formatBlock",
                false,
                "h1"
            );

            break;

        case "h2":

            document.execCommand(
                "formatBlock",
                false,
                "h2"
            );

            break;

        case "quote":

            document.execCommand(
                "formatBlock",
                false,
                "blockquote"
            );

            break;

        case "checklist":

            document.execCommand(
                "insertHTML",
                false,
                `<div>☐ Checklist Item</div>`
            );

            break;

    }

}

/* ==========================================================
   VOICE RECOGNITION
========================================================== */

let recognition = null;

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(SpeechRecognition){

    recognition =
    new SpeechRecognition();

    recognition.continuous =
    false;

    recognition.interimResults =
    false;

    recognition.lang =
    "en-US";

    recognition.onstart =
    ()=>{

        setSaveStatus(
            "🎤 Listening..."
        );

    };

    recognition.onresult =
    (event)=>{

        const transcript =
        event.results[
            event.results.length - 1
        ][0].transcript;

        insertTextAtCursor(
            transcript
        );

        setSaveStatus(
            "✓ Voice Added"
        );

        updateWritingStats();

        autoSaveDraft();

    };

    recognition.onerror =
    ()=>{

        showToast(
            "Voice recognition failed",
            "error"
        );

    };

    recognition.onend =
    ()=>{

        setSaveStatus(
            "Ready"
        );

    };

}

document
.getElementById("voiceBtn")
?.addEventListener(
    "click",
    ()=>{

        if(!recognition){

            showToast(
                "Voice not supported in this browser",
                "error"
            );

            return;
        }

        recognition.start();

    }
);

/* ==========================================================
   INSERT TEXT AT CURSOR
========================================================== */

function insertTextAtCursor(text){

    editor.focus();

    document.execCommand(
        "insertText",
        false,
        " " + text
    );

}

/* ==========================================================
   CLEAR EDITOR
========================================================== */

document
.getElementById(
    "clearEntryBtn"
)
?.addEventListener(
    "click",
    ()=>{

        if(
            !confirm(
                "Clear current entry?"
            )
        ){
            return;
        }

        entryTitle.value = "";

        entryQuote.value = "";

        editor.innerHTML = "";

        attachedImages = [];

        renderImagePreview();

        updateWritingStats();

        clearDraft();

        showToast(
            "Draft Cleared",
            "success"
        );

    }
);

/* ==========================================================
   PART 2 INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        loadDraft();

        updateWritingStats();

    }
);
/* ==========================================================
   MYDIARY V3
   SCRIPT.JS — PART 3
   SAVE ENTRY + MEMORY FEED + MODAL
========================================================== */

/* ==========================================================
   DOM REFERENCES
========================================================== */

const saveEntryBtn =
document.getElementById(
    "saveEntryBtn"
);

const memoryFeed =
document.getElementById(
    "memoryFeed"
);

const emptyState =
document.getElementById(
    "emptyState"
);

const searchInput =
document.getElementById(
    "searchInput"
);

const memoryModal =
document.getElementById(
    "memoryModal"
);

const modalBody =
document.getElementById(
    "modalBody"
);

const closeModalBtn =
document.getElementById(
    "closeModal"
);

/* ==========================================================
   ENTRY CREATION
========================================================== */

function createEntryObject(){

    const content =
    editor.innerHTML.trim();

    const plainText =
    editor.innerText.trim();

    const wordCount =
    plainText.length === 0
        ? 0
        : plainText.split(/\s+/).length;

    return {

        id:
            Date.now(),

        journal:
            state.activeJournal,

        title:
            entryTitle.value.trim(),

        quote:
            entryQuote.value.trim(),

        mood:
            moodSelect.value,

        weather:
            weatherSelect.value,

        content,

        plainText,

        images:
            [...attachedImages],

        favorite:
            false,

        pinned:
            false,

        trashed:
            false,

        wordCount,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

}

/* ==========================================================
   VALIDATION
========================================================== */

function validateEntry(){

    const title =
    entryTitle.value.trim();

    const content =
    editor.innerText.trim();

    if(!title){

        showToast(
            "Please enter a title",
            "error"
        );

        return false;
    }

    if(!content){

        showToast(
            "Please write something",
            "error"
        );

        return false;
    }

    return true;

}

/* ==========================================================
   SAVE ENTRY
========================================================== */

function saveEntry(){

    if(!validateEntry())
        return;

    const entry =
    createEntryObject();

    state.entries.unshift(
        entry
    );

    saveJournalEntries();

    renderMemoryFeed();

    clearDraft();

    clearEditorAfterSave();

    updateAnalytics();

    showToast(
        "✓ Entry Saved",
        "success"
    );

}

/* ==========================================================
   SAVE BUTTON
========================================================== */

saveEntryBtn?.addEventListener(
    "click",
    saveEntry
);

/* ==========================================================
   CLEAR EDITOR AFTER SAVE
========================================================== */

function clearEditorAfterSave(){

    entryTitle.value = "";

    entryQuote.value = "";

    editor.innerHTML = "";

    attachedImages = [];

    renderImagePreview();

    updateWritingStats();

}

/* ==========================================================
   MEMORY FEED
========================================================== */

function renderMemoryFeed(){

    if(!memoryFeed)
        return;

    memoryFeed.innerHTML = "";

    const visibleEntries =
    state.entries.filter(
        entry => !entry.trashed
    );

    if(
        visibleEntries.length === 0
    ){

        if(emptyState)
            emptyState.style.display =
            "block";

        return;
    }

    if(emptyState)
        emptyState.style.display =
        "none";

    const sortedEntries =
    [...visibleEntries]
    .sort((a,b)=>{

        if(a.pinned && !b.pinned)
            return -1;

        if(!a.pinned && b.pinned)
            return 1;

        return (
            new Date(b.createdAt)
            -
            new Date(a.createdAt)
        );

    });

    sortedEntries.forEach(
        entry=>{

            const card =
            createMemoryCard(
                entry
            );

            memoryFeed.appendChild(
                card
            );

        }
    );

}

/* ==========================================================
   MEMORY CARD
========================================================== */

function createMemoryCard(entry){

    const card =
    document.createElement(
        "div"
    );

    card.className =
    "memory-card";

    let imageHTML = "";

    if(
        entry.images &&
        entry.images.length > 0
    ){

        const randomClass =
        ["small","medium","large"][
            Math.floor(
                Math.random()*3
            )
        ];

        imageHTML = `
        <img
            src="${entry.images[0]}"
            class="card-image ${randomClass}"
        >
        `;
    }

    card.innerHTML = `

        ${imageHTML}

        <div class="card-body">

            <div class="
                mood-badge
                mood-${entry.mood.toLowerCase()}
            ">
                ${entry.mood}
            </div>

            <div class="card-title">
                ${escapeHTML(
                    entry.title
                )}
            </div>

            <div class="card-date">
                ${formatDate(
                    entry.createdAt
                )}
            </div>

            <div class="card-preview">
                ${truncateText(
                    entry.plainText,
                    120
                )}
            </div>

            <div class="card-actions">

                <button
                    class="action-btn favorite-btn"
                    data-id="${entry.id}"
                >
                    ${entry.favorite ? "⭐" : "☆"}
                </button>

                <button
                    class="action-btn pin-btn"
                    data-id="${entry.id}"
                >
                    ${entry.pinned ? "📌" : "📍"}
                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${entry.id}"
                >
                    🗑
                </button>

            </div>

        </div>

    `;

    card.addEventListener(
        "click",
        (e)=>{

            if(
                e.target.classList.contains(
                    "action-btn"
                )
            ){
                return;
            }

            openEntryModal(
                entry.id
            );

        }
    );

    setupCardActions(
        card,
        entry.id
    );

    return card;

}

/* ==========================================================
   CARD ACTIONS
========================================================== */

function setupCardActions(
    card,
    entryId
){

    const favBtn =
    card.querySelector(
        ".favorite-btn"
    );

    const pinBtn =
    card.querySelector(
        ".pin-btn"
    );

    const deleteBtn =
    card.querySelector(
        ".delete-btn"
    );

    favBtn?.addEventListener(
        "click",
        ()=>{

            toggleFavorite(
                entryId
            );

        }
    );

    pinBtn?.addEventListener(
        "click",
        ()=>{

            togglePin(
                entryId
            );

        }
    );

    deleteBtn?.addEventListener(
        "click",
        ()=>{

            moveToTrash(
                entryId
            );

        }
    );

}

/* ==========================================================
   SEARCH
========================================================== */

searchInput?.addEventListener(
    "input",
    ()=>{

        const query =
        searchInput.value
        .toLowerCase()
        .trim();

        if(!query){

            renderMemoryFeed();

            return;
        }

        const results =
        state.entries.filter(
            entry =>

            entry.title
            .toLowerCase()
            .includes(query)

            ||

            entry.plainText
            .toLowerCase()
            .includes(query)

            ||

            entry.mood
            .toLowerCase()
            .includes(query)
        );

        renderFilteredFeed(
            results
        );

    }
);

/* ==========================================================
   FILTERED FEED
========================================================== */

function renderFilteredFeed(
    entries
){

    memoryFeed.innerHTML = "";

    entries.forEach(
        entry=>{

            memoryFeed.appendChild(
                createMemoryCard(
                    entry
                )
            );

        }
    );

}

/* ==========================================================
   MODAL
========================================================== */

function openEntryModal(
    entryId
){

    const entry =
    state.entries.find(
        item =>
        item.id === entryId
    );

    if(!entry)
        return;

    let imageHTML = "";

    if(
        entry.images &&
        entry.images.length
    ){

        imageHTML =
        entry.images.map(
            src=>`
            <img
                src="${src}"
                style="
                    width:100%;
                    border-radius:20px;
                    margin-bottom:15px;
                "
            >
            `
        ).join("");

    }

    modalBody.innerHTML = `

        <h1>
            ${escapeHTML(
                entry.title
            )}
        </h1>

        <p>
            ${formatDate(
                entry.createdAt
            )}
        </p>

        <br>

        ${imageHTML}

        <div>
            ${entry.content}
        </div>

    `;

    memoryModal.classList.add(
        "show"
    );

}

/* ==========================================================
   CLOSE MODAL
========================================================== */

closeModalBtn?.addEventListener(
    "click",
    ()=>{

        memoryModal.classList.remove(
            "show"
        );

    }
);

memoryModal?.addEventListener(
    "click",
    (e)=>{

        if(
            e.target === memoryModal
        ){

            memoryModal.classList.remove(
                "show"
            );

        }

    }
);

/* ==========================================================
   FAVORITE
========================================================== */

function toggleFavorite(id){

    const entry =
    state.entries.find(
        item=>item.id===id
    );

    if(!entry) return;

    entry.favorite =
    !entry.favorite;

    saveJournalEntries();

    renderMemoryFeed();

}

/* ==========================================================
   PIN
========================================================== */

function togglePin(id){

    const entry =
    state.entries.find(
        item=>item.id===id
    );

    if(!entry) return;

    entry.pinned =
    !entry.pinned;

    saveJournalEntries();

    renderMemoryFeed();

}

/* ==========================================================
   TRASH
========================================================== */

function moveToTrash(id){

    const entry =
    state.entries.find(
        item=>item.id===id
    );

    if(!entry) return;

    if(
        !confirm(
            "Move entry to trash?"
        )
    ){
        return;
    }

    entry.trashed = true;

    saveJournalEntries();

    renderMemoryFeed();

    showToast(
        "Moved to Trash",
        "success"
    );

}

/* ==========================================================
   UTILITIES
========================================================== */

function truncateText(
    text,
    max
){

    if(
        text.length <= max
    ){
        return text;
    }

    return (
        text.substring(
            0,
            max
        ) + "..."
    );

}

function formatDate(date){

    return new Date(date)
    .toLocaleDateString(
        "en-US",
        {
            month:"long",
            day:"numeric",
            year:"numeric"
        }
    );

}

function escapeHTML(text){

    const div =
    document.createElement(
        "div"
    );

    div.textContent =
    text;

    return div.innerHTML;

}

/* ==========================================================
   LOAD FEED ON INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        loadJournalEntries();

    }
);
/* ==========================================================
   MYDIARY V3
   SCRIPT.JS — PART 4
   TOASTS + ANALYTICS + BACKUPS + SETTINGS
========================================================== */

/* ==========================================================
   TOAST SYSTEM
========================================================== */

function showToast(
    message,
    type = "success"
){

    const container =
    document.getElementById(
        "toastContainer"
    );

    if(!container) return;

    const toast =
    document.createElement(
        "div"
    );

    toast.className =
    `toast ${type}`;

    toast.textContent =
    message;

    container.appendChild(
        toast
    );

    setTimeout(()=>{

        toast.style.opacity = "0";
        toast.style.transform =
        "translateX(60px)";

        setTimeout(()=>{

            toast.remove();

        },300);

    },3000);

}

/* ==========================================================
   ANALYTICS HELPERS
========================================================== */

function calculateTotalWords(){

    return state.entries.reduce(
        (total, entry)=>{

            return (
                total +
                (entry.wordCount || 0)
            );

        },
        0
    );

}

function calculateMostUsedMood(){

    if(
        state.entries.length === 0
    ){
        return "None";
    }

    const moods = {};

    state.entries.forEach(
        entry=>{

            moods[
                entry.mood
            ] =
            (moods[
                entry.mood
            ] || 0) + 1;

        }
    );

    let winner = "";
    let count = 0;

    Object.keys(moods)
    .forEach(mood=>{

        if(
            moods[mood] > count
        ){

            winner = mood;
            count =
            moods[mood];

        }

    });

    return winner;

}

/* ==========================================================
   WRITING STREAK
========================================================== */

function calculateStreak(){

    if(
        state.entries.length === 0
    ){
        return 0;
    }

    const dates =
    state.entries
    .map(entry=>
        new Date(
            entry.createdAt
        )
        .toDateString()
    );

    const uniqueDates =
    [...new Set(dates)]
    .sort(
        (
            a,
            b
        )=>
        new Date(b)
        -
        new Date(a)
    );

    let streak = 1;

    for(
        let i = 0;
        i <
        uniqueDates.length - 1;
        i++
    ){

        const current =
        new Date(
            uniqueDates[i]
        );

        const next =
        new Date(
            uniqueDates[i+1]
        );

        const diff =
        (
            current -
            next
        ) /
        (
            1000*
            60*
            60*
            24
        );

        if(diff === 1){

            streak++;

        }
        else{

            break;

        }

    }

    return streak;

}

/* ==========================================================
   UPDATE ANALYTICS UI
========================================================== */

function updateAnalytics(){

    const totalEntries =
    state.entries.filter(
        e => !e.trashed
    ).length;

    const totalWords =
    calculateTotalWords();

    const mood =
    calculateMostUsedMood();

    const streak =
    calculateStreak();

    const entryCount =
    document.getElementById(
        "entryCount"
    );

    const streakCount =
    document.getElementById(
        "streakCount"
    );

    const memoryStreak =
    document.getElementById(
        "memoryStreak"
    );

    if(entryCount){

        entryCount.textContent =
        totalEntries;

    }

    if(streakCount){

        streakCount.textContent =
        `${streak}🔥`;

    }

    if(memoryStreak){

        memoryStreak.textContent =
        `${streak} Days`;

    }

    state.analytics = {

        totalEntries,
        totalWords,
        mood,
        streak

    };

}

/* ==========================================================
   FAVORITES
========================================================== */

function getFavoriteEntries(){

    return state.entries.filter(
        entry =>
        entry.favorite &&
        !entry.trashed
    );

}

function showFavorites(){

    const favorites =
    getFavoriteEntries();

    renderFilteredFeed(
        favorites
    );

    showToast(
        "Showing Favorites",
        "success"
    );

}

/* ==========================================================
   TRASH
========================================================== */

function getTrashEntries(){

    return state.entries.filter(
        entry =>
        entry.trashed
    );

}

function showTrash(){

    const trash =
    getTrashEntries();

    renderFilteredFeed(
        trash
    );

    showToast(
        "Trash Opened",
        "success"
    );

}

/* ==========================================================
   RESTORE FROM TRASH
========================================================== */

function restoreEntry(id){

    const entry =
    state.entries.find(
        item =>
        item.id === id
    );

    if(!entry) return;

    entry.trashed =
    false;

    saveJournalEntries();

    renderMemoryFeed();

    showToast(
        "Entry Restored",
        "success"
    );

}

/* ==========================================================
   EXPORT JSON
========================================================== */

function exportJSON(){

    const data = {

        exportedAt:
        new Date()
        .toISOString(),

        journal:
        state.activeJournal,

        entries:
        state.entries

    };

    const blob =
    new Blob(
        [
            JSON.stringify(
                data,
                null,
                2
            )
        ],
        {
            type:
            "application/json"
        }
    );

    const url =
    URL.createObjectURL(
        blob
    );

    const link =
    document.createElement(
        "a"
    );

    link.href = url;

    link.download =
    `${state.activeJournal}-backup.json`;

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Backup Exported",
        "success"
    );

}

/* ==========================================================
   IMPORT JSON
========================================================== */

function importJSON(file){

    const reader =
    new FileReader();

    reader.onload =
    function(event){

        try{

            const data =
            JSON.parse(
                event.target.result
            );

            if(
                !Array.isArray(
                    data.entries
                )
            ){

                throw new Error();

            }

            state.entries =
            data.entries;

            saveJournalEntries();

            renderMemoryFeed();

            updateAnalytics();

            showToast(
                "Backup Imported",
                "success"
            );

        }
        catch{

            showToast(
                "Invalid Backup File",
                "error"
            );

        }

    };

    reader.readAsText(
        file
    );

}

/* ==========================================================
   THEME SYSTEM
========================================================== */

const THEME_KEY =
"mydiary_theme";

function saveTheme(theme){

    localStorage.setItem(
        THEME_KEY,
        theme
    );

}

function loadTheme(){

    const theme =
    localStorage.getItem(
        THEME_KEY
    ) || "light";

    document.body
    .setAttribute(
        "data-theme",
        theme
    );

}

function toggleTheme(){

    const current =
    document.body
    .getAttribute(
        "data-theme"
    ) || "light";

    const next =
    current === "light"
        ? "dark"
        : "light";

    document.body
    .setAttribute(
        "data-theme",
        next
    );

    saveTheme(next);

    showToast(
        `${capitalize(next)} Theme Enabled`,
        "success"
    );

}

/* ==========================================================
   GLOBAL SHORTCUTS
========================================================== */

document.addEventListener(
    "keydown",
    (e)=>{

        const saveShortcut =
        (
            e.ctrlKey ||
            e.metaKey
        ) &&
        e.key.toLowerCase()
        === "s";

        if(saveShortcut){

            e.preventDefault();

            if(
                typeof saveEntry
                === "function"
            ){

                saveEntry();

            }

        }

    }
);

/* ==========================================================
   AUTO ANALYTICS REFRESH
========================================================== */

function refreshDashboard(){

    updateAnalytics();

}

/* ==========================================================
   FINAL APP INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        loadTheme();

        loadJournalEntries();

        updateAnalytics();

        refreshDashboard();

    }
);

/* ==========================================================
   DEBUG HELPERS
========================================================== */

window.MyDiary = {

    state,

    exportJSON,

    toggleTheme,

    showFavorites,

    showTrash,

    restoreEntry,

    logout

};

console.log(
    "📖 MyDiary V3 Loaded"
);