package com.resumeanalyzer.service;

import com.resumeanalyzer.entity.Notification;
import com.resumeanalyzer.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Dispatch and persist notification to a candidate / user.
     */
    @Transactional
    public Notification sendNotification(
            String userEmail,
            String candidateName,
            String title,
            String message,
            String type,
            String actionUrl) {

        if (userEmail == null || userEmail.isBlank()) {
            log.warn("Cannot send notification: userEmail is null or empty. Title: {}", title);
            return null;
        }

        String normalizedEmail = userEmail.trim().toLowerCase();

        Notification notification = Notification.builder()
                .userEmail(normalizedEmail)
                .candidateName(candidateName)
                .title(title)
                .message(message)
                .type(type != null ? type : "SYSTEM")
                .actionUrl(actionUrl != null ? actionUrl : "/dashboard")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        Long savedId = saved != null ? saved.getId() : null;
        log.info("Notification dispatched [id={}] to user [{}] type=[{}]: {}",
                savedId, normalizedEmail, type, title);
        return saved != null ? saved : notification;
    }

    /**
     * Retrieve all notifications for a specific user email.
     */
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return Collections.emptyList();
        }
        return notificationRepository.findByUserEmailIgnoreCaseOrderByCreatedAtDesc(userEmail.trim());
    }

    /**
     * Retrieve top recent notifications for header dropdown.
     */
    @Transactional(readOnly = true)
    public List<Notification> getRecentNotifications(String userEmail, int limit) {
        if (userEmail == null || userEmail.isBlank()) {
            return Collections.emptyList();
        }
        List<Notification> notifs = notificationRepository.findTop5ByUserEmailIgnoreCaseOrderByCreatedAtDesc(userEmail.trim());
        if (notifs.size() > limit) {
            return notifs.subList(0, limit);
        }
        return notifs;
    }

    /**
     * Count unread notifications for badge counter.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return 0;
        }
        return notificationRepository.countByUserEmailIgnoreCaseAndIsReadFalse(userEmail.trim());
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public void markAllRead(String userEmail) {
        if (userEmail != null && !userEmail.isBlank()) {
            notificationRepository.markAllAsReadForEmail(userEmail.trim().toLowerCase());
            log.info("Marked all notifications as read for user: {}", userEmail);
        }
    }

    /**
     * Mark a single notification as read by ID.
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        if (notificationId != null) {
            notificationRepository.markAsReadById(notificationId);
        }
    }
}
