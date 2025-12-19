package com.cityconnect.smart_interventions.service;

import com.cityconnect.smart_interventions.model.Notification;
import java.util.List;

public interface NotificationService {

    Notification send(Notification n);

    List<Notification> getNotificationsForUser(String userId);

    void markAsRead(String notifId);

    // 🔹 Nouvelle méthode pour récupérer toutes les notifications
    List<Notification> getAll();
}