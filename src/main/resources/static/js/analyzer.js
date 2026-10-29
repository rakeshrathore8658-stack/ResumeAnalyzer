
/*
 * SmartHire Resume Analyzer
 * File: static/js/analyzer.js
 *
 * Features:
 * 1. Drag-and-drop resume upload
 * 2. File extension and size validation
 * 3. Selected file information
 * 4. Remove selected file
 * 5. Custom job role field
 * 6. Job description character counter
 * 7. Form submission feedback
 *
 * Important:
 * Client-side validation improves usability.
 * Always validate uploaded files on the Spring Boot backend too.
 */

(() => {
    "use strict";

    // ==================== CONFIGURATION ====================

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const ALLOWED_EXTENSIONS = [
        "pdf",
        "doc",
        "docx"
    ];

    const MAX_DESCRIPTION_LENGTH = 15000;


    // ==================== DOM ELEMENTS ====================

    const form = document.getElementById("resumeAnalyzerForm");

    const fileInput = document.getElementById("resumeFile");
    const dropzone = document.getElementById("resumeDropzone");
    const dropzoneContent = document.getElementById("dropzoneContent");

    const selectedFilePanel = document.getElementById("selectedFile");
    const selectedFileName = document.getElementById("selectedFileName");
    const selectedFileSize = document.getElementById("selectedFileSize");
    const removeFileButton = document.getElementById("removeSelectedFile");

    const fileError = document.getElementById("resumeFileError");

    const jobRoleSelect = document.getElementById("jobRole");
    const customRoleGroup = document.getElementById("customRoleGroup");
    const customJobRoleInput = document.getElementById("customJobRole");

    const jobDescription = document.getElementById("jobDescription");
    const descriptionCounter = document.getElementById("jobDescriptionCounter");

    const submitButton = document.getElementById("analyzeResumeButton");
    const processingPanel = document.getElementById("analysisProcessing");


    // Stop safely if this script is loaded on a page without the form.
    if (!form) {
        return;
    }


    // ==================== FILE UTILITIES ====================

    /**
     * Convert bytes into a readable file size.
     *
     * Example:
     * 1024 bytes -> 1 KB
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return `${bytes} bytes`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }


    /**
     * Get a file extension without relying on its MIME type.
     */
    function getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf(".");

        if (lastDotIndex < 0) {
            return "";
        }

        return filename.substring(lastDotIndex + 1).toLowerCase();
    }


    /**
     * Validate a selected file.
     *
     * This is a user-experience check, not a security boundary.
     */
    function validateFile(file) {
        if (!file) {
            return "Please select your resume file.";
        }

        const extension = getFileExtension(file.name);

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return "Invalid file type. Please upload a PDF, DOC or DOCX file.";
        }

        if (file.size === 0) {
            return "The selected file is empty. Please choose another file.";
        }

        if (file.size > MAX_FILE_SIZE) {
            return "File size exceeds 5 MB. Please choose a smaller file.";
        }

        return "";
    }


    // ==================== ERROR HANDLING ====================

    /**
     * Show or hide the resume validation message.
     */
    function showFileError(message) {
        if (fileError) {
            fileError.textContent = message;
            fileError.hidden = message.length === 0;
        }

        if (dropzone) {
            dropzone.classList.toggle(
                "has-error",
                message.length > 0
            );
        }

        if (fileInput) {
            fileInput.setAttribute(
                "aria-invalid",
                message.length > 0 ? "true" : "false"
            );
        }
    }


    // ==================== FILE DISPLAY ====================

    /**
     * Display selected file information.
     */
    function displaySelectedFile(file) {
        if (!file) {
            return;
        }

        if (selectedFileName) {
            selectedFileName.textContent = file.name;
        }

        if (selectedFileSize) {
            selectedFileSize.textContent = formatFileSize(file.size);
        }

        if (dropzoneContent) {
            dropzoneContent.hidden = true;
        }

        if (selectedFilePanel) {
            selectedFilePanel.hidden = false;
        }

        showFileError("");
    }


    /**
     * Clear the selected file and reset the upload area.
     */
    function clearSelectedFile() {
        if (fileInput) {
            fileInput.value = "";
        }

        if (selectedFilePanel) {
            selectedFilePanel.hidden = true;
        }

        if (dropzoneContent) {
            dropzoneContent.hidden = false;
        }

        showFileError("");

        if (fileInput) {
            fileInput.focus();
        }
    }


    /**
     * Update the file input with the selected file.
     *
     * DataTransfer is used for files selected through drag-and-drop.
     */
    function setSelectedFile(file) {
        if (!fileInput || !file) {
            return false;
        }

        const validationMessage = validateFile(file);

        if (validationMessage) {
            clearSelectedFile();
            showFileError(validationMessage);
            return false;
        }

        try {
            const transfer = new DataTransfer();
            transfer.items.add(file);

            fileInput.files = transfer.files;
        } catch (error) {
            showFileError(
                "Unable to attach this file. Please select it using Browse files."
            );

            console.error("Unable to set selected file:", error);
            return false;
        }

        displaySelectedFile(file);
        return true;
    }


    // ==================== FILE INPUT ====================

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0];

            if (!file) {
                return;
            }

            const validationMessage = validateFile(file);

            if (validationMessage) {
                fileInput.value = "";
                clearSelectedFile();
                showFileError(validationMessage);
                return;
            }

            displaySelectedFile(file);
        });
    }


    // ==================== REMOVE FILE ====================

    if (removeFileButton) {
        removeFileButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            clearSelectedFile();
        });
    }


    // ==================== DRAG AND DROP ====================

    if (dropzone && fileInput) {

        // Prevent the browser from opening the dropped file.
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();
            });
        });


        // Highlight the upload area while dragging a file over it.
        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add("is-dragging");
            });
        });


        // Remove highlight when dragging ends.
        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove("is-dragging");
            });
        });


        // Handle the dropped file.
        dropzone.addEventListener("drop", event => {
            const files = event.dataTransfer?.files;

            if (!files || files.length === 0) {
                return;
            }

            if (files.length > 1) {
                clearSelectedFile();
                showFileError("Please upload one resume at a time.");
                return;
            }

            setSelectedFile(files[0]);
        });
    }


    // ==================== CUSTOM JOB ROLE ====================

    /**
     * Show the custom role input only when "Other / Custom Role"
     * is selected.
     */
    function updateCustomRoleField() {
        if (!jobRoleSelect || !customRoleGroup || !customJobRoleInput) {
            return;
        }

        const isCustomRole = jobRoleSelect.value === "Other";

        customRoleGroup.hidden = !isCustomRole;
        customJobRoleInput.required = isCustomRole;

        if (!isCustomRole) {
            customJobRoleInput.value = "";
        }
    }


    if (jobRoleSelect) {
        jobRoleSelect.addEventListener("change", updateCustomRoleField);

        // Set the initial state.
        updateCustomRoleField();
    }


    // ==================== DESCRIPTION COUNTER ====================

    /**
     * Update the character counter while the user types.
     */
    function updateDescriptionCounter() {
        if (!jobDescription || !descriptionCounter) {
            return;
        }

        const currentLength = jobDescription.value.length;

        descriptionCounter.textContent =
            `${currentLength} / ${MAX_DESCRIPTION_LENGTH}`;

        descriptionCounter.classList.toggle(
            "is-near-limit",
            currentLength >= MAX_DESCRIPTION_LENGTH * 0.9
        );
    }


    if (jobDescription) {
        jobDescription.maxLength = MAX_DESCRIPTION_LENGTH;

        jobDescription.addEventListener(
            "input",
            updateDescriptionCounter
        );

        // Also supports previously populated text.
        updateDescriptionCounter();
    }


    // ==================== SIDEBAR MOBILE TOGGLE ====================

    const sidebar = document.getElementById("dashboardSidebar");
    const sidebarButton = document.getElementById("sidebarMenuButton");

    if (sidebar && sidebarButton) {
        sidebarButton.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("is-open");

            sidebarButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });
    }


    // ==================== FORM SUBMISSION ====================

    form.addEventListener("submit", event => {
        // Browser validation handles required inputs and native constraints.
        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
        }

        // Validate the resume again before submission.
        const file = fileInput?.files?.[0];
        const validationMessage = validateFile(file);

        if (validationMessage) {
            event.preventDefault();
            showFileError(validationMessage);
            fileInput?.focus();
            return;
        }

        // Make sure the custom role is provided when needed.
        if (
            jobRoleSelect?.value === "Other" &&
            !customJobRoleInput?.value.trim()
        ) {
            event.preventDefault();

            customJobRoleInput?.setCustomValidity(
                "Please enter your target job role."
            );

            customJobRoleInput?.reportValidity();
            return;
        }

        customJobRoleInput?.setCustomValidity("");

        /*
         * Do not prevent the normal form submission.
         * Spring Boot receives the multipart form request.
         */
        if (submitButton) {
            submitButton.disabled = true;

            const buttonLabel = submitButton.querySelector(
                ".submit-button-label"
            );

            if (buttonLabel) {
                buttonLabel.textContent = "Submitting...";
            }
        }

        if (processingPanel) {
            processingPanel.hidden = false;
        }
    });


    // Remove a custom-role validation error as the user edits the field.
    if (customJobRoleInput) {
        customJobRoleInput.addEventListener("input", () => {
            customJobRoleInput.setCustomValidity("");
        });
    }


    // ==================== INITIALIZATION ====================

    updateCustomRoleField();
    updateDescriptionCounter();

})();
