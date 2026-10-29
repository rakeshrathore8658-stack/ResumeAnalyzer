
package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.dto.UserResponse;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService
{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder)
    {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request)
    {
        // 1. Check whether email already exists
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email))
        {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // 2. Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException(
                    "Password and confirm password do not match."
            );
        }

        // 3. Ensure terms have been accepted
        if (!request.isTermsAccepted()) {
            throw new IllegalArgumentException(
                    "You must accept the terms and conditions."
            );
        }

        // 4. Create User entity
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        // Never store a plain-text password
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setCareerRole(request.getCareerRole());
        user.setTermsAccepted(true);

        // 5. Save user in database
        User savedUser = userRepository.save(user);

        // 6. Return safe response without password
        return new UserResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getCareerRole(),
                savedUser.getCreatedAt()
        );
    }
}
