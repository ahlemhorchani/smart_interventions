package com.cityconnect.smart_interventions.service.impl;

import com.cityconnect.smart_interventions.model.Equipement;
import com.cityconnect.smart_interventions.model.Equipement.EtatEquipement;
import com.cityconnect.smart_interventions.repository.EquipementRepository;
import com.cityconnect.smart_interventions.service.EquipementService;
import lombok.RequiredArgsConstructor;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EquipementServiceImpl implements EquipementService {
	@Autowired
    private final EquipementRepository repository;

    @Override
    public Equipement create(Equipement equipement) {
        return repository.save(equipement);
    }

    @Override
    public Equipement update(String id, Equipement equipement) {
        Equipement ex = repository.findById(id).orElseThrow();
        ex.setType(equipement.getType());
        ex.setAdresse(equipement.getAdresse());
        ex.setEtat(equipement.getEtat());
        ex.setLocalisation(equipement.getLocalisation());
        return repository.save(ex);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    @Override
    public Equipement getById(String id) {
        return repository.findById(id).orElseThrow();
    }

    @Override
    public List<Equipement> getAll() {
        return repository.findAll();
    }

    @Override
    public List<Equipement> findByEtat(EtatEquipement etat) {  // Correction du type
        return repository.findByEtat(etat);
    }

    @Override
    public void addInterventionToEquipement(String equipementId, String interventionId, String titre, String technicien) {
        Equipement eq = repository.findById(equipementId).orElseThrow();

        if (eq.getDernieresInterventions() == null) {
            eq.setDernieresInterventions(new ArrayList<>());
        }

        Equipement.InterventionResume inter = new Equipement.InterventionResume();
        inter.setInterventionId(new ObjectId(interventionId));
        inter.setTitre(titre);
        inter.setTechnicien(technicien);
        inter.setDate(new Date());

        eq.getDernieresInterventions().add(inter);
        repository.save(eq);
    }

}
