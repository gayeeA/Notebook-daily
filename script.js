/* ==========================================================
   MYDIARY V3
   SCRIPT.JS â€” PART 1
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

const JOURNAL_SHEET_NAME_MAP = {
    personal: "Personal",
    work: "Work",
    travel: "Travel",
    study: "Study",
    dream: "Dreams",
};

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

window.state = state;

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

function getJournalStorageKeyFor(journal){

    return `mydiary_${journal}`;

}

function getJournalStorageKey(){

    return getJournalStorageKeyFor(
        state.activeJournal
    );

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

    sessionStorage.setItem(
        STORAGE_KEYS.SESSION,
        "loggedin"
    );

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
        "Welcome Back 🧸ིྀ",
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
    ) ||
    sessionStorage.getItem(
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

    sessionStorage.removeItem(
        STORAGE_KEYS.SESSION
    );

    location.reload();

}
document
.getElementById("logoutBtn")
?.addEventListener(
    "click",
    logout
);

document
.getElementById("exportJSONBtn")
?.addEventListener(
    "click",
    exportJSON
);

document
.getElementById("importJSONBtn")
?.addEventListener(
    "click",
    ()=>{
        document
        .getElementById(
            "importJSONFile"
        )
        ?.click();
    }
);

document
.getElementById("importJSONFile")
?.addEventListener(
    "change",
    (event)=>{
        const file =
            event.target.files &&
            event.target.files[0];

        if(file){
            importJSON(file);
        }

        event.target.value = "";
    }
);

document
.getElementById("themeToggleBtn")
?.addEventListener(
    "click",
    toggleTheme
);

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

            if(
                appShell &&
                appShell.hidden === false
            ){

                sessionStorage.setItem(
                    STORAGE_KEYS.SESSION,
                    "loggedin"
                );

            }

            switchJournal(
                btn.dataset.journal
            );

        }
    );

});

function getPageContext(){

    const body = document.body;

    return {
        page: body?.dataset.page || "diary",
        journal: body?.dataset.journal || null
    };

}

function setActiveLinks(page, journal){

    document
    .querySelectorAll(".nav-item")
    .forEach(link=>{

        link.classList.toggle(
            "active",
            link.dataset.view === page
        );

    });

    document
    .querySelectorAll(".journal-pill")
    .forEach(link=>{

        link.classList.toggle(
            "active",
            link.dataset.journal === journal
        );

    });

}

function initializeCurrentPage(){

    const context =
        getPageContext();

    const journal =
        context.journal ||
        state.activeJournal;

    if(context.journal){

        state.activeJournal =
        context.journal;

        localStorage.setItem(
            STORAGE_KEYS.ACTIVE_JOURNAL,
            context.journal
        );

    }

    switchJournal(journal);

    if(context.page !== "diary"){

        showView(context.page);

    }

    setActiveLinks(
        context.page,
        journal
    );

    if(context.page === "favorites"){

        renderFavoritesPage();

    }

    if(context.page === "trash"){

        renderTrashPage();

    }

    if(
        context.page === "calendar" &&
        window.MyDiaryCalendar
    ){

        window.MyDiaryCalendar.refreshCalendar();

    }

}

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

function loadEntriesForJournal(journal){

    return loadLocal(
        getJournalStorageKeyFor(journal)
    ) || [];

}

function saveEntriesForJournal(journal, entries){

    saveLocal(
        getJournalStorageKeyFor(journal),
        entries
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
   APP INIT
========================================================== */

