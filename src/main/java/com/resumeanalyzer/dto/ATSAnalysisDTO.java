package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ATSAnalysisDTO {

    private Long id;
    private Long resumeId;
    private String fileName;
    private String targetJobRole;
    private String jobDescription;

    private int overallScore;
    private String matchLevel; // Strong Match (>=75), Moderate Match (50-74), Needs Optimization (<50)

    private CandidateInfoDTO candidate;
    private SkillsAnalysisDTO skillsAnalysis;
    private CategoryScoresDTO categoryScores;

    @Builder.Default
    private List<JobMatchDTO> jobMatches = new ArrayList<>();

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    private String improvedSummary;

    @Builder.Default
    private List<String> suggestedKeywords = new ArrayList<>();

    @Builder.Default
    private List<String> sectionAnalysis = new ArrayList<>();

    private String aiProvider;
    private String analyzedAt;
}
