
package com.resumeanalyzer.controller;

import com.resumeanalyzer.service.ResumeParserService;
import com.resumeanalyzer.service.SkillsExtractionService;
import org.apache.tika.exception.TikaException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/resumes")
public class ResumeController
{

    private final ResumeParserService resumeParserService;
    private final SkillsExtractionService skillsExtractionService;

    // Constructor Injection
    public ResumeController(
            ResumeParserService resumeParserService,
            SkillsExtractionService skillsExtractionService) {

        this.resumeParserService = resumeParserService;
        this.skillsExtractionService = skillsExtractionService;
    }

    // Resume Upload API
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file) {

        // Validate uploaded file
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Please upload a resume");
        }

        try {
            // Step 1: Extract text from resume
            String extractedText =
                    resumeParserService.extractText(file);

            // Step 2: Check extracted text
            if (extractedText == null || extractedText.isBlank()) {
                return ResponseEntity.status(422)
                        .body("No readable text found in resume");
            }

            // Step 3: Extract skills from text
            List<String> skills =
                    skillsExtractionService.extractSkills(extractedText);

            // Step 4: Prepare API response
            Map<String, Object> response = new LinkedHashMap<>();

            response.put("fileName", file.getOriginalFilename());
            response.put("extractedText", extractedText);
            response.put("detectedSkills", skills);
            response.put("totalSkillsFound", skills.size());

            // Step 5: Return response
            return ResponseEntity.ok(response);

        } catch (IOException | TikaException e) {
            return ResponseEntity.internalServerError()
                    .body("Resume processing failed");
        }
    }


    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/login")
    public String homeh() {
        return "login";
    }
}
