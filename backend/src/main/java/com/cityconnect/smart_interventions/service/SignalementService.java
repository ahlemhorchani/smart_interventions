package com.cityconnect.smart_interventions.service;

import java.util.List;

import com.cityconnect.smart_interventions.model.Signalement;
import org.springframework.web.multipart.MultipartFile;

public interface SignalementService {

    Signalement create(Signalement s);

    List<Signalement> getAll();

    Signalement getById(String id);

    List<Signalement> getByStatut(String statut);

    List<Signalement> getByType(String type);

    List<Signalement> getUrgents();

    List<Signalement> getByCitoyen(String citoyenId);
    
    Signalement update(String id, Signalement updated);


    Signalement updateStatut(String id, String statut);

    Signalement lierIntervention(String signalementId, String interventionId);

    void ajouterHistorique(String id, String action, String responsable);

    void uploadPhoto(String id, MultipartFile photo);
}