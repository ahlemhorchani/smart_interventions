package com.cityconnect.smart_interventions.service.impl;

import com.cityconnect.smart_interventions.model.Signalement;
import com.cityconnect.smart_interventions.model.Signalement.Statut;
import com.cityconnect.smart_interventions.model.Signalement.Type;
import com.cityconnect.smart_interventions.repository.SignalementRepository;
import com.cityconnect.smart_interventions.service.SignalementService;
import com.cityconnect.smart_interventions.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SignalementServiceImpl implements SignalementService {

    private final SignalementRepository repository;
    private final StorageService storage;

    @Override
    public Signalement create(Signalement s) {
        clean(s);
        addHistoriqueInitial(s);
        return repository.save(s);
    }

    @Override
    public List<Signalement> getAll() {
        return repository.findAll();
    }

    @Override
    public Signalement getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
    }

    @Override
    public List<Signalement> getByStatut(String statut) {
        return repository.findByStatut(Statut.valueOf(statut));
    }

    @Override
    public List<Signalement> getByType(String type) {
        return repository.findByType(Type.valueOf(type));
    }

    @Override
    public List<Signalement> getUrgents() {
        return repository.findByUrgence("HIGH");
    }

    @Override
    public List<Signalement> getByCitoyen(String citoyenId) {
        return repository.findByCitoyenId(citoyenId);
    }

    @Override
    public Signalement update(String id, Signalement updated) {
        Signalement existing = getById(id);
        updated.setId(id);
        updated.setDateCreation(existing.getDateCreation());
        return repository.save(updated);
    }

    @Override
    public Signalement updateStatut(String id, String statut) {
        Signalement s = getById(id);
        s.setStatut(Statut.valueOf(statut));

        ajouterHistorique(id, "Statut mis à jour : " + statut, "Système");

        return repository.save(s);
    }

    @Override
    public Signalement lierIntervention(String signalementId, String interventionId) {
        Signalement s = getById(signalementId);
        s.setInterventionId(interventionId);
        return repository.save(s);
    }

    @Override
    public void ajouterHistorique(String id, String action, String responsable) {
        Signalement s = getById(id);

        Signalement.Historique h = new Signalement.Historique(new Date(), action, responsable);

        if (s.getHistorique() == null)
            s.setHistorique(new ArrayList<>());

        s.getHistorique().add(h);
        repository.save(s);
    }

    @Override
    public void uploadPhoto(String id, MultipartFile photo) {
        Signalement s = getById(id);

        String filename = storage.store(photo, "signalement_" + id);
        s.setPhoto(filename);

        repository.save(s);
    }

    private void clean(Signalement s) {
        if (s.getCoordonnees() == null) s.setCoordonnees("Non spécifié");
        if (s.getAdresse() == null) s.setAdresse(s.getLocalisation());
        if (s.getContactTelephone() == null) s.setContactTelephone("");
    }

    private void addHistoriqueInitial(Signalement s) {
        s.setDateCreation(new Date());
        s.setStatut(Statut.RECU);

        Signalement.Historique h = new Signalement.Historique(
                new Date(), "Signalement créé", s.getContactNom()
        );

        s.setHistorique(new ArrayList<>());
        s.getHistorique().add(h);
    }
}
