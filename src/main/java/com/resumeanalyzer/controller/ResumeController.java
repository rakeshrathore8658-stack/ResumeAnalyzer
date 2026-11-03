package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.CandidateInfoDTO;
import com.resumeanalyzer.dto.ResumeUploadResponseDTO;
import com.resumeanalyzer.entity.Resume;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.service.ResumeExtractionService;
import com.resumeanalyzer.service.ResumeNormalizationService;
import com.resumeanalyzer.service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping({"/api/resume", "/api/resumes"})
@RequiredArgsConstructor
@Slf4j
public class ResumeController {

    private final ResumeParserService resumeParserService;
    private final ResumeNormalizationService resumeNormalizationService;
    private final ResumeExtractionService resumeExtractionService;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    /**
     * Upload and parse resume document (PDF, DOC, DOCX, TXT).
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam(value = "file", required = false) MultipartFile fileParam,
            @RequestParam(value = "resumeFile", required = false) MultipartFile resumeFileParam
    ) {
        MultipartFile file = (fileParam != null) ? fileParam : resumeFileParam;

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "error", "Bad Request",
                    "message", "Please select a resume file to upload."
            ));
        }

        try {
            // Step 1: Parse Text
            String rawText = resumeParserService.extractText(file);

            // Step 2: Normalize Text
            String normalizedText = resumeNormalizationService.normalizeText(rawText);
            if (!resumeNormalizationService.isValidResumeText(normalizedText)) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                        "status", 422,
                        "error", "Unprocessable Entity",
                        "message", "No readable or meaningful resume text found. Ensure file is not empty or scanned image only."
                ));
            }

            // Step 3: Extract Candidate Info & Structured JSON
            CandidateInfoDTO candidateInfo = resumeExtractionService.extractCandidateInfo(normalizedText);
            String structuredJson = resumeExtractionService.toJson(candidateInfo);

            String normEmail = com.resumeanalyzer.service.CandidateNormalizationUtils.normalizeEmail(candidateInfo.getEmail());
            String normPhone = com.resumeanalyzer.service.CandidateNormalizationUtils.normalizePhone(candidateInfo.getPhoneNumber());
            String candName = com.resumeanalyzer.service.CandidateNormalizationUtils.normalizeName(candidateInfo.getName());

            // Step 4: Deduplicate Candidate Resume (Upsert)
            java.util.Optional<Resume> existingResumeOpt = java.util.Optional.empty();
            if (normEmail != null) {
                existingResumeOpt = resumeRepository.findFirstByCandidateEmailNormalizedOrderByCreatedAtDesc(normEmail);
            }
            if (existingResumeOpt.isEmpty() && normPhone != null) {
                existingResumeOpt = resumeRepository.findFirstByCandidatePhoneNormalizedOrderByCreatedAtDesc(normPhone);
            }

            Resume resume;
            if (existingResumeOpt.isPresent()) {
                resume = existingResumeOpt.get();
                resume.setFileName(file.getOriginalFilename());
                resume.setFileType(file.getContentType());
                resume.setFileSize(file.getSize());
                resume.setOriginalText(rawText);
                resume.setNormalizedText(normalizedText);
                resume.setStructuredJson(structuredJson);
                resume.setCandidateName(candName);
                resume.setCandidateEmail(candidateInfo.getEmail());
                resume.setCandidateEmailNormalized(normEmail);
                resume.setCandidatePhone(candidateInfo.getPhoneNumber());
                resume.setCandidatePhoneNormalized(normPhone);
            } else {
                resume = Resume.builder()
                        .fileName(file.getOriginalFilename())
                        .fileType(file.getContentType())
                        .fileSize(file.getSize())
                        .originalText(rawText)
                        .normalizedText(normalizedText)
                        .structuredJson(structuredJson)
                        .candidateName(candName)
                        .candidateEmail(candidateInfo.getEmail())
                        .candidateEmailNormalized(normEmail)
                        .candidatePhone(candidateInfo.getPhoneNumber())
                        .candidatePhoneNormalized(normPhone)
                        .build();
            }

            // Link authenticated user if available
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
                    userRepository.findByEmail(auth.getName()).ifPresent(resume::setUser);
                }
            } catch (Exception ignored) {
            }

            if (resume.getUser() == null) {
                try {
                    ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attrs != null && attrs.getRequest() != null && attrs.getRequest().getSession(false) != null) {
                        String email = (String) attrs.getRequest().getSession(false).getAttribute("userEmail");
                        if (email != null && !email.isBlank()) {
                            userRepository.findByEmail(email).ifPresent(resume::setUser);
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            Resume saved = resumeRepository.save(resume);

            // Step 5: Construct Response DTO
            String preview = normalizedText.length() > 300
                    ? normalizedText.substring(0, 300) + "..."
                    : normalizedText;

            ResumeUploadResponseDTO response = ResumeUploadResponseDTO.builder()
                    .resumeId(saved.getId())
                    .fileName(saved.getFileName())
                    .fileType(saved.getFileType())
                    .fileSize(saved.getFileSize())
                    .extractedTextLength(normalizedText.length())
                    .detectedSkills(candidateInfo.getTechnicalSkills())
                    .totalSkillsFound(candidateInfo.getTechnicalSkills().size())
                    .candidateInfo(candidateInfo)
                    .previewText(preview)
                    .message("Resume uploaded, normalized, and parsed successfully.")
                    .build();

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Validation error during resume upload: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "error", "Validation Error",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Internal error processing resume upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Resume parsing failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Retrieve stored resume by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable("id") Long id) {
        return resumeRepository.findById(id)
                .map(resume -> ResponseEntity.ok((Object) Map.of(
                        "id", resume.getId(),
                        "fileName", resume.getFileName(),
                        "fileType", resume.getFileType() != null ? resume.getFileType() : "application/pdf",
                        "fileSize", resume.getFileSize() != null ? resume.getFileSize() : 0,
                        "createdAt", resume.getCreatedAt(),
                        "normalizedText", resume.getNormalizedText() != null ? resume.getNormalizedText() : ""
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", 404,
                        "error", "Not Found",
                        "message", "Resume with ID " + id + " does not exist."
                )));
    }
}
