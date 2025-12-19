package com.cityconnect.smart_interventions.controller;


import com.cityconnect.smart_interventions.model.Equipement;
import com.cityconnect.smart_interventions.service.EquipementService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
@RequiredArgsConstructor
public class EquipementController {
    
    private final EquipementService equipementService;
    
    @GetMapping("/all")
    public ResponseEntity<List<Equipement>> getAllEquipements() {
        return ResponseEntity.ok(equipementService.getAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Equipement> getEquipementById(@PathVariable String id) {
        return ResponseEntity.ok(equipementService.getById(id));
    }
    
    @PostMapping("/create")
    public ResponseEntity<Equipement> createEquipement(@RequestBody Equipement equipement) {
        return ResponseEntity.ok(equipementService.create(equipement));
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<Equipement> updateEquipement(@PathVariable String id, @RequestBody Equipement equipement) {
        return ResponseEntity.ok(equipementService.update(id, equipement));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteEquipement(@PathVariable String id) {
        equipementService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/etat/{etat}")
    public ResponseEntity<List<Equipement>> getEquipementsByEtat(@PathVariable String etat) {
        try {
            Equipement.EtatEquipement etatEnum = Equipement.EtatEquipement.valueOf(etat);
            return ResponseEntity.ok(equipementService.findByEtat(etatEnum));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{equipementId}/add-intervention")
    public ResponseEntity<Void> addIntervention(
            @PathVariable String equipementId,
            @RequestBody AddInterventionRequest request) {
        equipementService.addInterventionToEquipement(
            equipementId,
            request.getInterventionId(),
            request.getTitre(),
            request.getTechnicien()
        );
        return ResponseEntity.ok().build();
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddInterventionRequest {
        private String interventionId;
        private String titre;
        private String technicien;
    }
}