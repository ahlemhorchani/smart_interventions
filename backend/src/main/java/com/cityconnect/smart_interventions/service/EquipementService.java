package com.cityconnect.smart_interventions.service;

import com.cityconnect.smart_interventions.model.Equipement;
import com.cityconnect.smart_interventions.model.Equipement.EtatEquipement; // IMPORTANT
import java.util.List;

public interface EquipementService {

    Equipement create(Equipement equipement);

    Equipement update(String id, Equipement equipement);

    void delete(String id);

    Equipement getById(String id);

    List<Equipement> getAll();

    // CORRECTION: Utiliser EtatEquipement au lieu de String
    List<Equipement> findByEtat(EtatEquipement etat);  // Changé de String à EtatEquipement

    void addInterventionToEquipement(String equipementId, String interventionId, String titre, String technicien);
}