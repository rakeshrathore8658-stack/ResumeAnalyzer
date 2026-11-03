package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.dto.UserResponse;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user (Job Seeker or HR Recruiter) with encrypted password.
     */
    @Transactional
    public User register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists: " + email);
        }

        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }

        String assignedRole = (request.getRole() != null && !request.getRole().isBlank())
                ? request.getRole().trim().toUpperCase()
                : "USER";

        User user = new User();
        user.setFullName(request.getFullName() != null ? request.getFullName().trim() : "SmartHire User");
        user.setEmail(email);
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);
        user.setCareerRole(request.getCareerRole() != null && !request.getCareerRole().isBlank()
                ? request.getCareerRole().trim()
                : ("HR".equalsIgnoreCase(assignedRole) ? "HR / Recruiter" : "General"));
        user.setCompanyName(request.getCompanyName() != null ? request.getCompanyName().trim() : null);
        user.setTermsAccepted(true);

        return userRepository.save(user);
    }

    /**
     * Converts a User entity to a safe UserResponse DTO.
     */
    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getCareerRole(),
                user.getCompanyName(),
                user.getCreatedAt()
        );
    }

    /**
     * Finds a user by email address.
     */
    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    /**
     * Verifies user password credentials against the stored bcrypt hash.
     */
    public Optional<User> authenticate(String email, String rawPassword) {
        if (email == null || rawPassword == null) return Optional.empty();
        Optional<User> userOpt = findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    /**
     * Resets password for an existing user account.
     */
    @Transactional
    public boolean resetPassword(String email, String newPassword) {
        if (email == null || newPassword == null || newPassword.isBlank()) {
            return false;
        }

        Optional<User> userOpt = findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    /**
     * Ensures initial default demo users exist so users can easily test role login.
     */
    @Transactional
    public void ensureDemoUsersExist() {
        // 1. Demo Job Seeker
        String seekerEmail = "alex.morgan@email.com";
        if (!userRepository.existsByEmail(seekerEmail)) {
            User seeker = new User();
            seeker.setFullName("Alex Morgan");
            seeker.setEmail(seekerEmail);
            seeker.setPhoneNumber("+91 98765 43210");
            seeker.setPasswordHash(passwordEncoder.encode("password123"));
            seeker.setRole("USER");
            seeker.setCareerRole("Java Developer");
            seeker.setTermsAccepted(true);
            userRepository.save(seeker);
        }

        // 2. Demo HR Recruiter
        String hrEmail = "sarah.j@company.com";
        if (!userRepository.existsByEmail(hrEmail)) {
            User hr = new User();
            hr.setFullName("Sarah Jenkins");
            hr.setEmail(hrEmail);
            hr.setPhoneNumber("+91 91234 56789");
            hr.setPasswordHash(passwordEncoder.encode("password123"));
            hr.setRole("HR");
            hr.setCareerRole("HR / Recruiter");
            hr.setCompanyName("ITSoftLab Technologies");
            hr.setTermsAccepted(true);
            userRepository.save(hr);
        }
    }
}
