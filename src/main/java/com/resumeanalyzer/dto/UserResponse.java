
package com.resumeanalyzer.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String careerRole;
    private LocalDateTime createdAt;

    public UserResponse(
            Long id,
            String fullName,
            String email,
            String careerRole,
            LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.careerRole = careerRole;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getCareerRole() {
        return careerRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
