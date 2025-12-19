package com.cityconnect.smart_interventions.controller;

import com.cityconnect.smart_interventions.dto.InterventionDTO;
import com.cityconnect.smart_interventions.model.Intervention;
import com.cityconnect.smart_interventions.service.InterventionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder; 
@Slf4j  // Pour les logs
@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")  // À adapter selon vos besoins de sécurité
public class InterventionController {

    private final InterventionService service;

    // 🔹 Créer une intervention
    @PostMapping
    public ResponseEntity<InterventionDTO> create(@RequestBody InterventionDTO dto) {
        log.info("Création intervention: {}", dto.getTitre());
        Intervention created = service.create(dto.toEntity());
        return ResponseEntity.ok(InterventionDTO.fromEntity(created));
    }

    // 🔹 Mettre à jour une intervention
    @PutMapping("/{id}")
    public ResponseEntity<Intervention> update(@PathVariable String id,
                                               @RequestBody Intervention intervention) {
        log.info("Mise à jour intervention: {}", id);
        Intervention updated = service.update(id, intervention);
        return ResponseEntity.ok(updated);
    }

    // 🔹 Supprimer une intervention
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.info("Suppression intervention: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // 🔹 Récupérer une intervention par ID
    @GetMapping("/{id}")
    public ResponseEntity<InterventionDTO> getById(@PathVariable String id) {
        log.info("Récupération intervention: {}", id);
        Intervention intervention = service.getById(id);
        InterventionDTO dto = InterventionDTO.fromEntity(intervention);
        return ResponseEntity.ok(dto);
    }

    // 🔹 Récupérer toutes les interventions
    @GetMapping
    public ResponseEntity<List<InterventionDTO>> getAll() {
        log.info("Récupération de toutes les interventions");
        List<Intervention> list = service.getAll();
        List<InterventionDTO> dtoList = list.stream()
                                            .map(InterventionDTO::fromEntity)
                                            .toList();
        log.info("Nombre d'interventions retournées: {}", dtoList.size());
        return ResponseEntity.ok(dtoList);
    }

    // 🔹 Récupérer les interventions par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Intervention>> getByStatut(@PathVariable String statut) {
        log.info("Récupération interventions par statut: {}", statut);
        List<Intervention> list = service.findByStatut(statut);
        return ResponseEntity.ok(list);
    }

    // 🔹 Changer le statut d'une intervention
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Intervention> changerStatut(@PathVariable String id,
                                                      @RequestParam String nouveauStatut,
                                                      @RequestParam String auteurId) {
        log.info("Changement statut intervention {} vers {}", id, nouveauStatut);
        Intervention updated = service.changerStatut(id, nouveauStatut, auteurId);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/technicien/me")
    public ResponseEntity<List<InterventionDTO>> getMyInterventions() {
        try {
            // Récupérer l'authentification
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                log.error("Utilisateur non authentifié");
                return ResponseEntity.status(401).build();
            }
            
            String technicienId = authentication.getName();
            log.info("=== REQUÊTE REÇUE: GET /api/interventions/technicien/me ===");
            log.info("Technicien authentifié: {}", technicienId);
            
            List<Intervention> list = service.getInterventionsByTechnicien(technicienId);
            log.info("Interventions trouvées: {}", list.size());
            
            List<InterventionDTO> dtoList = list.stream()
                                                .map(InterventionDTO::fromEntity)
                                                .collect(Collectors.toList());
            
            log.info("DTOs créés: {}", dtoList.size());
            
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des interventions du technicien", e);
            return ResponseEntity.status(500).build();
        }
    }


    // 🔹 Récupérer les interventions par technicien
    @GetMapping("/technicien/{technicienId}")
    public ResponseEntity<List<InterventionDTO>> getByTechnicien(@PathVariable String technicienId) {
        log.info("=== REQUÊTE REÇUE: GET /api/interventions/technicien/{} ===", technicienId);
        
        try {
            List<Intervention> list = service.getInterventionsByTechnicien(technicienId);
            log.info("Interventions trouvées: {}", list.size());
            
            List<InterventionDTO> dtoList = list.stream()
                                                .map(InterventionDTO::fromEntity)
                                                .toList();
            
            log.info("DTOs créés: {}", dtoList.size());
            
            // Log détaillé des interventions
            dtoList.forEach(dto -> 
                log.debug("Intervention: {} - Technicien: {} - Statut: {}", 
                    dto.getId(), dto.getTechnicienId(), dto.getStatut())
            );
            
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des interventions du technicien {}", technicienId, e);
            throw e;
        }
        
    }
}