function initializeApp(){

    updateDate();

    loadRandomQuote();
    loadDraft();
    initializeCurrentPage();

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
   SCRIPT.JS â€” PART 2
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

const entryJournalSelect =
document.getElementById("entryJournalSelect");

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

        journal:
            entryJournalSelect?.value || "personal",

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

    if(entryJournalSelect){

        entryJournalSelect.value =
        draft.journal || state.activeJournal;

    }

    if(moodSelect){

        moodSelect.value =
        draft.mood || "Happy";

    }

    if(weatherSelect){

        weatherSelect.value =
        draft.weather || "â˜€ï¸ Sunny";

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
entryQuote,
entryJournalSelect
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
            "âœ•";

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
                `<div>â˜ Checklist Item</div>`
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

    recognition.continuous =true;

    recognition.interimResults = false;

    recognition.lang =
    "en-US";

    recognition.onstart =
    ()=>{

        setSaveStatus(
            "ðŸŽ¤ Listening..."
        );

    };

let finalTranscript = "";

recognition.onresult = (event) => {

    let transcript = "";

    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {

        const result =
            event.results[i];

        if (result.isFinal) {

            transcript +=
                result[0].transcript + " ";

        }

    }

    transcript =
        transcript.trim();

    if (!transcript.length)
        return;

    insertTextAtCursor(
        transcript
    );

    setSaveStatus(
        "âœ“ Voice Added"
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

    const selection =
        window.getSelection();

    if (
        !selection ||
        selection.rangeCount === 0
    ) {

        editor.innerHTML +=
            " " + text;

        return;
    }

    const range =
        selection.getRangeAt(0);

    range.deleteContents();

    range.insertNode(
        document.createTextNode(
            " " + text
        )
    );

    range.collapse(false);

    selection.removeAllRanges();

    selection.addRange(range);

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

        resetEntryJournalSelect();

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
   SCRIPT.JS â€” PART 3
   SAVE ENTRY + MEMORY FEED + MODAL
========================================================== */

/* ==========================================================
   DOM REFERENCES
========================================================== */

const saveEntryBtn =
document.getElementById(
    "saveEntryBtn"
);

const syncPersonalBtn =
document.getElementById(
    "syncPersonalBtn"
);

const syncWorkBtn =
document.getElementById(
    "syncWorkBtn"
);

const syncTravelBtn =
document.getElementById(
    "syncTravelBtn"
);

const syncStudyBtn =
document.getElementById(
    "syncStudyBtn"
);

const syncDreamBtn =
document.getElementById(
    "syncDreamBtn"
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
            entryJournalSelect?.value || state.activeJournal,

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

function getSheetNameForJournal(journal){
    return JOURNAL_SHEET_NAME_MAP[journal] || capitalize(journal);
}

function getCloudSheetRow(entry){
    return [
        entry.createdAt,
        entry.title,
        entry.mood,
        entry.weather,
        entry.plainText,
        "",
        "",
    ];
}

function dataURLToBlob(dataURL){
    const parts = dataURL.split(",");
    const mimeMatch = parts[0].match(/data:(.*?);/);
    const raw = atob(parts[1] || "");
    const buffer = new Uint8Array(raw.length);

    for(let i = 0; i < raw.length; i++){
        buffer[i] = raw.charCodeAt(i);
    }

    return new Blob([buffer], {
        type: mimeMatch ? mimeMatch[1] : "application/octet-stream",
    });
}

function getDriveFileName(entry, mimeType, index){
    const safeTitle = entry.title
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .slice(0, 40) || "diary-entry";
    const extension = mimeType.split("/")[1] || "png";
    return `${safeTitle}-${index + 1}.${extension}`;
}

async function saveEntryToCloud(entry){
    if(typeof logRow !== "function"){
        throw new Error("Cloud sync helper is not loaded.");
    }

    const sheetName = getSheetNameForJournal(
        entry.journal || state.activeJournal
    );

    let webViewLink = "";
    let webContentLink = "";

    if(entry.images && entry.images.length > 0){
        const firstImage = entry.images.find(
            (image) => typeof image === "string" && image.startsWith("data:")
        );

        if(firstImage){
            const blob = dataURLToBlob(firstImage);
            const fileName = getDriveFileName(entry, blob.type, 0);
            const file = new File([blob], fileName, { type: blob.type });
            const uploadResult = await uploadDeliveryFile(file);

            webViewLink = uploadResult.webViewLink || "";
            webContentLink = uploadResult.webContentLink || "";
        }
    }

    await logRow(sheetName, [
        entry.createdAt,
        entry.title,
        entry.mood,
        entry.weather,
        entry.plainText,
        webViewLink,
        webContentLink,
    ]);

    return { webViewLink, webContentLink };
}

async function syncJournalToCloud(journal){
    if(typeof logRow !== "function"){
        showToast("Cloud sync helper is not loaded.", "error");
        return;
    }

    const rows = loadEntriesForJournal(journal);
    if(!rows.length){
        showToast(
            `No entries found for ${capitalize(journal)}.`,
            "warning"
        );
        return;
    }

    const sheetName = getSheetNameForJournal(journal);
    showToast(
        `Syncing ${rows.length} ${capitalize(journal)} entries to ${sheetName}...`,
        "info"
    );

    let successCount = 0;
    const errors = [];

    for(const entry of rows){
        try {
            await logRow(sheetName, getCloudSheetRow(entry));
            successCount += 1;
        } catch (err) {
            console.error(`Sync failed for ${journal}:`, err);
            errors.push(err.message || err.toString());
        }
    }

    if(errors.length === 0){
        showToast(
            `Synced ${successCount} ${capitalize(journal)} entries to ${sheetName}.`,
            "success"
        );
    } else {
        showToast(
            `Synced ${successCount} entries; ${errors.length} failed.`,
            "warning"
        );
    }
}

// Cloud sync UI wiring
if (typeof window.cloudSyncEnabled === "undefined") {
    window.cloudSyncEnabled = true;
}

function updateCloudStatusUI(){
    const statusEl = document.getElementById("cloudSyncStatus");
    const toggle = document.getElementById("cloudSyncToggle");
    const available = (typeof logRow === "function" && typeof uploadDeliveryFile === "function");

    if(toggle){
        toggle.checked = !!window.cloudSyncEnabled;
    }

    if(!statusEl) return;

    if(!available){
        statusEl.textContent = "Cloud: unavailable";
        statusEl.classList.add("cloud-unavailable");
        statusEl.classList.remove("cloud-enabled","cloud-disabled");
        return;
    }

    if(window.cloudSyncEnabled){
        statusEl.textContent = "Cloud: enabled";
        statusEl.classList.add("cloud-enabled");
        statusEl.classList.remove("cloud-disabled","cloud-unavailable");
    } else {
        statusEl.textContent = "Cloud: disabled";
        statusEl.classList.add("cloud-disabled");
        statusEl.classList.remove("cloud-enabled","cloud-unavailable");
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    const toggle = document.getElementById("cloudSyncToggle");
    if(toggle){
        toggle.addEventListener("change", (e)=>{
            window.cloudSyncEnabled = !!e.target.checked;
            updateCloudStatusUI();
        });
    }

    syncPersonalBtn?.addEventListener(
        "click",
        ()=> syncJournalToCloud("personal")
    );

    syncWorkBtn?.addEventListener(
        "click",
        ()=> syncJournalToCloud("work")
    );

    syncTravelBtn?.addEventListener(
        "click",
        ()=> syncJournalToCloud("travel")
    );

    syncStudyBtn?.addEventListener(
        "click",
        ()=> syncJournalToCloud("study")
    );

    syncDreamBtn?.addEventListener(
        "click",
        ()=> syncJournalToCloud("dream")
    );

    // Call once to set initial state
    setTimeout(updateCloudStatusUI, 100);
});

/* ==========================================================
   SAVE ENTRY
========================================================== */

async function saveEntry(){

    if(!validateEntry())
        return;

    const entry =
    createEntryObject();

    const targetJournal =
    entry.journal || state.activeJournal;

    const targetEntries =
    loadEntriesForJournal(
        targetJournal
    );

    targetEntries.unshift(
        entry
    );

    saveEntriesForJournal(
        targetJournal,
        targetEntries
    );

    if(targetJournal === state.activeJournal){

        state.entries =
        targetEntries;

    }
    else{

        loadJournalEntries();

    }

    renderMemoryFeed();

    clearDraft();

    clearEditorAfterSave();

    updateAnalytics();

    const cloudAvailable =
        typeof logRow === "function" &&
        typeof uploadDeliveryFile === "function";
    const cloudEnabled = cloudAvailable && !!window.cloudSyncEnabled;

    if(cloudEnabled){
        try {
            const result = await saveEntryToCloud(entry);
            const message = result.webViewLink
                ? "Saved locally and cloud-synced to Sheets + Drive"
                : "Saved locally and synced row to Sheets";
            showToast(message, "success");
        } catch (err) {
            console.error(err);
            showToast(`Saved locally. Cloud sync failed: ${err.message}`, "warning");
        }
    } else {
        showToast(
            `Entry saved to ${capitalize(targetJournal)}`,
            "success"
        );
    }

}

function resetEntryJournalSelect(){

    if(entryJournalSelect){

        entryJournalSelect.value =
        state.activeJournal;

    }

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

    resetEntryJournalSelect();

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
                    ${entry.favorite ? "❤️" : "❤︎"}
                </button>

                <button
                    class="action-btn pin-btn"
                    data-id="${entry.id}"
                >
                    ${entry.pinned ? "📌" : "⚲"}
                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${entry.id}"
                >
                    🗑️
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
   SCRIPT.JS â€” PART 4
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
            entryJournalSelect?.value || state.activeJournal,

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

document.dispatchEvent(
new Event("entrySaved")
);

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
    "˚˖𓍢ִ໋🌷͙֒✧˚.🎀༘⋆ MyDiary V3 Loaded"
);
document
.getElementById(
    "exportDiaryPDF"
)
?.addEventListener(
    "click",
    () => {

        MyDiaryPDF
        .exportAllEntriesPDF();

    }
);

document
.getElementById(
    "exportJournalPDF"
)
?.addEventListener(
    "click",
    () => {

        MyDiaryPDF
        .exportJournalPDF();

    }
);

document
.getElementById(
    "exportFavoritesPDF"
)
?.addEventListener(
    "click",
    () => {

        MyDiaryPDF
        .exportFavoritesPDF();

    }
);
document.querySelectorAll(".nav-item")
.forEach(btn => {

    btn.addEventListener("click", (e) => {

        const href = btn.getAttribute("href");

        if (!href || href === "#" || href === "javascript:void(0)") {
            e.preventDefault();
        }

        if(
            appShell &&
            appShell.hidden === false
        ){

            sessionStorage.setItem(
                STORAGE_KEYS.SESSION,
                "loggedin"
            );

        }

        const view =
            btn.dataset.view;

        showView(view);

    });

});
function showView(view){

const sections = [

"personalWorkspace",
"calendarWorkspace",
"favoritesWorkspace",
"trashWorkspace",
"settingsWorkspace"

];

sections.forEach(id=>{

const el = document.getElementById(id);

if(el){

el.hidden = true;

el.classList.remove("active-workspace");

}

});

let target = null;

switch(view){

case "diary":
target =
document.getElementById(
"personalWorkspace"
);
break;

case "calendar":
target =
document.getElementById(
"calendarWorkspace"
);
break;

case "favorites":
target =
document.getElementById(
"favoritesWorkspace"
);
break;

case "trash":
target =
document.getElementById(
"trashWorkspace"
);
break;

case "settings":
target =
document.getElementById(
"settingsWorkspace"
);
break;

}

if(target){

target.hidden = false;

target.classList.add(
"active-workspace"
);

setActiveLinks(
view,
state.activeJournal
);

if(view === "favorites"){

renderFavoritesPage();

}

if(view === "trash"){

renderTrashPage();

}

if(
view === "calendar" &&
window.MyDiaryCalendar
){

window.MyDiaryCalendar.refreshCalendar();

}

}

}
document
.getElementById(
"changePasswordBtn"
)
?.addEventListener(
"click",
()=>{

const currentPassword =
document.getElementById("currentPassword")?.value || "";

const newPassword =
document.getElementById("newPassword")?.value || "";

const confirmPassword =
document.getElementById("confirmPassword")?.value || "";

const savedPassword =
localStorage.getItem(
STORAGE_KEYS.PASSWORD
);

if(currentPassword !== savedPassword){

showToast(
"Current password is incorrect",
"error"
);

return;

}

if(!newPassword || newPassword !== confirmPassword){

showToast(
"New passwords do not match",
"error"
);

return;

}

localStorage.setItem(
STORAGE_KEYS.PASSWORD,
newPassword
);

showToast(
"Password changed",
"success"
);

}
);
function renderFavoritesPage(){

const grid =
document.getElementById(
"favoritesGrid"
);

if(!grid) return;

grid.innerHTML = "";

state.entries
.filter(
e=>e.favorite && !e.trashed
)
.forEach(entry=>{

grid.appendChild(
createMemoryCard(entry)
);

});

}
function renderTrashPage(){

const grid =
document.getElementById(
"trashGrid"
);

if(!grid) return;

grid.innerHTML = "";

state.entries
.filter(
e=>e.trashed
)
.forEach(entry=>{

grid.appendChild(
createMemoryCard(entry)
);

});

}
/* =====================================================
   EDITOR EXTRAS — Sticker / Tape / Doodle / Polaroid
   Hooks into existing buttons: #stickerBtn, #tapeBtn,
   #doodleBtn, #polaroidBtn and inserts into #editor.
===================================================== */

(function () {
  "use strict";

  const editor = document.getElementById("editor");
  if (!editor) return;

  let activePopover = null;
  let savedRange = null;

  /* ---------- helpers ---------- */

  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
    document.removeEventListener("click", outsideClickHandler, true);
  }

  function outsideClickHandler(e) {
    if (activePopover && !activePopover.contains(e.target)) {
      closePopover();
    }
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      savedRange = sel.getRangeAt(0).cloneRange();
    } else {
      // fall back to end of editor
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      savedRange = range;
    }
  }

  function insertHTMLAtSavedRange(html) {
    editor.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedRange) {
      sel.addRange(savedRange);
    }
    document.execCommand("insertHTML", false, html);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function openPopover(anchorBtn, title, bodyEl) {
    closePopover();
    saveSelection();

    const pop = document.createElement("div");
    pop.className = "ee-popover glass";

    const header = document.createElement("div");
    header.className = "ee-popover-header";
    header.innerHTML = `<h4>${title}</h4>`;

    const closeBtn = document.createElement("button");
    closeBtn.className = "ee-popover-close";
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", closePopover);
    header.appendChild(closeBtn);

    pop.appendChild(header);
    pop.appendChild(bodyEl);

    document.body.appendChild(pop);

    const rect = anchorBtn.getBoundingClientRect();
    const top = window.scrollY + rect.bottom + 8;
    let left = window.scrollX + rect.left;
    const maxLeft = window.scrollX + window.innerWidth - pop.offsetWidth - 16;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;

    pop.style.top = top + "px";
    pop.style.left = left + "px";

    activePopover = pop;

    setTimeout(() => {
      document.addEventListener("click", outsideClickHandler, true);
    }, 0);
  }

  /* ---------- STICKERS ---------- */

  const STICKERS = [
    "🌸", "🦋", "🍒", "🍓", "🍄", "🌻", "🌈", "☁️",
    "✨", "💖", "🎀", "🧸", "🍰", "🍡", "🌙", "⭐",
    "🪐", "🐚", "🌺", "🍉", "🦢", "🕊️", "🍋", "🧁",
    "🔮", "🎧", "📌", "🧷", "🪞", "🫧", "🍂", "🌷",
    "🐝", "🍑", "🪄", "💌", "🧺", "🪻", "🍃", "🌼",
  ];

  function buildStickerBody() {
    const grid = document.createElement("div");
    grid.className = "ee-sticker-grid";
    STICKERS.forEach((emoji) => {
      const btn = document.createElement("button");
      btn.className = "ee-sticker-option";
      btn.textContent = emoji;
      btn.addEventListener("click", () => {
        insertHTMLAtSavedRange(`<span class="sticker-inline">${emoji}</span>`);
        closePopover();
      });
      grid.appendChild(btn);
    });
    return grid;
  }

  /* ---------- TAPE ---------- */

  const TAPES = [
    { cls: "ee-tape-floral", label: "Floral" },
    { cls: "ee-tape-kraft", label: "Kraft" },
    { cls: "ee-tape-polka", label: "Polka" },
    { cls: "ee-tape-gingham", label: "Gingham" },
    { cls: "ee-tape-stripe", label: "Stripe" },
    { cls: "ee-tape-stars", label: "Stars" },
    { cls: "ee-tape-plaid", label: "Plaid" },
    { cls: "ee-tape-rainbow", label: "Rainbow" },
    { cls: "ee-tape-lace", label: "Lace" },
  ];

  function buildTapeBody() {
    const grid = document.createElement("div");
    grid.className = "ee-tape-grid";
    grid.style.paddingBottom = "16px";
    TAPES.forEach((tape) => {
      const btn = document.createElement("button");
      btn.className = "ee-tape-option " + tape.cls;
      btn.setAttribute("data-label", tape.label);
      btn.addEventListener("click", () => {
        const rotation = (Math.random() * 8 - 4).toFixed(1);
        insertHTMLAtSavedRange(
          `<span class="tape-inline ${tape.cls}" style="transform:rotate(${rotation}deg)"></span>`
        );
        closePopover();
      });
      grid.appendChild(btn);
    });
    return grid;
  }

  /* ---------- DOODLES ---------- */

  const DOODLES = {
    heart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#ff82b2" stroke-width="2"><path d="M12 21s-7-4.6-9.5-9.1C0.7 8.4 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.4C10.8 6.1 12.2 5 14.2 5c3.4 0 5.1 3.4 3.3 6.9C19 16.4 12 21 12 21z" stroke-linejoin="round"/></svg>',
    star:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#ffb24a" stroke-width="2"><path d="M12 2l2.6 6.6 7 0.4-5.4 4.4 1.9 6.8L12 16.8 6 20.2l1.9-6.8L2.4 9l7-0.4L12 2z" stroke-linejoin="round"/></svg>',
    swirl:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M4 12a8 8 0 1 1 8 8 5 5 0 1 1 5-5 3 3 0 1 1-3-3" stroke-linecap="round"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#1b8c68" stroke-width="2"><path d="M3 12c5-6 9-2 9 1s4 7 9 1" stroke-linecap="round"/><path d="M17 10l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flower:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#d44882" stroke-width="2"><circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="12" r="2.2"/></svg>',
    cloud:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#7fa0ff" stroke-width="2"><path d="M6 17a4 4 0 0 1-1-7.9A5 5 0 0 1 14.8 7 4.5 4.5 0 0 1 18 17H6z" stroke-linejoin="round"/></svg>',
    sparkle:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#c17a00" stroke-width="2"><path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke-linecap="round"/><path d="M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" stroke-linecap="round"/></svg>',
    wave:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#0fa4af" stroke-width="2"><path d="M2 14c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke-linecap="round"/></svg>',
    leaf:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#1b8c68" stroke-width="2"><path d="M5 19C4 11 9 4 19 4c1 8-5 13-13 14-1 0-1-0-1-0z" stroke-linejoin="round"/><path d="M6 18C9 14 12 11 16 8" stroke-linecap="round"/></svg>',
    moon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#5034a5" stroke-width="2"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" stroke-linejoin="round"/></svg>',
    bow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#ff82b2" stroke-width="2"><path d="M12 12L4 6v12l8-6zM12 12l8-6v12l-8-6z" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.6" fill="#ff82b2"/></svg>',
    underline:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#ea5455" stroke-width="2"><path d="M3 17c4-3 14-3 18 0" stroke-linecap="round"/></svg>',
  };

  function buildDoodleBody() {
    const grid = document.createElement("div");
    grid.className = "ee-doodle-grid";
    Object.entries(DOODLES).forEach(([name, svg]) => {
      const btn = document.createElement("button");
      btn.className = "ee-doodle-option";
      btn.title = name;
      btn.innerHTML = svg;
      btn.addEventListener("click", () => {
        insertHTMLAtSavedRange(
          `<span class="doodle-inline">${svg}</span>`
        );
        closePopover();
      });
      grid.appendChild(btn);
    });
    return grid;
  }

  /* ---------- POLAROID ---------- */

  function buildPolaroidBody() {
    const wrap = document.createElement("div");
    wrap.className = "ee-polaroid-trigger";
    wrap.innerHTML = `
      <div class="ee-polaroid-icon">🔳</div>
      <p>Choose a photo from your device to add it as a polaroid in your entry.</p>
    `;

    const chooseBtn = document.createElement("button");
    chooseBtn.className = "primary-btn";
    chooseBtn.textContent = "Choose Photo";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.hidden = true;

    chooseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const rotation = (Math.random() * 6 - 3).toFixed(1);
        const html = `
          <span class="polaroid-inline" style="transform:rotate(${rotation}deg)" contenteditable="false">
            <img src="${reader.result}" alt="polaroid photo" />
            <span class="polaroid-caption-text">✦ memory ✦</span>
            <button class="polaroid-remove" onclick="this.parentElement.remove()">✕</button>
          </span>`;
        insertHTMLAtSavedRange(html);
        closePopover();
      };
      reader.readAsDataURL(file);
    });

    wrap.appendChild(chooseBtn);
    wrap.appendChild(fileInput);
    return wrap;
  }

  /* ---------- wire up buttons ---------- */

  function wire(id, titleText, bodyBuilder) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPopover(btn, titleText, bodyBuilder());
    });
  }

  wire("stickerBtn", "💟 Choose a Sticker", buildStickerBody);
  wire("tapeBtn", "୨ৎ Choose a Tape", buildTapeBody);
  wire("doodleBtn", "꩜ Choose a Doodle", buildDoodleBody);
  wire("polaroidBtn", "🔳 Add a Polaroid", buildPolaroidBody);
})();

