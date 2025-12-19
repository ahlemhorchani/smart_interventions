package com.cityconnect.smart_interventions.service.impl;

import com.cityconnect.smart_interventions.model.Notification;
import com.cityconnect.smart_interventions.repository.NotificationRepository;
import com.cityconnect.smart_interventions.service.NotificationService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private final NotificationRepository repository;

    @Override
    public Notification send(Notification n) {
        n.setDateCreation(new Date());
        n.setDateEnvoi(new Date());
        n.setStatutLecture(false);
        return repository.save(n);
    }

    @Override
    public List<Notification> getNotificationsForUser(String userId) {
        // Correction : Appel avec un seul argument (le repository gère les deux champs via la requête @Query)
        return repository.findByCitoyenIdOrTechnicienId(userId);
    }

    @Override
    public void markAsRead(String notifId) {
        Notification n = repository.findById(notifId).orElseThrow();
        n.setStatutLecture(true);
        repository.save(n);
    }

    // 🔹 Implémentation de la nouvelle méthode
    @Override
    public List<Notification> getAll() {
        return repository.findAll();
    }
}