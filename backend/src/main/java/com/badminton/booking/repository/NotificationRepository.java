package com.badminton.booking.repository;

import com.badminton.booking.entity.Notification;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser(User user);
    List<Notification> findByType(NotificationType type);
    List<Notification> findByIsRead(Boolean isRead);
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
}
