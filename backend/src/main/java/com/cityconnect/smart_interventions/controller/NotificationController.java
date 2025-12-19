package com.cityconnect.smart_interventions.controller;

import com.cityconnect.smart_interventions.model.Notification;
import com.cityconnect.smart_interventions.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController  // Pour retourner des réponses JSON (API REST)
@RequestMapping("/api/notifications")  // Mapping de base pour les notifications
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 🔹 Récupérer les notifications pour un utilisateur spécifique
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsForUser(@PathVariable String userId) {
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }
    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAll();  // Ajoutez cette méthode dans NotificationService et NotificationServiceImpl
        return ResponseEntity.ok(notifications);
    }

    // 🔹 Marquer une notification comme lue
    @PutMapping("/{notifId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notifId) {
        notificationService.markAsRead(notifId);
        return ResponseEntity.noContent().build();  // Retourne 204 No Content
    }

    // 🔹 Envoyer une nouvelle notification (optionnel, si vous voulez ajouter un endpoint pour créer)
    @PostMapping
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        Notification sent = notificationService.send(notification);
        return ResponseEntity.ok(sent);
    }
}