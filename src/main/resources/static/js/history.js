
document.addEventListener("DOMContentLoaded", () => {
    // History page ke required elements
    const searchInput = document.getElementById("historySearch");
    const roleFilter = document.getElementById("roleFilter");
    const sortSelect = document.getElementById("sortHistory");
    const historyTable = document.getElementById("historyTable");
    const resultCount = document.getElementById("resultCount");
    const emptyState = document.getElementById("emptyState");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.querySelector(".sidebar");

    // Table aur empty-state elements available hone chahiye
    if (!historyTable) {
        console.warn("History table not found.");
        return;
    }

    const tbody = historyTable.querySelector("tbody");

    if (!tbody) {
        console.warn("History table body not found.");
        return;
    }

    // Sirf actual analysis records select karo
    const rows = Array.from(
        tbody.querySelectorAll("tr.history-row")
    );

    // Text ko safe comparison ke liye normalize karo
    function normalize(value) {
        return (value || "").trim().toLowerCase();
    }

    // Search aur role filter apply karo
    function filterHistory() {
        const searchTerm = normalize(searchInput?.value);
        const selectedRole = normalize(roleFilter?.value);

        let visibleCount = 0;

        rows.forEach((row) => {
            const searchableText = normalize(row.textContent);
            const rowRole = normalize(row.dataset.role);

            const matchesSearch =
                searchableText.includes(searchTerm);

            const matchesRole =
                !selectedRole ||
                selectedRole === "all" ||
                rowRole === selectedRole;

            const shouldShow = matchesSearch && matchesRole;

            row.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        // Results count update karo
        if (resultCount) {
            resultCount.textContent =
                `${visibleCount} result${visibleCount !== 1 ? "s" : ""}`;
        }

        // No-results message show/hide karo
        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }

        // Table ko bhi hide kar sakte hain jab results na hon
        historyTable.classList.toggle(
            "no-results",
            visibleCount === 0
        );
    }

    // Date ya score ke according rows sort karo
    function sortHistory() {
        const sortBy = sortSelect?.value || "newest";

        const getDate = (row) => {
            const value = row.dataset.date;
            const timestamp = value ? Date.parse(value) : 0;

            return Number.isNaN(timestamp) ? 0 : timestamp;
        };

        const getScore = (row) => {
            const value = Number(row.dataset.score);
            return Number.isFinite(value) ? value : 0;
        };

        rows.sort((a, b) => {
            switch (sortBy) {
                case "oldest":
                    return getDate(a) - getDate(b);

                case "highest":
                    return getScore(b) - getScore(a);

                case "lowest":
                    return getScore(a) - getScore(b);

                case "newest":
                default:
                    return getDate(b) - getDate(a);
            }
        });

        // Sorted rows ko DOM mein dobara insert karo
        rows.forEach((row) => tbody.appendChild(row));

        // Sorting ke baad current filters dobara apply karo
        filterHistory();
    }

    // Search input change
    searchInput?.addEventListener("input", filterHistory);

    // Profile/role dropdown change
    roleFilter?.addEventListener("change", filterHistory);

    // Sorting dropdown change
    sortSelect?.addEventListener("change", sortHistory);

    // Mobile sidebar toggle
    sidebarToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("sidebar-open");
    });

    // Sidebar ke bahar click karne par close
    document.addEventListener("click", (event) => {
        if (
            sidebar &&
            sidebarToggle &&
            !sidebar.contains(event.target) &&
            !sidebarToggle.contains(event.target)
        ) {
            sidebar.classList.remove("sidebar-open");
        }
    });

    // Initial page setup
    sortHistory();
});
