/* ==========================================================
   MYDIARY V3
   PASSWORD & AUTH MODULE
   modules/password.js
========================================================== */

(function () {

"use strict";

/* ==========================================================
   STORAGE KEYS
========================================================== */

const PASSWORD_KEY =
    "myDiaryPassword";

const REMEMBER_KEY =
    "myDiaryRemember";

const SESSION_KEY =
    "myDiarySession";

/* ==========================================================
   DOM HELPERS
========================================================== */

function get(id) {
    return document.getElementById(id);
}

/* ==========================================================
   TOAST
========================================================== */

function showToastSafe(
    message,
    type = "success"
) {

    if (
        typeof window.showToast ===
        "function"
    ) {

        window.showToast(
            message,
            type
        );

    } else {

        alert(message);

    }

}

/* ==========================================================
   APP VISIBILITY
========================================================== */

function showApp() {

    const auth =
        get("authScreen");

    const app =
        get("appShell");

    if (auth) {

        auth.style.display =
            "none";

    }

    if (app) {

        app.hidden = false;

    }

}

function showLogin() {

    const auth =
        get("authScreen");

    const app =
        get("appShell");

    if (auth) {

        auth.style.display =
            "flex";

    }

    if (app) {

        app.hidden = true;

    }

}

/* ==========================================================
   PASSWORD STORAGE
========================================================== */

function savePassword(
    password
) {

    localStorage.setItem(
        PASSWORD_KEY,
        password
    );

}

function getPassword() {

    return localStorage.getItem(
        PASSWORD_KEY
    );

}

function passwordExists() {

    return !!getPassword();

}

/* ==========================================================
   SESSION
========================================================== */

function createSession() {

    localStorage.setItem(
        SESSION_KEY,
        "true"
    );

}

function destroySession() {

    localStorage.removeItem(
        SESSION_KEY
    );

}

function hasSession() {

    return (
        localStorage.getItem(
            SESSION_KEY
        ) === "true"
    );

}

/* ==========================================================
   CREATE PASSWORD
========================================================== */

function createPassword() {

    const password =
        prompt(
            "Create a password for MyDiary"
        );

    if (
        !password ||
        password.trim().length < 4
    ) {

        showToastSafe(
            "Password must be at least 4 characters",
            "error"
        );

        return;

    }

    savePassword(
        password.trim()
    );

    showToastSafe(
        "Password Created Successfully"
    );

}

/* ==========================================================
   LOGIN
========================================================== */

function login(
    password,
    remember
) {

    const storedPassword =
        getPassword();

    if (!storedPassword) {

        showToastSafe(
            "Create a password first",
            "error"
        );

        return false;

    }

    if (
        password !==
        storedPassword
    ) {

        showToastSafe(
            "Incorrect Password",
            "error"
        );

        return false;

    }

    createSession();

    if (remember) {

        localStorage.setItem(
            REMEMBER_KEY,
            "true"
        );

    } else {

        localStorage.removeItem(
            REMEMBER_KEY
        );

    }

    showApp();

    showToastSafe(
        "Welcome Back!"
    );

    return true;

}

/* ==========================================================
   LOGOUT
========================================================== */

function logout() {

    destroySession();

    showLogin();

    showToastSafe(
        "Logged Out"
    );

}

/* ==========================================================
   CHANGE PASSWORD
========================================================== */

function changePassword() {

    const current =
        get(
            "currentPassword"
        )?.value || "";

    const newPassword =
        get(
            "newPassword"
        )?.value || "";

    const confirm =
        get(
            "confirmPassword"
        )?.value || "";

    const stored =
        getPassword();

    if (
        current !== stored
    ) {

        showToastSafe(
            "Current password incorrect",
            "error"
        );

        return;
    }

    if (
        newPassword.length < 4
    ) {

        showToastSafe(
            "New password too short",
            "error"
        );

        return;

    }

    if (
        newPassword !== confirm
    ) {

        showToastSafe(
            "Passwords do not match",
            "error"
        );

        return;

    }

    savePassword(
        newPassword
    );

    get(
        "currentPassword"
    ).value = "";

    get(
        "newPassword"
    ).value = "";

    get(
        "confirmPassword"
    ).value = "";

    showToastSafe(
        "Password Updated"
    );

}

/* ==========================================================
   AUTO LOGIN
========================================================== */

function autoLoginCheck() {

    const remember =
        localStorage.getItem(
            REMEMBER_KEY
        );

    if (
        remember === "true" &&
        hasSession()
    ) {

        showApp();

        return;

    }

    showLogin();

}

/* ==========================================================
   LOGIN FORM
========================================================== */

function bindLoginForm() {

    const form =
        get("loginForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            const password =
                get(
                    "loginPassword"
                ).value;

            const remember =
                get(
                    "rememberMe"
                ).checked;

            login(
                password,
                remember
            );

        }
    );

}

/* ==========================================================
   CREATE PASSWORD BUTTON
========================================================== */

function bindCreatePassword() {

    const btn =
        get(
            "createPasswordBtn"
        );

    if (!btn) return;

    btn.addEventListener(
        "click",
        createPassword
    );

}

/* ==========================================================
   CHANGE PASSWORD BUTTON
========================================================== */

function bindChangePassword() {

    const btn =
        get(
            "changePasswordBtn"
        );

    if (!btn) return;

    btn.addEventListener(
        "click",
        changePassword
    );

}

/* ==========================================================
   SETTINGS LOGOUT BUTTON
========================================================== */

function createLogoutButton() {

    const settings =
        get(
            "settingsPanel"
        );

    if (!settings) return;

    const btn =
        document.createElement(
            "button"
        );

    btn.className =
        "logout-btn";

    btn.textContent =
        "Logout";

    btn.addEventListener(
        "click",
        logout
    );

    settings.appendChild(
        btn
    );

}

/* ==========================================================
   LOCK SCREEN
========================================================== */

function lockDiary() {

    destroySession();

    showLogin();

}

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        bindLoginForm();

        bindCreatePassword();

        bindChangePassword();

        createLogoutButton();

        autoLoginCheck();

    }
);

/* ==========================================================
   GLOBAL API
========================================================== */

window.MyDiaryAuth = {

    login,

    logout,

    lockDiary,

    changePassword,

    createPassword,

    autoLoginCheck

};

})();