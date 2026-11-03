package com.resumeanalyzer.controller;

import com.resumeanalyzer.entity.Notification;
import com.resumeanalyzer.service.NotificationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    private String getActiveUserEmail() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null && attrs.getRequest() != null && attrs.getRequest().getSession(false) != null) {
                HttpSession session = attrs.getRequest().getSession(false);
                String email = (String) session.getAttribute("userEmail");
                if (email != null && !email.isBlank()) {
                    return email.trim().toLowerCase();
                }
            }
        } catch (Exception ignored) {
        }

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
                return auth.getName().trim().toLowerCase();
            }
        } catch (Exception ignored) {
        }

        return "alex.morgan@email.com"; // Fallback demo seeker
    }

    @GetMapping
    public ResponseEntity<?> getUserNotifications() {
        String email = getActiveUserEmail();
        List<Notification> list = notificationService.getNotificationsForUser(email);
        long unread = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of(
                "userEmail", email,
                "unreadCount", unread,
                "totalCount", list.size(),
                "notifications", list
        ));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead() {
        String email = getActiveUserEmail();
        notificationService.markAllRead(email);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All notifications marked as read."
        ));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "notificationId", id,
                "message", "Notification marked as read."
        ));
    }
}
