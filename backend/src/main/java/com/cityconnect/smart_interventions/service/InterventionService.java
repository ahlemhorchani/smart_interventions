// InterventionService.java - CORRIGÉ ET SIMPLIFIÉ
package com.cityconnect.smart_interventions.service;

import com.cityconnect.smart_interventions.model.Intervention;
import java.util.List;

public interface InterventionService {

    Intervention create(Intervention i);

    Intervention update(String id, Intervention i);
 // Interface - AJOUTEZ CETTE MÉTHODE
    void delete(String id);  // Gardez delete(String), pas deleteIntervention(String)

    Intervention getById(String id);

    List<Intervention> getAll();
    List<Intervention> getInterventionsByTechnicien(String technicienId);


    List<Intervention> findByStatut(String statut);

    Intervention changerStatut(String id, String nouveauStatut, String auteurId);

    // Autres méthodes optionnelles
    List<Intervention> getActiveInterventions();

    
    Intervention assignTechnicien(String id, String technicienId, String technicienNom);
}