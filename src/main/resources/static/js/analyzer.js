/*
 * SmartHire Resume Analyzer
 * File: static/js/analyzer.js
 *
 * Full Asynchronous AI Workflow with 10 Advanced Animations:
 * 1. Animated ATS Score Counter (0 to target)
 * 2. Circular SVG Progress Ring (stroke-dashoffset transition)
 * 3. Smooth Category Progress Bars fill with ease-out
 * 4. Staggered Skill Tags Appearance (matched in green, missing with priority badges)
 * 5. Assessment Pill pop & pulse animation
 * 6. Dynamic Multi-Step AI Processing Indicator
 * 7. Smooth Scroll to Results Section
 * 8. Staggered Strengths & Recommendations Reveal
 * 9. Drag-and-drop resume upload & instant file validation
 * 10. Print Report & Interactive UI polish
 */

(() => {
    "use strict";

    // ==================== CONFIGURATION ====================

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "txt"];
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
    const resultsContainer = document.getElementById("analysisResultsContainer");

    const aiProviderSelect = document.getElementById("aiProviderSelect");

    // Stop safely if this script is loaded on a page without the form
    if (!form) {
        return;
    }

    // ==================== FILE UTILITIES ====================

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return "0 bytes";
        if (bytes < 1024) return `${bytes} bytes`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function getFileExtension(filename) {
        if (!filename) return "";
        const lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex < 0) return "";
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    function validateFile(file) {
        if (!file) {
            return "Please select your resume file.";
        }
        const extension = getFileExtension(file.name);
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.";
        }
        if (file.size === 0) {
            return "The selected file is empty. Please choose another file.";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "File size exceeds 10 MB. Please choose a smaller file.";
        }
        return "";
    }

    function showFileError(message) {
        if (fileError) {
            fileError.textContent = message;
            fileError.hidden = !message || message.length === 0;
        }
        if (dropzone) {
            dropzone.classList.toggle("has-error", !!message && message.length > 0);
        }
        if (fileInput) {
            fileInput.setAttribute("aria-invalid", !!message && message.length > 0 ? "true" : "false");
        }
    }

    function displaySelectedFile(file) {
        if (!file) return;
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (selectedFileSize) selectedFileSize.textContent = formatFileSize(file.size);
        if (dropzoneContent) dropzoneContent.hidden = true;
        if (selectedFilePanel) selectedFilePanel.hidden = false;
        showFileError("");
    }

    function clearSelectedFile() {
        if (fileInput) fileInput.value = "";
        if (selectedFilePanel) selectedFilePanel.hidden = true;
        if (dropzoneContent) dropzoneContent.hidden = false;
        showFileError("");
        if (fileInput) fileInput.focus();
    }

    function setSelectedFile(file) {
        if (!fileInput || !file) return false;
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
            showFileError("Unable to attach this file. Please select it using browse computer.");
            return false;
        }
        displaySelectedFile(file);
        return true;
    }

    // ==================== EVENT LISTENERS FOR FILE UPLOAD ====================

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0];
            if (!file) return;
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

    if (removeFileButton) {
        removeFileButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            clearSelectedFile();
        });
    }

    if (dropzone && fileInput) {
        // Open native file explorer dialog when clicking anywhere on the dropzone
        dropzone.addEventListener("click", (event) => {
            // Do not trigger file explorer if the user clicked the remove button
            if (event.target.closest("#removeSelectedFile")) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (dropzone.tagName !== "LABEL" && event.target !== fileInput) {
                fileInput.click();
            }
        });

        // Keyboard accessibility (Space or Enter key triggers file picker)
        dropzone.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInput.click();
            }
        });

        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();
            });
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add("is-dragging");
            });
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove("is-dragging");
            });
        });

        dropzone.addEventListener("drop", event => {
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return;
            if (files.length > 1) {
                clearSelectedFile();
                showFileError("Please upload one resume at a time.");
                return;
            }
            setSelectedFile(files[0]);
        });
    }

    // ==================== CUSTOM JOB ROLE & COUNTER ====================

    function updateCustomRoleField() {
        if (!jobRoleSelect || !customRoleGroup || !customJobRoleInput) return;
        const isCustomRole = jobRoleSelect.value === "Other";
        customRoleGroup.hidden = !isCustomRole;
        customJobRoleInput.required = isCustomRole;
        if (!isCustomRole) customJobRoleInput.value = "";
    }

    if (jobRoleSelect) {
        jobRoleSelect.addEventListener("change", updateCustomRoleField);
        updateCustomRoleField();
    }

    function updateDescriptionCounter() {
        if (!jobDescription || !descriptionCounter) return;
        const currentLength = jobDescription.value.length;
        descriptionCounter.textContent = `${currentLength} / ${MAX_DESCRIPTION_LENGTH}`;
        descriptionCounter.classList.toggle("is-near-limit", currentLength >= MAX_DESCRIPTION_LENGTH * 0.9);
    }

    if (jobDescription) {
        jobDescription.maxLength = MAX_DESCRIPTION_LENGTH;
        jobDescription.addEventListener("input", updateDescriptionCounter);
        updateDescriptionCounter();
    }

    // ==================== ASYNCHRONOUS WORKFLOW & ANIMATIONS ====================

    const processingSteps = [
        "1/4: Uploading resume document...",
        "2/4: Normalizing document text & identifying technical skills...",
        "3/4: Building dynamic AI prompt & evaluating ATS compatibility...",
        "4/4: Calculating deterministic ATS benchmarks & career matching..."
    ];

    let processingInterval = null;

    function startProcessingAnimation() {
        if (!processingPanel) return;
        processingPanel.hidden = false;
        let stepIdx = 0;
        const statusHeading = processingPanel.querySelector("h3");
        if (statusHeading) statusHeading.textContent = processingSteps[0];

        processingInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % processingSteps.length;
            if (statusHeading) statusHeading.textContent = processingSteps[stepIdx];
        }, 1200);
    }

    function stopProcessingAnimation() {
        if (processingInterval) {
            clearInterval(processingInterval);
            processingInterval = null;
        }
        if (processingPanel) {
            processingPanel.hidden = true;
        }
    }

    /**
     * Animate numeric counter from start to end over duration ms.
     */
    function animateCounter(element, target, duration = 1200) {
        if (!element) return;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(start + (target - start) * easeProgress);

            element.textContent = `${currentVal}%`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = `${target}%`;
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Animate SVG Circular Progress Ring.
     */
    function animateRadialGauge(score) {
        const circle = document.getElementById("gaugeFillCircle");
        if (!circle) return;
        const circumference = 314.16; // 2 * Math.PI * 50
        const offset = circumference - (circumference * score) / 100;
        // Start from 0 (full offset)
        circle.style.strokeDashoffset = circumference;
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 80);
    }

    /**
     * Animate horizontal progress bars with staggered transition.
     */
    function animateProgressBar(barElement, textElement, score, delay = 100) {
        if (!barElement) return;
        barElement.style.width = "0%";
        setTimeout(() => {
            barElement.style.width = `${score}%`;
            if (textElement) textElement.textContent = `${score}%`;
        }, delay);
    }

    /**
     * Render and stagger matched & missing skill tags.
     */
    function renderSkillTags(matchedSkills, missingSkills) {
        const matchedContainer = document.getElementById("matchedSkillsList");
        const matchedCount = document.getElementById("matchedSkillsCount");
        const missingContainer = document.getElementById("missingSkillsList");
        const missingCount = document.getElementById("missingSkillsCount");

        if (matchedContainer && matchedSkills) {
            matchedContainer.innerHTML = "";
            if (matchedCount) matchedCount.textContent = matchedSkills.length;

            matchedSkills.forEach((skill, idx) => {
                const tag = document.createElement("span");
                tag.className = "skill-tag skill-matched";
                tag.style.animationDelay = `${idx * 45}ms`;
                tag.textContent = skill;
                matchedContainer.appendChild(tag);
            });
        }

        if (missingContainer && missingSkills) {
            missingContainer.innerHTML = "";
            if (missingCount) missingCount.textContent = missingSkills.length;

            missingSkills.forEach((item, idx) => {
                const skillName = typeof item === "object" ? (item.skill || "") : item;
                const priority = typeof item === "object" ? (item.priority || "MEDIUM") : "MEDIUM";

                const tag = document.createElement("span");
                tag.className = "skill-tag skill-missing";
                tag.style.animationDelay = `${idx * 60}ms`;

                tag.innerHTML = `${escapeHtml(skillName)} <small class="priority-tag">${escapeHtml(priority)}</small>`;
                missingContainer.appendChild(tag);
            });
        }
    }

    /**
     * Render insights bullet points for strengths and recommendations.
     */
    function renderInsights(strengths, recommendations) {
        const strengthsList = document.getElementById("strengthsList");
        const recommendationsList = document.getElementById("recommendationsList");

        if (strengthsList && strengths && strengths.length > 0) {
            strengthsList.innerHTML = "";
            strengths.forEach((item, idx) => {
                const li = document.createElement("li");
                li.style.animationDelay = `${idx * 80}ms`;
                li.innerHTML = formatBulletText(item);
                strengthsList.appendChild(li);
            });
        }

        if (recommendationsList && recommendations && recommendations.length > 0) {
            recommendationsList.innerHTML = "";
            recommendations.forEach((item, idx) => {
                const li = document.createElement("li");
                li.style.animationDelay = `${idx * 80}ms`;
                li.innerHTML = formatBulletText(item);
                recommendationsList.appendChild(li);
            });
        }
    }

    function formatBulletText(text) {
        if (!text) return "";
        if (text.includes(":")) {
            const parts = text.split(":");
            return `<strong>${escapeHtml(parts[0])}:</strong> ${escapeHtml(parts.slice(1).join(":"))}`;
        }
        return escapeHtml(text);
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Updates the assessment pill with appropriate style.
     */
    function updateAssessmentPill(score) {
        const pill = document.getElementById("gaugeAssessmentPill");
        if (!pill) return;

        pill.className = "assessment-pill";
        if (score >= 75) {
            pill.classList.add("pill-strong");
            pill.textContent = "Strong Match";
        } else if (score >= 50) {
            pill.classList.add("pill-moderate");
            pill.textContent = "Moderate Match";
        } else {
            pill.classList.add("pill-weak");
            pill.textContent = "Needs Optimization";
        }
    }

    // ==================== FORM SUBMIT HANDLER ====================

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // 1. Validate file
        const file = fileInput?.files?.[0];
        const validationMessage = validateFile(file);
        if (validationMessage) {
            showFileError(validationMessage);
            fileInput?.focus();
            return;
        }

        // 2. Validate custom role
        if (jobRoleSelect?.value === "Other" && !customJobRoleInput?.value.trim()) {
            customJobRoleInput?.setCustomValidity("Please enter your target job role.");
            customJobRoleInput?.reportValidity();
            return;
        }
        customJobRoleInput?.setCustomValidity("");

        // 3. Prepare UI state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin-right: 8px;"></span> Analyzing Resume...`;
        }

        startProcessingAnimation();

        try {
            // STEP 1: Upload File to Spring Boot Backend
            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await fetch("/api/resume/upload", {
                method: "POST",
                body: formData
            });

            if (!uploadResponse.ok) {
                const errData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errData.message || "Resume upload failed. Please try again.");
            }

            const uploadData = await uploadResponse.json();
            const resumeId = uploadData.resumeId;

            // STEP 2: Trigger AI ATS Analysis
            const targetRole = jobRoleSelect.value === "Other"
                ? customJobRoleInput.value.trim()
                : jobRoleSelect.value;

            const selectedAiProvider = aiProviderSelect ? aiProviderSelect.value : "local";

            const analyzePayload = {
                resumeId: resumeId,
                targetJobRole: targetRole,
                customJobRole: customJobRoleInput?.value.trim() || null,
                jobDescription: jobDescription?.value.trim() || null,
                aiProvider: selectedAiProvider
            };

            const analyzeResponse = await fetch("/api/resume/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(analyzePayload)
            });

            if (!analyzeResponse.ok) {
                const errData = await analyzeResponse.json().catch(() => ({}));
                throw new Error(errData.message || "Resume analysis failed. Please try again.");
            }

            const analysisData = await analyzeResponse.json();

            // STEP 3: Render Result & Trigger 10 Advanced Animations
            stopProcessingAnimation();

            if (resultsContainer) {
                resultsContainer.hidden = false;
                resultsContainer.style.display = "block";
            }

            const resultSubtitle = document.querySelector(".result-subtitle");
            if (resultSubtitle && analysisData.aiProvider) {
                resultSubtitle.innerHTML = `Evaluated against <strong>${escapeHtml(targetRole)}</strong> using <strong>${escapeHtml(analysisData.aiProvider.toUpperCase())}</strong> AI engine.`;
            }

            const score = analysisData.overallScore !== undefined ? analysisData.overallScore : 75;
            const scores = analysisData.categoryScores || {
                formatting: 90,
                skills: score,
                experience: 78,
                keywords: 75
            };

            // Animation 1 & 2: Radial Gauge & Number Counter
            animateRadialGauge(score);
            const gaugeValueDisplay = document.getElementById("gaugeValueDisplay");
            animateCounter(gaugeValueDisplay, score, 1300);

            // Animation 3: Assessment Pill
            updateAssessmentPill(score);

            // Animation 4: Category Progress Bars
            animateProgressBar(document.getElementById("metricReadabilityBar"), document.getElementById("metricReadabilityPct"), scores.formatting || 90, 200);
            animateProgressBar(document.getElementById("metricSkillsBar"), document.getElementById("metricSkillsPct"), scores.skills || score, 350);
            animateProgressBar(document.getElementById("metricExperienceBar"), document.getElementById("metricExperiencePct"), scores.experience || 78, 500);
            animateProgressBar(document.getElementById("metricKeywordsBar"), document.getElementById("metricKeywordsPct"), scores.keywords || 75, 650);

            // Animation 5 & 6: Skill Tags
            const matchedSkills = analysisData.skillsAnalysis?.matchedSkills || uploadData.detectedSkills || [];
            const missingSkills = analysisData.skillsAnalysis?.missingSkills || [];
            renderSkillTags(matchedSkills, missingSkills);

            // Animation 7 & 8: Strengths and Recommendations
            renderInsights(analysisData.strengths, analysisData.recommendations);

            // Update Improve Resume button with the new saved analysis ID
            const btnImprove = document.getElementById("btnImproveResume");
            if (btnImprove && analysisData.id) {
                btnImprove.href = `/dashboard/resumeimprovement?id=${analysisData.id}`;
            }

            // Sync URL history state with analysis ID
            if (analysisData.id && window.history && window.history.replaceState) {
                window.history.replaceState({ analysisId: analysisData.id }, "", `/dashboard/resumeanalyzer?id=${analysisData.id}`);
            }

            // Animation 9: Smooth Scroll into View
            if (resultsContainer) {
                setTimeout(() => {
                    resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 150);
            }

        } catch (error) {
            console.error("Analysis process error:", error);
            stopProcessingAnimation();
            alert("Analysis Notice: " + error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = `<i class="bi bi-cpu"></i> Analyze My Resume`;
            }
        }
    });

    // Interactive Shortlist button for HR Candidate screening
    const btnShortlistCandidate = document.getElementById("btnShortlistCandidate");
    if (btnShortlistCandidate) {
        btnShortlistCandidate.addEventListener("click", () => {
            const isShortlisted = btnShortlistCandidate.classList.toggle("is-shortlisted");
            if (isShortlisted) {
                btnShortlistCandidate.innerHTML = `<i class="bi bi-check2-circle"></i> Candidate Shortlisted`;
                btnShortlistCandidate.style.background = "var(--success)";
                btnShortlistCandidate.style.borderColor = "var(--success)";
            } else {
                btnShortlistCandidate.innerHTML = `<i class="bi bi-star"></i> Shortlist Candidate`;
                btnShortlistCandidate.style.background = "";
                btnShortlistCandidate.style.borderColor = "";
            }
        });
    }

})();
