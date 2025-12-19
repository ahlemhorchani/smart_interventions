package com.cityconnect.smart_interventions.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.cityconnect.smart_interventions.model.*;
import com.cityconnect.smart_interventions.repository.*;
import com.cityconnect.smart_interventions.service.StatistiquesService;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StatistiquesServiceImpl implements StatistiquesService {

    private final InterventionRepository interventionRepo;
    private final UserRepository userRepo;
    private final ServiceMunicipalRepository serviceMunicipalRepo;  // Assumant que ce repository existe

    @Override
    public Statistiques calculerStatistiquesGenerales() {

        Statistiques stats = new Statistiques();

        List<Intervention> interventions = interventionRepo.findAll();
        long total = interventions.size();
        long terminee = interventions.stream()
                .filter(i -> i.getStatut() == Intervention.Statut.TERMINEE)
                .count();

        // Taux de résolution
        stats.setTauxResolution(total == 0 ? 0.0 : (double) terminee / total);

        // Temps moyen d'intervention
        double tempsMoyen = interventions.stream()
                .filter(i -> i.getDateDebut() != null && i.getDateFin() != null)
                .mapToDouble(i -> (i.getDateFin().getTime() - i.getDateDebut().getTime()) / (1000.0 * 60 * 60))
                .average()
                .orElse(0.0);
        stats.setTempsMoyenIntervention(tempsMoyen);

        // Nombre d'interventions par service
        Map<String, Integer> nbParService = new HashMap<>();
        for (Intervention i : interventions) {
            String nomService = "Inconnu";
            if (i.getServiceMunicipalId() != null) {
                // Récupérer le nom via le repository (i.getServiceMunicipalId() est maintenant un String ID)
                Optional<ServiceMunicipal> service = serviceMunicipalRepo.findById(i.getServiceMunicipalId());
                if (service.isPresent()) {
                    nomService = service.get().getNom();
                }
            }
            nbParService.put(nomService, nbParService.getOrDefault(nomService, 0) + 1);
        }
        stats.setNbInterventionsParService(nbParService);

        // Nombre d'interventions par zone (si champ zone ajouté)
        // stats.setNbInterventionsParZone(...);

        // Performance des techniciens
        Map<String, Double> perfTechniciens = new HashMap<>();
        for (User t : userRepo.findAll()) {
            long count = interventions.stream()
                    .filter(i -> i.getTechnicienId() != null &&
                                 i.getTechnicienId().equals(t.getId()) &&  // Changé : i.getTechnicienId() est déjà String (ID)
                                 i.getStatut() == Intervention.Statut.TERMINEE)
                    .count();
            perfTechniciens.put(t.getNom(), (double) count);
        }
        stats.setPerformanceTechniciens(perfTechniciens);

        // Top zones → si pas de champ zone, laisse vide
        stats.setTopZonesProblemes(new ArrayList<>());

        // Taux de satisfaction
        stats.setTauxSatisfactionCitoyens(total == 0 ? 0.0 : (double) terminee / total);

        return stats;
    }
}