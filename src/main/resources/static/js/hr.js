/* =========================================================
   SmartHire - HR & Recruiter Interactivity
   File: static/js/hr.js
   Theme: Navy Blue + Orange
   ========================================================= */

(() => {
    "use strict";

    /**
     * Candidate Comparison System
     * Allows selecting up to 3 candidates to compare side-by-side.
     */
    function initCandidateComparison() {
        const compareBtn = document.getElementById("btnCompareCandidates");
        const compareModal = document.getElementById("compareModal");
        const compareCheckboxes = document.querySelectorAll(".candidate-compare-checkbox");

        if (!compareCheckboxes.length) return;

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

        if (compareBtn && compareModal) {
            compareBtn.addEventListener("click", () => {
                compareModal.hidden = false;
            });
        }

        document.querySelectorAll("[data-close-modal]").forEach(btn => {
            btn.addEventListener("click", () => {
                const modal = btn.closest(".modal-overlay");
                if (modal) modal.hidden = true;
            });
        });
    }

    /**
     * Schedule Interview Modal
     */
    function initScheduleInterviewModal() {
        const scheduleModal = document.getElementById("scheduleInterviewModal");
        const openButtons = document.querySelectorAll("[data-open-schedule-modal]");

        if (!scheduleModal) return;

        openButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const candidateName = btn.getAttribute("data-candidate-name") || "Alex Morgan";
                const jobTitle = btn.getAttribute("data-job-title") || "Senior Java Developer";

                const nameField = document.getElementById("modalInterviewCandidate");
                const jobField = document.getElementById("modalInterviewJob");

                if (nameField) nameField.value = candidateName;
                if (jobField) jobField.value = jobTitle;

                scheduleModal.hidden = false;
            });
        });

        const interviewForm = document.getElementById("scheduleInterviewForm");
        if (interviewForm) {
            interviewForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const alertMsg = document.getElementById("interviewScheduleSuccess");
                if (alertMsg) {
                    alertMsg.hidden = false;
                    setTimeout(() => {
                        scheduleModal.hidden = true;
                        alertMsg.hidden = true;
                    }, 1500);
                } else {
                    scheduleModal.hidden = true;
                    alert("Interview scheduled successfully! (Frontend demonstration)");
                }
            });
        }
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
                bulkModal.hidden = false;
            });
        }

        if (bulkFileInput && bulkDropzone) {
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
                if (e.dataTransfer.files.length) {
                    renderSelectedFiles(e.dataTransfer.files);
                }
            });
        }

        function renderSelectedFiles(files) {
            if (!bulkList) return;
            bulkList.innerHTML = "";
            Array.from(files).forEach((file, index) => {
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
                            if (bulkModal) bulkModal.hidden = true;
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
     * Client-side CSV generation for immediate demonstration.
     */
    function initReportExport() {
        const exportBtn = document.getElementById("btnExportReport");
        if (!exportBtn) return;

        exportBtn.addEventListener("click", () => {
            const csvRows = [
                ["Job Title", "Department", "Applicants", "Shortlisted", "Interviews", "Hired", "Average Match Score"],
                ["Senior Java Developer", "Engineering", "48", "12", "6", "2", "84%"],
                ["Spring Boot Backend Engineer", "Engineering", "36", "8", "4", "1", "79%"],
                ["Full Stack MERN Developer", "Product", "52", "14", "5", "2", "81%"],
                ["DevOps / Cloud Engineer", "Infrastructure", "28", "7", "3", "1", "88%"],
                ["Data Analyst", "Data & BI", "31", "9", "4", "1", "76%"]
            ];

            const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `SmartHire_Recruitment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
        initCandidateComparison();
        initScheduleInterviewModal();
        initBulkUpload();
        initReportExport();
        initScorecardRatings();
    });

})();
