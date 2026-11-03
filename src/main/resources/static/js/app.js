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
     * Sidebar Setup: Collapsible on Desktop & Full Drawer on Mobile.
     */
    function initSidebar() {
        const layout = document.querySelector(".dashboard-layout");
        const sidebar = document.getElementById("dashboardSidebar");
        const menuBtn = document.getElementById("sidebarMenuButton");
        const closeBtn = document.getElementById("sidebarCloseBtn");

        if (!sidebar) return;

        // Ensure backdrop element exists in the DOM
        let backdrop = document.getElementById("sidebarBackdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "sidebarBackdrop";
            backdrop.className = "sidebar-backdrop";
            document.body.appendChild(backdrop);
        }

        // Restore saved preference on desktop
        if (window.innerWidth > 900 && layout) {
            const savedCollapsed = localStorage.getItem("smarthire-sidebar-collapsed");
            if (savedCollapsed === "true") {
                layout.classList.add("sidebar-collapsed");
                if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
            } else {
                if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
            }
        }

        function openSidebarMobile() {
            sidebar.classList.add("is-open");
            if (backdrop) backdrop.classList.add("active");
            document.body.classList.add("sidebar-open");
            if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
        }

        function closeSidebarMobile() {
            sidebar.classList.remove("is-open");
            if (backdrop) backdrop.classList.remove("active");
            document.body.classList.remove("sidebar-open");
            if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
        }

        function toggleSidebar() {
            if (window.innerWidth > 900) {
                // Desktop: Toggle collapsed state
                if (layout) {
                    const isCollapsed = layout.classList.toggle("sidebar-collapsed");
                    localStorage.setItem("smarthire-sidebar-collapsed", String(isCollapsed));
                    if (menuBtn) menuBtn.setAttribute("aria-expanded", String(!isCollapsed));
                }
            } else {
                // Mobile: Toggle open drawer
                if (sidebar.classList.contains("is-open")) {
                    closeSidebarMobile();
                } else {
                    openSidebarMobile();
                }
            }
        }

        if (menuBtn) {
            menuBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleSidebar();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (window.innerWidth > 900) {
                    if (layout) {
                        layout.classList.add("sidebar-collapsed");
                        localStorage.setItem("smarthire-sidebar-collapsed", "true");
                        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
                    }
                } else {
                    closeSidebarMobile();
                }
            });
        }

        if (backdrop) {
            backdrop.addEventListener("click", (e) => {
                e.stopPropagation();
                closeSidebarMobile();
            });
        }

        // Close when clicking any nav link on mobile
        sidebar.querySelectorAll(".sidebar-link").forEach(link => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 900) {
                    closeSidebarMobile();
                }
            });
        });

        // Close when clicking outside sidebar on mobile
        document.addEventListener("click", (e) => {
            if (window.innerWidth <= 900 && sidebar.classList.contains("is-open")) {
                if (!sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
                    closeSidebarMobile();
                }
            }
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if ((e.key === "Escape" || e.key === "Esc") && window.innerWidth <= 900 && sidebar.classList.contains("is-open")) {
                closeSidebarMobile();
            }
        });

        // Reset mobile drawer on desktop resize
        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                closeSidebarMobile();
                if (layout) {
                    const saved = localStorage.getItem("smarthire-sidebar-collapsed");
                    layout.classList.toggle("sidebar-collapsed", saved === "true");
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

    /**
     * Fallback Global Modal Manager
     */
    function initGlobalModalsFallback() {
        document.addEventListener("click", (e) => {
            const closeBtn = e.target.closest("[data-close-modal]");
            if (closeBtn) {
                e.preventDefault();
                const modal = closeBtn.closest(".modal-overlay");
                if (modal) {
                    modal.hidden = true;
                    modal.setAttribute("hidden", "");
                    modal.classList.remove("is-open");
                    modal.style.display = "none";
                    document.body.style.overflow = "";
                }
                return;
            }

            if (e.target.classList.contains("modal-overlay")) {
                e.target.hidden = true;
                e.target.setAttribute("hidden", "");
                e.target.classList.remove("is-open");
                e.target.style.display = "none";
                document.body.style.overflow = "";
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.key === "Esc") {
                document.querySelectorAll(".modal-overlay.is-open, .modal-overlay:not([hidden])").forEach(m => {
                    m.hidden = true;
                    m.setAttribute("hidden", "");
                    m.classList.remove("is-open");
                    m.style.display = "none";
                    document.body.style.overflow = "";
                });
            }
        });
    }

    /**
     * Real-time Notifications:
     * Periodically polls /api/notifications to detect individual candidate & recruiter notifications in real time,
     * updates the bell badge, dynamically repopulates dropdown list, and fires high-visibility floating toast alerts.
     */
    function initRealtimeNotifications() {
        const notifBadge = document.getElementById("notificationBadge");
        const notifList = document.getElementById("topbarNotificationsList");

        let seenNotificationIds = new Set();
        let isFirstLoad = true;
        let pollingInterval = null;

        function isToastSeen(id) {
            try {
                const seen = JSON.parse(sessionStorage.getItem("smarthire_seen_toasts") || "[]");
                return seen.includes(id);
            } catch (e) {
                return false;
            }
        }

        function markToastSeen(id) {
            try {
                const seen = JSON.parse(sessionStorage.getItem("smarthire_seen_toasts") || "[]");
                if (!seen.includes(id)) {
                    seen.push(id);
                    if (seen.length > 50) seen.shift();
                    sessionStorage.setItem("smarthire_seen_toasts", JSON.stringify(seen));
                }
            } catch (e) {}
        }

        function getOrCreateToastContainer() {
            let container = document.getElementById("realtimeToastContainer");
            if (!container) {
                container = document.createElement("div");
                container.id = "realtimeToastContainer";
                document.body.appendChild(container);
            }
            return container;
        }

        function showNotificationToast(notif) {
            if (!notif) return;
            if (notif.id) {
                markToastSeen(notif.id);
            }

            const container = getOrCreateToastContainer();
            const toast = document.createElement("div");
            toast.className = "realtime-toast";

            const iconClass = notif.iconClass || "bi-bell";
            const iconStyle = notif.iconStyle || "background: rgba(255,121,0,0.15); color: #ff7900;";
            const actionUrl = notif.actionUrl || "/dashboard/notifications";

            toast.innerHTML = `
                <div class="realtime-toast-icon" style="${iconStyle}">
                    <i class="bi ${iconClass}"></i>
                </div>
                <div class="realtime-toast-content">
                    <div class="realtime-toast-header">
                        <h4 class="realtime-toast-title">${escapeHtml(notif.title || 'New Notification')}</h4>
                        <button type="button" class="realtime-toast-close" aria-label="Close notification" title="Close notification">&times;</button>
                    </div>
                    <p class="realtime-toast-body">${escapeHtml(notif.message || '')}</p>
                    <div class="realtime-toast-footer">
                        <span>${escapeHtml(notif.timeAgo || 'Just now')}</span>
                        <a href="${actionUrl}" class="realtime-toast-link">View Details &rarr;</a>
                    </div>
                </div>
            `;

            container.appendChild(toast);

            // Animate in
            requestAnimationFrame(() => {
                toast.classList.add("show");
            });

            // Close button with stopPropagation so it doesn't trigger card navigation
            const closeBtn = toast.querySelector(".realtime-toast-close");
            if (closeBtn) {
                closeBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dismissToast(toast);
                });
            }

            // Click on toast body to navigate and mark as read
            toast.addEventListener("click", (e) => {
                if (!e.target.closest(".realtime-toast-close") && !e.target.closest("a")) {
                    if (notif && notif.id) {
                        if (navigator.sendBeacon) {
                            navigator.sendBeacon('/api/notifications/' + notif.id + '/read');
                        } else {
                            fetch('/api/notifications/' + notif.id + '/read', { method: 'POST', keepalive: true });
                        }
                    }
                    window.location.href = actionUrl;
                }
            });

            // Auto dismiss after 5 seconds
            let dismissTimer = setTimeout(() => {
                dismissToast(toast);
            }, 5000);

            // Pause auto-dismiss on hover / resume on leave
            toast.addEventListener("mouseenter", () => clearTimeout(dismissTimer));
            toast.addEventListener("mouseleave", () => {
                clearTimeout(dismissTimer);
                dismissTimer = setTimeout(() => dismissToast(toast), 2500);
            });

            // Touch swipe support on mobile (swipe down or swipe right to dismiss)
            let touchStartX = 0;
            let touchStartY = 0;
            toast.addEventListener("touchstart", (e) => {
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    clearTimeout(dismissTimer);
                }
            }, { passive: true });

            toast.addEventListener("touchend", (e) => {
                if (e.changedTouches.length === 1) {
                    const deltaX = e.changedTouches[0].clientX - touchStartX;
                    const deltaY = e.changedTouches[0].clientY - touchStartY;
                    if (deltaY > 35 || Math.abs(deltaX) > 50) {
                        dismissToast(toast);
                    } else {
                        dismissTimer = setTimeout(() => dismissToast(toast), 3000);
                    }
                }
            }, { passive: true });
        }

        function dismissToast(toast) {
            if (!toast || !toast.parentNode) return;
            toast.classList.remove("show");
            toast.classList.add("hide");
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 350);
        }

        function escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function updateBadgeCount(newCount) {
            const count = Math.max(0, Number(newCount || 0));
            if (notifBadge) {
                notifBadge.textContent = count;
                notifBadge.style.display = count > 0 ? "" : "none";
            }
            const headerCount = document.getElementById("headerUnreadCount");
            if (headerCount) {
                headerCount.textContent = count;
                headerCount.style.display = count > 0 ? "" : "none";
            }
            const btnMarkAll = document.getElementById("btnMarkAllReadHeader");
            if (btnMarkAll) {
                btnMarkAll.style.display = count > 0 ? "" : "none";
            }
        }

        function markRowAsReadUI(row) {
            if (!row) return;
            row.classList.remove("is-unread");
            row.classList.add("is-read");
            const itemLink = row.querySelector(".notification-item");
            if (itemLink) {
                itemLink.classList.remove("unread");
            }
            const singleBtn = row.querySelector(".btn-mark-single-read");
            if (singleBtn) {
                singleBtn.remove();
            }
        }

        function updateDropdownList(notifications) {
            if (!notifList || !Array.isArray(notifications)) return;

            if (notifications.length === 0) {
                notifList.innerHTML = `
                    <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        <i class="bi bi-bell-slash" style="font-size: 1.6rem; display: block; margin-bottom: 8px; opacity: 0.5;"></i>
                        <span>No new notifications</span>
                    </div>
                `;
                return;
            }

            const itemsHtml = notifications.slice(0, 5).map(n => {
                const isRead = (n.read === true || n.isRead === true);
                const rowClass = isRead ? "is-read" : "is-unread";
                const unreadClass = isRead ? "" : " unread";
                const iconClass = n.iconClass || "bi-bell";
                const iconStyle = n.iconStyle || "background: var(--primary-light); color: var(--primary);";
                const actionUrl = n.actionUrl || "/dashboard/notifications";
                const title = escapeHtml(n.title);
                const timeAgo = escapeHtml(n.timeAgo || 'Recent');
                const singleBtnHtml = isRead ? "" : `
                    <button type="button" 
                            class="btn-mark-single-read" 
                            data-id="${n.id}" 
                            title="Mark as read" 
                            aria-label="Mark notification as read">
                        <span class="unread-dot"></span>
                    </button>
                `;

                return `
                    <div class="notification-item-row ${rowClass}" data-id="${n.id}">
                        <a href="${actionUrl}" class="notification-item${unreadClass}" data-id="${n.id}">
                            <span class="notif-icon" style="${iconStyle}" aria-hidden="true">
                                <i class="bi ${iconClass}"></i>
                            </span>
                            <div class="notif-content">
                                <p class="notif-title">${title}</p>
                                <span class="notif-time">${timeAgo}</span>
                            </div>
                        </a>
                        ${singleBtnHtml}
                    </div>
                `;
            }).join("");

            notifList.innerHTML = itemsHtml;
        }

        // Attach dropdown interaction delegation
        if (notifList) {
            notifList.addEventListener("click", (e) => {
                // Click on single mark-as-read button
                const markBtn = e.target.closest(".btn-mark-single-read");
                if (markBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const notifId = markBtn.getAttribute("data-id");
                    const row = markBtn.closest(".notification-item-row");
                    markRowAsReadUI(row);

                    const currentBadge = parseInt(notifBadge ? notifBadge.textContent : '1', 10) || 1;
                    updateBadgeCount(currentBadge - 1);

                    fetch('/api/notifications/' + notifId + '/read', {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' },
                        credentials: 'same-origin'
                    }).catch(() => {});
                    return;
                }

                // Click on notification item link
                const itemLink = e.target.closest(".notification-item");
                if (itemLink && itemLink.classList.contains("unread")) {
                    const notifId = itemLink.getAttribute("data-id");
                    if (notifId) {
                        if (navigator.sendBeacon) {
                            navigator.sendBeacon('/api/notifications/' + notifId + '/read');
                        } else {
                            fetch('/api/notifications/' + notifId + '/read', { method: 'POST', keepalive: true });
                        }
                    }
                    const row = itemLink.closest(".notification-item-row");
                    markRowAsReadUI(row);
                    const currentBadge = parseInt(notifBadge ? notifBadge.textContent : '1', 10) || 1;
                    updateBadgeCount(currentBadge - 1);
                }
            });
        }

        // "Mark all read" in header dropdown
        const btnMarkAllHeader = document.getElementById("btnMarkAllReadHeader");
        if (btnMarkAllHeader) {
            btnMarkAllHeader.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                fetch('/api/notifications/mark-all-read', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin'
                })
                .then(() => {
                    const rows = notifList ? notifList.querySelectorAll(".notification-item-row") : [];
                    rows.forEach(r => markRowAsReadUI(r));
                    updateBadgeCount(0);
                })
                .catch(() => {});
            });
        }

        function checkNotifications() {
            fetch('/api/notifications', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            })
            .then(res => {
                if (!res.ok) return null;
                return res.json();
            })
            .then(data => {
                if (!data) return;

                const unreadCount = Number(data.unreadCount || 0);
                const notifications = Array.isArray(data.notifications) ? data.notifications : [];

                // Update bell badge & header counts
                updateBadgeCount(unreadCount);

                // First load: seed seen IDs, and if the newest unread notification is fresh (< 35s) AND not yet seen in this session, show toast once
                if (isFirstLoad) {
                    notifications.forEach(n => seenNotificationIds.add(n.id));
                    isFirstLoad = false;
                    const hasUnread = notifications.some(n => (!n.read && !n.isRead));
                    if (notifications.length > 0 && hasUnread) {
                        const firstUnread = notifications.find(n => (!n.read && !n.isRead));
                        const createdTime = firstUnread.createdAt ? new Date(firstUnread.createdAt).getTime() : 0;
                        const isRecent = createdTime > 0 && (Date.now() - createdTime) < 35000;
                        const isActionRedirect = window.location.search.includes("scheduled") || 
                                                window.location.search.includes("rescheduled") || 
                                                window.location.search.includes("cancelled") || 
                                                window.location.search.includes("feedbackSaved");
                        if ((isRecent || isActionRedirect) && !isToastSeen(firstUnread.id)) {
                            showNotificationToast(firstUnread);
                        }
                    }
                    return;
                }

                // Subsequent polls: check for genuinely new notifications
                const newNotifs = notifications.filter(n => !seenNotificationIds.has(n.id) && !isToastSeen(n.id));
                if (newNotifs.length > 0) {
                    // Pulse bell badge
                    if (notifBadge && unreadCount > 0) {
                        notifBadge.classList.remove("badge-pulse");
                        void notifBadge.offsetWidth;
                        notifBadge.classList.add("badge-pulse");
                    }

                    // Show toast for new arrivals (newest first, at most 1 at a time to prevent stacking clutter)
                    newNotifs.slice(0, 1).forEach(n => {
                        showNotificationToast(n);
                    });

                    // Update seen set
                    newNotifs.forEach(n => seenNotificationIds.add(n.id));

                    // Update topbar dropdown list
                    updateDropdownList(notifications);
                }
            })
            .catch(() => {
                // Silently handle temporary network/server glitch during polling
            });
        }

        // Run immediately once
        checkNotifications();

        // Then poll every 4.5 seconds for true real-time response
        pollingInterval = setInterval(checkNotifications, 4500);

        // Cleanup on page unload
        window.addEventListener("beforeunload", () => {
            if (pollingInterval) clearInterval(pollingInterval);
        });
    }

    // Initialize on DOM ready
    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(getSavedTheme(), false);

        document.querySelectorAll("[data-theme-toggle]").forEach(button => {
            button.addEventListener("click", toggleTheme);
        });

        initSidebar();
        initDropdowns();
        initRealtimeNotifications();
        initFooterYear();
        initGlobalModalsFallback();
    });

})();
