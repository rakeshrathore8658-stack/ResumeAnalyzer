
/*
 * SmartHire ATS Checker
 * File: static/js/ats-checker.js
 *
 * Features:
 * 1. Resume drag-and-drop upload
 * 2. PDF, DOC and DOCX extension validation
 * 3. Maximum file size validation (5 MB)
 * 4. Selected file name and size display
 * 5. Remove selected file
 * 6. Job description character counter
 * 7. Form submission feedback
 * 8. Mobile sidebar toggle
 *
 * Security:
 * Client-side validation is not a security boundary.
 * Validate file contents, size and permissions on the server.
 */

(() => {
    "use strict";

    // ==================== CONFIGURATION ====================

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_DESCRIPTION_LENGTH = 15000;

    const ALLOWED_EXTENSIONS = new Set([
        "pdf",
        "doc",
        "docx"
    ]);


    // ==================== DOM ELEMENTS ====================

    const form = document.getElementById("atsCheckerForm");

    // Exit when this script is included on another page.
    if (!form) {
        return;
    }

    const fileInput = document.getElementById("atsResumeFile");
    const dropzone = document.getElementById("atsDropzone");
    const dropzoneContent = document.getElementById("atsDropzoneContent");

    const selectedFilePanel = document.getElementById("atsSelectedFile");
    const selectedFileName = document.getElementById("atsSelectedFileName");
    const selectedFileSize = document.getElementById("atsSelectedFileSize");

    const removeFileButton = document.getElementById("atsRemoveFile");
    const fileError = document.getElementById("atsFileError");

    const jobDescription = document.getElementById("atsJobDescription");
    const descriptionCounter = document.getElementById("atsDescriptionCounter");

    const submitButton = document.getElementById("atsCheckButton");
    const submitLabel = document.getElementById("atsSubmitLabel");
    const processingPanel = document.getElementById("atsProcessing");


    // ==================== FILE HELPERS ====================

    /**
     * Convert a file size to a readable string.
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
     * Read the file extension from its name.
     */
    function getFileExtension(filename) {
        const dotIndex = filename.lastIndexOf(".");

        if (dotIndex < 0) {
            return "";
        }

        return filename.substring(dotIndex + 1).toLowerCase();
    }


    /**
     * Validate a file before form submission.
     *
     * This does not verify the actual file contents.
     */
    function validateFile(file) {
        if (!file) {
            return "Please select your resume.";
        }

        const extension = getFileExtension(file.name);

        if (!ALLOWED_EXTENSIONS.has(extension)) {
            return "Unsupported file type. Upload a PDF, DOC or DOCX file.";
        }

        if (file.size === 0) {
            return "The selected file is empty. Please choose another file.";
        }

        if (file.size > MAX_FILE_SIZE) {
            return "The file exceeds 5 MB. Please select a smaller file.";
        }

        return "";
    }


    // ==================== FILE ERROR DISPLAY ====================

    /**
     * Display validation feedback beside the upload area.
     */
    function showFileError(message) {
        if (fileError) {
            fileError.textContent = message;
            fileError.hidden = !message;
        }

        if (dropzone) {
            dropzone.classList.toggle("has-error", Boolean(message));
        }

        if (fileInput) {
            fileInput.setAttribute(
                "aria-invalid",
                message ? "true" : "false"
            );
        }
    }


    // ==================== SELECTED FILE UI ====================

    /**
     * Display the chosen file.
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
     * Reset the file input and its visible information.
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
    }


    /**
     * Set a dropped file on the actual file input.
     *
     * This allows the browser to submit the file through multipart/form-data.
     */
    function setSelectedFile(file) {
        if (!file || !fileInput) {
            return false;
        }

        const validationMessage = validateFile(file);

        if (validationMessage) {
            clearSelectedFile();
            showFileError(validationMessage);
            return false;
        }

        try {
            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            displaySelectedFile(file);

            return true;
        } catch (error) {
            clearSelectedFile();

            showFileError(
                "Unable to attach the dropped file. Please use Browse files."
            );

            console.error("Unable to attach dropped file:", error);

            return false;
        }
    }


    // ==================== FILE INPUT EVENTS ====================

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0];

            if (!file) {
                return;
            }

            const validationMessage = validateFile(file);

            if (validationMessage) {
                clearSelectedFile();
                showFileError(validationMessage);
                return;
            }

            displaySelectedFile(file);
        });
    }


    // ==================== REMOVE FILE ====================

    if (removeFileButton) {
        removeFileButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            clearSelectedFile();

            // Return focus to the upload control.
            fileInput?.focus();
        });
    }


    // ==================== DRAG AND DROP ====================

    if (dropzone && fileInput) {

        const dragEvents = [
            "dragenter",
            "dragover",
            "dragleave",
            "drop"
        ];

        // Prevent the browser from opening a dropped document.
        dragEvents.forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();
            });
        });


        // Highlight the upload area.
        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add("is-dragging");
            });
        });


        // Remove the highlight when dragging ends.
        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove("is-dragging");
            });
        });


        // Process the dropped file.
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


    // ==================== JOB DESCRIPTION COUNTER ====================

    /**
     * Keep the character counter synchronized with the textarea.
     */
    function updateDescriptionCounter() {
        if (!jobDescription || !descriptionCounter) {
            return;
        }

        const length = jobDescription.value.length;

        descriptionCounter.textContent =
            `${length} / ${MAX_DESCRIPTION_LENGTH}`;

        descriptionCounter.classList.toggle(
            "is-near-limit",
            length >= MAX_DESCRIPTION_LENGTH * 0.9
        );
    }


    if (jobDescription) {
        jobDescription.maxLength = MAX_DESCRIPTION_LENGTH;

        jobDescription.addEventListener(
            "input",
            updateDescriptionCounter
        );

        updateDescriptionCounter();
    }


    // Mobile sidebar toggle is centralized in app.js


    // ==================== FORM SUBMISSION ====================

    form.addEventListener("submit", event => {
        // Use native HTML validation for required fields.
        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
        }

        // Revalidate the file immediately before submission.
        const file = fileInput?.files?.[0];
        const validationMessage = validateFile(file);

        if (validationMessage) {
            event.preventDefault();

            showFileError(validationMessage);
            fileInput?.focus();

            return;
        }

        /*
         * Let the browser submit the multipart form to Spring Boot.
         * Do not call preventDefault() for a valid submission.
         */

        if (submitButton) {
            submitButton.disabled = true;
        }

        if (submitLabel) {
            submitLabel.textContent = "Submitting...";
        }

        if (processingPanel) {
            processingPanel.hidden = false;
        }
    });


    // ==================== INITIALIZATION ====================

    updateDescriptionCounter();

})();
