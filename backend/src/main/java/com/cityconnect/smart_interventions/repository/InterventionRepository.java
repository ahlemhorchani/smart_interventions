package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.Intervention;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterventionRepository extends MongoRepository<Intervention, String> {

    // Recherche par statut (Enum)
    List<Intervention> findByStatut(Intervention.Statut statut);
    
    // Recherche par technicien - AJOUTEZ CETTE MÉTHODE
    List<Intervention> findByTechnicienId(String technicienId);
}