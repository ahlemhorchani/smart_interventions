package com.cityconnect.smart_interventions.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.*;

import com.cityconnect.smart_interventions.repository.RessourceMaterielleRepository;
import com.cityconnect.smart_interventions.model.RessourceMaterielle;
import com.cityconnect.smart_interventions.service.RessourceMaterielleService;
@Service
@RequiredArgsConstructor
public class RessourceMaterielleServiceImpl implements RessourceMaterielleService {
	@Autowired
	private final RessourceMaterielleRepository repository;

    @Override
    public RessourceMaterielle create(RessourceMaterielle r) {
        return repository.save(r);
    }

    @Override
    public RessourceMaterielle update(String id, RessourceMaterielle r) {
        RessourceMaterielle ex = repository.findById(id).orElseThrow();
        ex.setNom(r.getNom());
        ex.setQuantiteDisponible(r.getQuantiteDisponible());
        ex.setUniteMesure(r.getUniteMesure());
        ex.setSeuilAlerte(r.getSeuilAlerte());
        return repository.save(ex);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    @Override
    public RessourceMaterielle getById(String id) {
        return repository.findById(id).orElseThrow();
    }

    @Override
    public List<RessourceMaterielle> getAll() {
        return repository.findAll();
    }

    @Override
    public void enregistrerUtilisation(String id, String interventionId, int quantite) {
        RessourceMaterielle r = repository.findById(id).orElseThrow();

        if (r.getUtilisationsRecent() == null) {
            r.setUtilisationsRecent(new ArrayList<>());
        }

        RessourceMaterielle.UtilisationRecent utilisation = new RessourceMaterielle.UtilisationRecent();
        utilisation.setInterventionId(interventionId);
        utilisation.setQuantiteUtilisee(quantite);
        utilisation.setDate(new Date());

        r.setQuantiteDisponible(r.getQuantiteDisponible() - quantite);
        r.getUtilisationsRecent().add(utilisation); // ✅ fonctionne
        repository.save(r);
    }

}
