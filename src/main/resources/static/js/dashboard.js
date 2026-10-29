
/**
 * SmartHire - Dashboard JavaScript
 * File: dashboard.js
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // 1. Mobile sidebar toggle
    const sidebar = document.getElementById("dashboardSidebar");
    const menuButton = document.getElementById("sidebarMenuButton");

    if (sidebar && menuButton) {
        menuButton.addEventListener("click", function () {
            const isOpen = sidebar.classList.toggle("is-open");

            document.body.classList.toggle("sidebar-open", isOpen);

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener("click", function (event) {
            if (!window.matchMedia("(max-width: 768px)").matches) {
                return;
            }

            if (
                sidebar.classList.contains("is-open") &&
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                sidebar.classList.remove("is-open");
                document.body.classList.remove("sidebar-open");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });

        // Reset sidebar on desktop screen
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) {
                sidebar.classList.remove("is-open");
                document.body.classList.remove("sidebar-open");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });
    }

    // 2. Dashboard chart bars
    const chartBars = document.querySelectorAll(
        ".chart-bar[data-value], .chart-bar[data-height]"
    );

    chartBars.forEach(function (bar) {
        const rawValue = bar.dataset.value || bar.dataset.height;
        const value = Number.parseFloat(rawValue);

        if (Number.isFinite(value)) {
            const height = Math.min(100, Math.max(0, value));
            bar.style.height = height + "%";
        }
    });

    // 3. Optional dashboard table search
    const searchInput = document.querySelector(
        "[data-dashboard-search], #dashboardSearch, #recentAnalysisSearch"
    );

    const rows = document.querySelectorAll(
        ".recent-table tbody tr, [data-dashboard-row]"
    );

    if (searchInput && rows.length > 0) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.trim().toLowerCase();

            rows.forEach(function (row) {
                const text = row.textContent.toLowerCase();
                row.hidden = !text.includes(query);
            });
        });
    }

    console.log("SmartHire dashboard.js loaded successfully.");
});
