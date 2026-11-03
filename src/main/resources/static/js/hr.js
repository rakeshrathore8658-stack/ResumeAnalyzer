/* =========================================================
   SmartHire - HR & Recruiter Interactivity
   File: static/js/hr.js
   Theme: Navy Blue + Orange
   ========================================================= */

(() => {
    "use strict";

    /**
     * Helper: Open a modal cleanly
     */
    function openModal(modal) {
        if (!modal) return;
        modal.hidden = false;
        modal.removeAttribute("hidden");
        modal.classList.add("is-open");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    /**
     * Helper: Close a modal cleanly
     */
    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        modal.setAttribute("hidden", "");
        modal.classList.remove("is-open");
        modal.style.display = "none";
        document.body.style.overflow = "";

        // Reset any alert messages inside modal
        const alerts = modal.querySelectorAll(".alert");
        alerts.forEach(alert => {
            alert.hidden = true;
            alert.setAttribute("hidden", "");
            alert.style.display = "none";
        });
    }

    // Expose helpers globally so pages and inline handlers can use them
    window.openModal = openModal;
    window.closeModal = closeModal;
            alert.hidden = true;
            alert.setAttribute("hidden", "");
            alert.style.display = "none";
        });
    }

    /**
     * Global Modal Controllers (Cancel, Close ✕, Backdrop Click, Escape Key)
     */
    function initGlobalModals() {
        // Ensure all modals start closed on initial page load
        document.querySelectorAll(".modal-overlay").forEach(modal => {
            if (!modal.classList.contains("is-open")) {
                closeModal(modal);
            }
        });

        // Delegate clicks for close buttons and overlay backdrops
        document.addEventListener("click", (e) => {
            // 1. Any button or element with [data-close-modal] (Cancel button, ✕ button, Close button)
            const closeBtn = e.target.closest("[data-close-modal]");
            if (closeBtn) {
                e.preventDefault();
                const modal = closeBtn.closest(".modal-overlay");
                if (modal) {
                    closeModal(modal);
                }
                return;
            }

            // 2. Click directly on the backdrop outside the modal dialog
            if (e.target.classList.contains("modal-overlay")) {
                closeModal(e.target);
            }
        });

        // 3. Escape key closes any open modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.key === "Esc") {
                const openModals = document.querySelectorAll(".modal-overlay.is-open, .modal-overlay:not([hidden])");
                openModals.forEach(m => closeModal(m));
            }
        });
    }

    /**
     * Candidate Comparison System
     * Allows selecting up to 3 candidates to compare side-by-side.
     */
    function initCandidateComparison() {
        const compareBtn = document.getElementById("btnCompareCandidates");
        const compareModal = document.getElementById("compareModal");
        const compareCheckboxes = document.querySelectorAll(".candidate-compare-checkbox");

        if (compareBtn && compareModal) {
            compareBtn.addEventListener("click", () => {
                openModal(compareModal);
            });
        }

        const proceedScheduleBtn = document.getElementById("btnProceedToSchedule");
        if (proceedScheduleBtn) {
            proceedScheduleBtn.addEventListener("click", () => {
                if (compareModal) closeModal(compareModal);
                const scheduleModal = document.getElementById("scheduleInterviewModal");
                if (scheduleModal) {
                    const nameField = document.getElementById("modalInterviewCandidate");
                    const jobField = document.getElementById("modalInterviewJob");
                    if (nameField) nameField.value = "Vikram Sharma & Priya Patel";
                    if (jobField) jobField.value = "Shortlisted Vacancies";
                    openModal(scheduleModal);
                } else {
                    alert("Interview round scheduled for shortlisted candidates! (Frontend demonstration)");
                }
            });
        }

        if (compareCheckboxes.length > 0) {
            function updateCompareButton() {
                const checkedBoxes = document.querySelectorAll(".candidate-compare-checkbox:checked");
                if (compareBtn) {
                    compareBtn.disabled = checkedBoxes.length < 2;
                    compareBtn.innerHTML = `<span>⚖</span> Compare Selected (${checkedBoxes.length})`;
                }
            }

            compareCheckboxes.forEach(cb => {
                cb.addEventListener("change", () => {
                    const checkedBoxes = document.querySelectorAll(".candidate-compare-checkbox:checked");
                    if (checkedBoxes.length > 3) {
                        cb.checked = false;
                        alert("You can compare a maximum of 3 candidates at once.");
                    }
                    updateCompareButton();
                });
            });

            updateCompareButton();
        }
    }

    /**
     * Schedule Interview Modal - Allow direct form posting to backend server
     */
    function initScheduleInterviewModal() {
        const scheduleModal = document.getElementById("scheduleInterviewModal");

        // Delegate opening to any button with [data-open-schedule-modal]
        document.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-open-schedule-modal]");
            if (!btn) return;
            e.preventDefault();

            if (!scheduleModal) return;

            const candidateName = btn.getAttribute("data-candidate-name");
            const jobTitle = btn.getAttribute("data-job-title");

            const nameField = document.getElementById("modalInterviewCandidate");
            const jobField = document.getElementById("modalInterviewJob");

            if (nameField && candidateName) nameField.value = candidateName;
            if (jobField && jobTitle) jobField.value = jobTitle;

            openModal(scheduleModal);
        });
    }

    /**
     * Bulk Resume Upload Simulator
     */
    function initBulkUpload() {
        const bulkModal = document.getElementById("bulkUploadModal");
        const openBulkBtn = document.getElementById("btnOpenBulkUpload");
        const bulkDropzone = document.getElementById("bulkDropzone");
        const bulkFileInput = document.getElementById("bulkResumeFiles");
        const bulkList = document.getElementById("bulkFilesList");
        const bulkUploadBtn = document.getElementById("btnStartBulkUpload");
        const bulkProgressBar = document.getElementById("bulkProgressBar");

        if (openBulkBtn && bulkModal) {
            openBulkBtn.addEventListener("click", () => {
                openModal(bulkModal);
            });
        }

        if (bulkFileInput && bulkDropzone) {
            bulkDropzone.addEventListener("click", () => {
                bulkFileInput.click();
            });

            bulkFileInput.addEventListener("change", () => {
                renderSelectedFiles(bulkFileInput.files);
            });

            bulkDropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                bulkDropzone.classList.add("drag-over");
            });

            bulkDropzone.addEventListener("dragleave", () => {
                bulkDropzone.classList.remove("drag-over");
            });

            bulkDropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                bulkDropzone.classList.remove("drag-over");
                if (e.dataTransfer && e.dataTransfer.files.length) {
                    renderSelectedFiles(e.dataTransfer.files);
                }
            });
        }

        function renderSelectedFiles(files) {
            if (!bulkList) return;
            bulkList.innerHTML = "";
            Array.from(files).forEach((file) => {
                const li = document.createElement("div");
                li.className = "bulk-file-item";
                li.style.cssText = "display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 6px; font-size: 0.85rem;";
                li.innerHTML = `<span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span><span class="badge badge-neutral">Ready to parse</span>`;
                bulkList.appendChild(li);
            });
            if (bulkUploadBtn) bulkUploadBtn.disabled = files.length === 0;
        }

        if (bulkUploadBtn && bulkProgressBar) {
            bulkUploadBtn.addEventListener("click", () => {
                bulkUploadBtn.disabled = true;
                bulkUploadBtn.textContent = "Parsing with AI...";
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 25;
                    bulkProgressBar.style.width = progress + "%";
                    if (progress >= 100) {
                        clearInterval(interval);
                        bulkUploadBtn.textContent = "Completed!";
                        setTimeout(() => {
                            if (bulkModal) closeModal(bulkModal);
                            bulkUploadBtn.disabled = false;
                            bulkUploadBtn.textContent = "Start Parsing";
                            bulkProgressBar.style.width = "0%";
                            if (bulkList) bulkList.innerHTML = "";
                        }, 1000);
                    }
                }, 300);
            });
        }
    }

    /**
     * Export Reports to CSV
     */
    function initReportExport() {
        const exportBtn = document.getElementById("btnExportReport");
        if (!exportBtn) return;

        // Allow direct navigation to backend CSV generator if tag is an anchor
        if (exportBtn.tagName === "A" && exportBtn.getAttribute("href")) {
            return;
        }

        exportBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/dashboard/reports/export";
        });
    }

    /**
     * Interactive Scorecard rating selectors in Interview Feedback.
     */
    function initScorecardRatings() {
        document.querySelectorAll(".score-rating-group").forEach(group => {
            const buttons = group.querySelectorAll(".score-rating-btn");
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    buttons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const hiddenInput = group.querySelector("input[type='hidden']");
                    if (hiddenInput) {
                        hiddenInput.value = btn.getAttribute("data-score");
                    }
                });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initGlobalModals();
        initCandidateComparison();
        initScheduleInterviewModal();
        initBulkUpload();
        initReportExport();
        initScorecardRatings();
    });

})();