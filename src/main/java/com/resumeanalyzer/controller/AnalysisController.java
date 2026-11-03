package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ATSAnalysisDTO;
import com.resumeanalyzer.dto.ResumeAnalyzeRequestDTO;
import com.resumeanalyzer.service.ResumeAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/resume", "/api/analysis"})
@RequiredArgsConstructor
@Slf4j
public class AnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;

    /**
     * Executes AI ATS analysis against target job role and description.
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(@RequestBody ResumeAnalyzeRequestDTO request) {
        if (request == null || request.getResumeId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "error", "Bad Request",
                    "message", "resumeId is required to execute analysis."
            ));
        }

        String targetRole = request.getTargetJobRole();
        if ("Other".equalsIgnoreCase(targetRole) && request.getCustomJobRole() != null && !request.getCustomJobRole().isBlank()) {
            targetRole = request.getCustomJobRole();
        }

        try {
            ATSAnalysisDTO result = resumeAnalysisService.analyzeResume(
                    request.getResumeId(),
                    targetRole,
                    request.getJobDescription(),
                    request.getAiProvider(),
                    request.getGeminiApiKey()
            );

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            log.warn("Analysis request argument error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "error", "Bad Request",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Analysis execution error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Resume analysis failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Retrieve previously executed analysis by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAnalysisById(@PathVariable("id") Long id) {
        try {
            ATSAnalysisDTO analysis = resumeAnalysisService.getAnalysis(id);
            return ResponseEntity.ok(analysis);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", 404,
                    "error", "Not Found",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Re-runs analysis on an existing resume.
     */
    @PostMapping("/reanalyze")
    public ResponseEntity<?> reanalyzeResume(@RequestBody ResumeAnalyzeRequestDTO request) {
        return analyzeResume(request);
    }
}
