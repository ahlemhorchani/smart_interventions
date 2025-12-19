package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Requête mise à jour pour les champs String (un seul paramètre)
    @Query("{ $or: [ { 'citoyenId': ?0 }, { 'technicienId': ?0 } ] }")
    List<Notification> findByCitoyenIdOrTechnicienId(String userId);  // Un seul paramètre
}
