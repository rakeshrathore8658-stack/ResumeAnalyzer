package com.resumeanalyzer.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
public class PageController {

    // ==========================================
    // PUBLIC & AUTHENTICATION PAGES
    // ==========================================

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/login")
    public String login(@RequestParam(value = "role", required = false) String role, Model model) {
        model.addAttribute("selectedRole", role != null ? role.toUpperCase() : "USER");
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(
            @RequestParam(value = "role", defaultValue = "USER") String role,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email,
            HttpSession session) {

        String activeRole = "HR".equalsIgnoreCase(role) ? "HR" : "USER";
        session.setAttribute("userRole", activeRole);

        if ("HR".equalsIgnoreCase(activeRole)) {
            session.setAttribute("userName", (username != null && !username.isBlank()) ? username : "Sarah Jenkins");
            session.setAttribute("userEmail", (email != null && !email.isBlank()) ? email : "sarah.j@company.com");
            session.setAttribute("companyName", "ITSoftLab Technologies");
        } else {
            session.setAttribute("userName", (username != null && !username.isBlank()) ? username : "Alex Morgan");
            session.setAttribute("userEmail", (email != null && !email.isBlank()) ? email : "alex.morgan@email.com");
        }

        return "redirect:/dashboard";
    }

    @GetMapping("/register")
    public String register(@RequestParam(value = "role", required = false) String role, Model model) {
        model.addAttribute("selectedRole", role != null ? role.toUpperCase() : "USER");
        return "register";
    }

    @PostMapping("/register")
    public String processRegister(
            @RequestParam(value = "role", defaultValue = "USER") String role,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "companyName", required = false) String companyName,
            HttpSession session) {

        String activeRole = "HR".equalsIgnoreCase(role) ? "HR" : "USER";
        session.setAttribute("userRole", activeRole);

        if ("HR".equalsIgnoreCase(activeRole)) {
            session.setAttribute("userName", (fullName != null && !fullName.isBlank()) ? fullName : "Sarah Jenkins");
            session.setAttribute("userEmail", (email != null && !email.isBlank()) ? email : "sarah.j@company.com");
            session.setAttribute("companyName", (companyName != null && !companyName.isBlank()) ? companyName : "ITSoftLab Technologies");
        } else {
            session.setAttribute("userName", (fullName != null && !fullName.isBlank()) ? fullName : "Alex Morgan");
            session.setAttribute("userEmail", (email != null && !email.isBlank()) ? email : "alex.morgan@email.com");
        }

        return "redirect:/dashboard";
    }

    // ==========================================
    // COMMON DASHBOARD PAGES
    // ==========================================

    @GetMapping("/dashboard")
    public String dashboard(
            @RequestParam(value = "role", required = false) String role,
            HttpSession session,
            Model model) {

        // Determine active role from parameter or session
        String activeRole = role;
        if (activeRole == null || activeRole.isBlank()) {
            activeRole = (String) session.getAttribute("userRole");
        }
        if (activeRole == null || activeRole.isBlank()) {
            activeRole = "USER"; // Default
        }

        session.setAttribute("userRole", activeRole.toUpperCase());
        setupCommonModel(model, session, activeRole.toUpperCase());

        return "dashboard/index";
    }

    @GetMapping("/dashboard/profile")
    public String profile(HttpSession session, Model model) {
        String role = getSessionRole(session);
        setupCommonModel(model, session, role);
        return "dashboard/profile";
    }

    @GetMapping("/dashboard/settings")
    public String settings(HttpSession session, Model model) {
        String role = getSessionRole(session);
        setupCommonModel(model, session, role);
        return "dashboard/settings";
    }

    @GetMapping("/dashboard/notifications")
    public String notifications(HttpSession session, Model model) {
        String role = getSessionRole(session);
        setupCommonModel(model, session, role);
        return "dashboard/notifications";
    }

    @GetMapping("/dashboard/help")
    public String help(HttpSession session, Model model) {
        String role = getSessionRole(session);
        setupCommonModel(model, session, role);
        return "dashboard/help";
    }

    // ==========================================
    // NORMAL USER / JOB SEEKER WORKFLOW
    // ==========================================

    @GetMapping("/dashboard/resumeanalyzer")
    public String resumeAnalyzer(HttpSession session, Model model) {
        setupCommonModel(model, session, "USER");
        model.addAttribute("pageTitle", "Resume Analyzer");
        return "dashboard/user/resumeanalyzer";
    }

    @GetMapping("/dashboard/analyzerhistory")
    public String analyzerHistory(HttpSession session, Model model) {
        setupCommonModel(model, session, "USER");
        model.addAttribute("pageTitle", "Analyzer History");
        return "dashboard/user/analyzerhistory";
    }

    @GetMapping("/dashboard/jobroles")
    public String jobRoles(HttpSession session, Model model) {
        setupCommonModel(model, session, "USER");
        model.addAttribute("pageTitle", "Job Roles");
        return "dashboard/user/jobroles";
    }

