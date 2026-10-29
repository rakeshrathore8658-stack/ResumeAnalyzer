/* =========================================================
   SmartHire - AI Resume Analyzer & Recruitment Platform
   File: static/js/app.js
   Theme: Navy Blue + Orange
   ========================================================= */

(() => {
    "use strict";

    const THEME_KEY = "smarthire-theme";
    const DEFAULT_THEME = "light";

    const root = document.documentElement;

    /**
     * Read saved theme preference.
     */
    function getSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme === "dark" || savedTheme === "light") {
                return savedTheme;
            }
        } catch (e) {
            console.warn("Could not read theme preference.");
        }
        return DEFAULT_THEME;
    }

    /**
     * Apply theme to HTML root element.
     */
    function applyTheme(theme, save = true) {
        const validTheme = theme === "dark" ? "dark" : "light";
        root.setAttribute("data-theme", validTheme);
        root.style.colorScheme = validTheme;

        document.querySelectorAll("[data-theme-toggle]").forEach(button => {
            const isDark = validTheme === "dark";
            button.setAttribute("aria-pressed", String(isDark));
            button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
            button.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
        });

        if (save) {
            try {
                localStorage.setItem(THEME_KEY, validTheme);
            } catch (e) {
                console.warn("Could not save theme preference.");
            }
        }
    }

    /**
     * Toggle Theme between Light & Dark.
     */
    function toggleTheme() {
        const currentTheme = root.getAttribute("data-theme") || DEFAULT_THEME;
        applyTheme(currentTheme === "dark" ? "light" : "dark");
    }

    /**
     * Mobile Sidebar setup.
     */
    function initSidebar() {
        const sidebar = document.getElementById("dashboardSidebar");
        const menuBtn = document.getElementById("sidebarMenuButton");

        if (!sidebar || !menuBtn) return;

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = sidebar.classList.toggle("is-open");
            document.body.classList.toggle("sidebar-open", isOpen);
            menuBtn.setAttribute("aria-expanded", String(isOpen));
        });

        document.addEventListener("click", (e) => {
            if (window.innerWidth <= 900 && sidebar.classList.contains("is-open")) {
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    sidebar.classList.remove("is-open");
                    document.body.classList.remove("sidebar-open");
                    menuBtn.setAttribute("aria-expanded", "false");
                }
            }
        });
    }

    /**
     * Dropdowns: Notifications and Profile menus.
     */
    function initDropdowns() {
        const notifTrigger = document.getElementById("notificationsTrigger");
        const notifMenu = document.getElementById("notificationsDropdown");
        const profileTrigger = document.getElementById("profileMenuTrigger");
        const profileMenu = document.getElementById("profileDropdown");

        function closeAllDropdowns() {
            if (notifMenu) notifMenu.hidden = true;
            if (profileMenu) profileMenu.hidden = true;
            if (notifTrigger) notifTrigger.setAttribute("aria-expanded", "false");
            if (profileTrigger) profileTrigger.setAttribute("aria-expanded", "false");
        }

        if (notifTrigger && notifMenu) {
            notifTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const willOpen = notifMenu.hidden;
                closeAllDropdowns();
                notifMenu.hidden = !willOpen;
                notifTrigger.setAttribute("aria-expanded", String(willOpen));
            });
        }

        if (profileTrigger && profileMenu) {
            profileTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const willOpen = profileMenu.hidden;
                closeAllDropdowns();
                profileMenu.hidden = !willOpen;
                profileTrigger.setAttribute("aria-expanded", String(willOpen));
            });
        }

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".notifications-dropdown-wrapper") &&
                !e.target.closest(".profile-dropdown-wrapper")) {
                closeAllDropdowns();
            }
        });
    }

    /**
     * Footer current year updater.
     */
    function initFooterYear() {
        const yearEl = document.getElementById("dashboardFooterYear") || document.getElementById("current-year");
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    // Initialize on DOM ready
    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(getSavedTheme(), false);

        document.querySelectorAll("[data-theme-toggle]").forEach(button => {
            button.addEventListener("click", toggleTheme);
        });

        initSidebar();
        initDropdowns();
        initFooterYear();
    });

})();
