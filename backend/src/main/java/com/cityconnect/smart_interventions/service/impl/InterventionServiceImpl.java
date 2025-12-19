package com.cityconnect.smart_interventions.service.impl;

import com.cityconnect.smart_interventions.model.Intervention;
import com.cityconnect.smart_interventions.repository.InterventionRepository;
import com.cityconnect.smart_interventions.service.InterventionService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterventionServiceImpl implements InterventionService {
    
    @Autowired
    private final InterventionRepository repository;

    @Override
    public Intervention create(Intervention i) {
        i.setDateCreation(new Date());
        return repository.save(i);
    }

    @Override
    public Intervention update(String id, Intervention u) {
        Intervention ex = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Intervention non trouvée avec id: " + id));
        
        ex.setTitre(u.getTitre());
        ex.setType(u.getType());
        ex.setDescription(u.getDescription());
        ex.setUrgence(u.getUrgence());
        ex.setStatut(u.getStatut());
        
        return repository.save(ex);
    }

    @Override
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Intervention non trouvée avec id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public Intervention getById(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Intervention non trouvée avec id: " + id));
    }

    @Override
    public List<Intervention> getAll() {
        return repository.findAll();
    }


    @Override
    public Intervention changerStatut(String id, String nouveauStatut, String auteurId) {
        Intervention i = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Intervention non trouvée avec id: " + id));

        if (i.getHistoriqueStatut() == null) {
            i.setHistoriqueStatut(new ArrayList<>());
        }

        Intervention.HistoriqueStatut hist = new Intervention.HistoriqueStatut();
        hist.setAncienStatut(i.getStatut().name());
        hist.setNouveauStatut(nouveauStatut);
        hist.setDateChangement(new Date());
        hist.setAuteurId(auteurId);

        i.getHistoriqueStatut().add(hist);
        i.setStatut(Intervention.Statut.valueOf(nouveauStatut));

        return repository.save(i);
    }

    @Override
    public List<Intervention> getActiveInterventions() {
        List<Intervention> all = repository.findAll();
        return all.stream()
            .filter(i -> i.getStatut() != Intervention.Statut.TERMINEE)
            .collect(Collectors.toList());
    }
    @Override
    public List<Intervention> getInterventionsByTechnicien(String technicienId) {
        return repository.findByTechnicienId(technicienId);
    }
    @Override
    public List<Intervention> findByStatut(String statut) {
        try {
            // Convertir le string en enum pour le repository
            Intervention.Statut statutEnum = Intervention.Statut.valueOf(statut.toUpperCase());
            return repository.findByStatut(statutEnum);
        } catch (IllegalArgumentException e) {
            // Retourner une liste vide si le statut n'est pas valide
            return Collections.emptyList();
        }
    }

    

    @Override
    public Intervention assignTechnicien(String id, String technicienId, String technicienNom) {
        Intervention i = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Intervention non trouvée avec id: " + id));
        
        i.setTechnicienId(technicienId);
        
        // Ajouter un commentaire pour l'historique
        if (i.getCommentaires() == null) {
            i.setCommentaires(new ArrayList<>());
        }
        
        Intervention.Commentaire commentaire = new Intervention.Commentaire();
        commentaire.setAuteurId("system");
        commentaire.setTexte("Technicien " + technicienNom + " assigné à l'intervention");
        commentaire.setDate(new Date());
        i.getCommentaires().add(commentaire);
        
        return repository.save(i);
    }
    
    // Méthode pour créer une intervention (alias de create)
    public Intervention createIntervention(Intervention intervention) {
        return create(intervention);
    }
    
    // Méthode pour compléter une intervention
    public Intervention completeIntervention(String id, String notes) {
        Intervention i = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Intervention non trouvée avec id: " + id));
        
        i.setStatut(Intervention.Statut.TERMINEE);
        i.setDateFin(new Date());
        
        if (notes != null && !notes.isEmpty()) {
            if (i.getCommentaires() == null) {
                i.setCommentaires(new ArrayList<>());
            }
            
            Intervention.Commentaire commentaire = new Intervention.Commentaire();
            commentaire.setAuteurId("system");
            commentaire.setTexte("Notes de fin: " + notes);
            commentaire.setDate(new Date());
            i.getCommentaires().add(commentaire);
        }
        
        return repository.save(i);
    }
}