    @GetMapping("/dashboard/resumeimprovement")
    public String resumeImprovement(HttpSession session, Model model) {
        setupCommonModel(model, session, "USER");
        model.addAttribute("pageTitle", "Resume Improvement");
        return "dashboard/user/resumeimprovement";
    }

    @GetMapping("/dashboard/skillsgap")
    public String skillsGap(HttpSession session, Model model) {
        setupCommonModel(model, session, "USER");
        model.addAttribute("pageTitle", "Skills Gap Analysis");
        return "dashboard/user/skillsgap";
    }

    // ==========================================
    // HR / RECRUITER WORKFLOW
    // ==========================================

    @GetMapping("/dashboard/jobs")
    public String hrJobs(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Job Management");
        return "dashboard/hr/jobs";
    }

    @GetMapping("/dashboard/jobs/create")
    public String createJobForm(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Create Job");
        return "dashboard/hr/job-form";
    }

    @GetMapping("/dashboard/jobs/{jobId}")
    public String jobDetails(@PathVariable("jobId") String jobId, HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Job Details");
        model.addAttribute("jobId", jobId);
        return "dashboard/hr/job-details";
    }

    @GetMapping("/dashboard/candidates")
    public String candidates(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Candidates");
        return "dashboard/hr/candidates";
    }

    @GetMapping("/dashboard/candidates/{candidateId}")
    public String candidateDetails(@PathVariable("candidateId") String candidateId, HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Candidate Profile");
        model.addAttribute("candidateId", candidateId);
        return "dashboard/hr/candidate-details";
    }

    @GetMapping("/dashboard/applications")
    public String applications(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Applications Pipeline");
        return "dashboard/hr/applications";
    }

    @GetMapping("/dashboard/shortlist")
    public String shortlist(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Shortlisted Candidates");
        return "dashboard/hr/shortlist";
    }

    @GetMapping("/dashboard/interviews")
    public String interviews(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Interview Management");
        return "dashboard/hr/interviews";
    }

    @GetMapping("/dashboard/feedback")
    public String feedback(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Interview Feedback");
        return "dashboard/hr/feedback";
    }

    @GetMapping("/dashboard/reports")
    public String reports(HttpSession session, Model model) {
        setupCommonModel(model, session, "HR");
        model.addAttribute("pageTitle", "Recruitment Reports");
        return "dashboard/hr/reports";
    }

    // ==========================================
    // BACKWARD COMPATIBLE LEGACY ROUTES
    // ==========================================

    @GetMapping("/analyzer")
    public String legacyAnalyzer(HttpSession session, Model model) {
        return resumeAnalyzer(session, model);
    }

    @GetMapping("/ats-checker")
    public String legacyAtsChecker(HttpSession session, Model model) {
        return resumeAnalyzer(session, model);
    }

    @GetMapping("/history")
    public String legacyHistory(HttpSession session, Model model) {
        return analyzerHistory(session, model);
    }

    @GetMapping("/job-roles")
    public String legacyJobRoles(HttpSession session, Model model) {
        return jobRoles(session, model);
    }

    @GetMapping("/profile")
    public String legacyProfile(HttpSession session, Model model) {
        return profile(session, model);
    }

    @GetMapping("/settings")
    public String legacySettings(HttpSession session, Model model) {
        return settings(session, model);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private String getSessionRole(HttpSession session) {
        String role = (String) session.getAttribute("userRole");
        return (role != null && !role.isBlank()) ? role : "USER";
    }

    private void setupCommonModel(Model model, HttpSession session, String role) {
        model.addAttribute("userRole", role);
        model.addAttribute("theme", "light");

        String sessionName = (String) session.getAttribute("userName");
        String sessionEmail = (String) session.getAttribute("userEmail");
        String sessionCompany = (String) session.getAttribute("companyName");

        if ("HR".equalsIgnoreCase(role)) {
            model.addAttribute("userName", (sessionName != null && !sessionName.isBlank()) ? sessionName : "Sarah Jenkins");
            model.addAttribute("userEmail", (sessionEmail != null && !sessionEmail.isBlank()) ? sessionEmail : "sarah.j@company.com");
            model.addAttribute("companyName", (sessionCompany != null && !sessionCompany.isBlank()) ? sessionCompany : "ITSoftLab Technologies");
        } else {
            model.addAttribute("userName", (sessionName != null && !sessionName.isBlank()) ? sessionName : "Alex Morgan");
            model.addAttribute("userEmail", (sessionEmail != null && !sessionEmail.isBlank()) ? sessionEmail : "alex.morgan@email.com");
            model.addAttribute("totalAnalyses", 6);
            model.addAttribute("averageAtsScore", 82.0);
            model.addAttribute("averageSkillMatch", 78.0);
            model.addAttribute("latestAnalysisDate", LocalDate.now());
        }
    }
}
