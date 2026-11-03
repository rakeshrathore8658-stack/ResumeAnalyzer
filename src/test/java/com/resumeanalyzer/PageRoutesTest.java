package com.resumeanalyzer;

import com.resumeanalyzer.controller.AuthController;
import com.resumeanalyzer.controller.PageController;
import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {PageController.class, AuthController.class})
@AutoConfigureMockMvc(addFilters = false)
class PageRoutesTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private com.resumeanalyzer.service.JobService jobService;

    @MockitoBean
    private com.resumeanalyzer.repository.ResumeAnalysisRepository resumeAnalysisRepository;

    @MockitoBean
    private com.resumeanalyzer.repository.UserRepository userRepository;

    @MockitoBean
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @MockitoBean
    private com.resumeanalyzer.service.ReportService reportService;

    @MockitoBean
    private com.resumeanalyzer.service.ResumeParserService resumeParserService;

    @MockitoBean
    private com.resumeanalyzer.service.ResumeNormalizationService resumeNormalizationService;

    @MockitoBean
    private com.resumeanalyzer.service.ResumeExtractionService resumeExtractionService;

    @MockitoBean
    private com.resumeanalyzer.repository.ResumeRepository resumeRepository;

    @MockitoBean
    private com.resumeanalyzer.service.ResumeAnalysisService resumeAnalysisService;

    @MockitoBean
    private com.resumeanalyzer.service.NotificationService notificationService;

    @Test
    @DisplayName("1. Public Pages (Home, Login, Register, Forgot Password)")
    void testPublicPages() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("index"));

        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));

        mockMvc.perform(get("/register"))
                .andExpect(status().isOk())
                .andExpect(view().name("register"));

        mockMvc.perform(get("/forgot-password"))
                .andExpect(status().isOk())
                .andExpect(view().name("forgot-password"));
    }

    @Test
    @DisplayName("2. Dashboard Common Pages")
    void testDashboardCommonPages() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/index"));

        mockMvc.perform(get("/dashboard").param("role", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/index"))
                .andExpect(model().attribute("userRole", "HR"));

        mockMvc.perform(get("/dashboard/profile"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/profile"));

        mockMvc.perform(get("/dashboard/settings"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/settings"));

        mockMvc.perform(get("/dashboard/notifications"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/notifications"));

        mockMvc.perform(get("/dashboard/help"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/help"));
    }

    @Test
    @DisplayName("3. Job Seeker / User Workflows")
    void testUserWorkflowPages() throws Exception {
        mockMvc.perform(get("/dashboard/resumeanalyzer"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/resumeanalyzer"));

        mockMvc.perform(get("/dashboard/analyzerhistory"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/analyzerhistory"));

        com.resumeanalyzer.entity.Job testJob = new com.resumeanalyzer.entity.Job();
        testJob.setId(1L);
        testJob.setTitle("Senior Java Developer");
        testJob.setDepartment("Engineering");
        testJob.setRequiredSkills("Java, Spring Boot, Microservices");
        testJob.setMinExperience(3);
        testJob.setMaxExperience(6);
        testJob.setLocation("Indore / Remote");
        testJob.setDescription("Design enterprise services");
        testJob.setStatus("Open");
        org.mockito.Mockito.when(jobService.getAllJobs()).thenReturn(java.util.List.of(testJob));

        mockMvc.perform(get("/dashboard/jobroles"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/jobroles"));

        mockMvc.perform(get("/dashboard/resumeimprovement"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/resumeimprovement"));

        mockMvc.perform(get("/dashboard/skillsgap"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/skillsgap"));
    }

    @Test
    @DisplayName("4. HR & Recruiter Workflows (Candidates, Shortlist, Jobs, Interviews, Reports)")
    void testHrWorkflowPages() throws Exception {
        mockMvc.perform(get("/dashboard/jobs").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/jobs"));

        mockMvc.perform(get("/dashboard/jobs/create").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/job-form"));

        mockMvc.perform(get("/dashboard/jobs/job-101").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/job-details"));

        mockMvc.perform(get("/dashboard/candidates").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/candidates"));

        mockMvc.perform(get("/dashboard/candidate").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/candidates"));

        mockMvc.perform(get("/dashboard/candidates/cand-101").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/candidate-details"));

        mockMvc.perform(get("/dashboard/applications").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/applications"));

        mockMvc.perform(get("/dashboard/shortlist").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/shortlist"));

        mockMvc.perform(get("/dashboard/interviews").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/interviews"));

        mockMvc.perform(get("/dashboard/feedback").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/feedback"));

        mockMvc.perform(get("/dashboard/reports").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/hr/reports"));

        mockMvc.perform(get("/dashboard/reports/export").sessionAttr("userRole", "HR"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("5. Legacy Fallback Routes")
    void testLegacyFallbackPages() throws Exception {
        mockMvc.perform(get("/analyzer"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/resumeanalyzer"));

        mockMvc.perform(get("/ats-checker"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/resumeanalyzer"));

        mockMvc.perform(get("/history"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/analyzerhistory"));

        mockMvc.perform(get("/job-roles"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/user/jobroles"));

        mockMvc.perform(get("/profile"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/profile"));

        mockMvc.perform(get("/settings"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard/settings"));
    }

    @Test
    @DisplayName("6. Role-Based Route Access Control")
    void testRouteAccessControl() throws Exception {
        // HR user trying to access Job Seeker tool -> redirected to /dashboard?denied=hr_restricted
        mockMvc.perform(get("/dashboard/resumeanalyzer").sessionAttr("userRole", "HR"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard?denied=hr_restricted"));

        // Seeker user trying to access HR tool -> redirected to /dashboard?denied=seeker_restricted
        mockMvc.perform(get("/dashboard/jobs").sessionAttr("userRole", "USER"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard?denied=seeker_restricted"));
    }

    @Test
    @DisplayName("7. Form Submissions (Login, Role Mismatch & Registration)")
    void testFormSubmissions() throws Exception {
        User hrUser = new User();
        hrUser.setFullName("Sarah Jenkins");
        hrUser.setEmail("sarah@company.com");
        hrUser.setRole("HR");
        hrUser.setCompanyName("ITSoftLab");

        User seekerUser = new User();
        seekerUser.setFullName("Alex Morgan");
        seekerUser.setEmail("alex@email.com");
        seekerUser.setRole("USER");

        Mockito.when(authService.authenticate(eq("sarah@company.com"), eq("password123"))).thenReturn(Optional.of(hrUser));
        Mockito.when(authService.authenticate(eq("alex@email.com"), eq("password123"))).thenReturn(Optional.of(seekerUser));
        Mockito.when(authService.register(any(RegisterRequest.class))).thenReturn(hrUser);
        Mockito.when(authService.resetPassword(eq("alex@email.com"), any())).thenReturn(true);

        // HR Login with HR portal -> redirected to /dashboard (SUCCESS)
        mockMvc.perform(post("/login")
                        .param("role", "HR")
                        .param("username", "sarah@company.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard"));

        // Seeker Login with USER portal -> redirected to /dashboard (SUCCESS)
        mockMvc.perform(post("/login")
                        .param("role", "USER")
                        .param("username", "alex@email.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard"));

        // HR user trying to log into Job Seeker portal -> PORTAL MISMATCH ERROR
        mockMvc.perform(post("/login")
                        .param("role", "USER")
                        .param("username", "sarah@company.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=portal_mismatch&role=USER&username=sarah@company.com"));

        // Seeker user trying to log into HR portal -> PORTAL MISMATCH ERROR
        mockMvc.perform(post("/login")
                        .param("role", "HR")
                        .param("username", "alex@email.com")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=portal_mismatch&role=HR&username=alex@email.com"));

        // Register HR with Phone Number
        mockMvc.perform(post("/register")
                        .param("role", "HR")
                        .param("fullName", "Sarah Jenkins")
                        .param("email", "sarah@company.com")
                        .param("phoneNumber", "+91 98765 43210")
                        .param("password", "password123")
                        .param("confirmPassword", "password123")
                        .param("companyName", "ITSoftLab"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard"));

        // Forgot Password
        mockMvc.perform(post("/forgot-password")
                        .param("email", "alex@email.com")
                        .param("newPassword", "newPassword123")
                        .param("confirmPassword", "newPassword123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?reset=true"));

        // Logout Flow (GET & POST)
        mockMvc.perform(get("/logout"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?logout=true"));

        mockMvc.perform(post("/logout"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?logout=true"));
    }
}
