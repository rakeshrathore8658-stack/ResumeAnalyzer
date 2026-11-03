/**
 * SmartHire - Dashboard JavaScript
 * File: dashboard.js
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // Note: Mobile & desktop sidebar toggling is centralized in app.js
    // to prevent duplicate click handling and toggle cancellation.

    // 1. Dashboard chart bars
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

    // 2. Optional dashboard table search
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
