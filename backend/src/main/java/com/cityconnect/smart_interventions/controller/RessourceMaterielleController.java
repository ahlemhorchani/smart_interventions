package com.cityconnect.smart_interventions.controller;

import com.cityconnect.smart_interventions.model.RessourceMaterielle;
import com.cityconnect.smart_interventions.service.RessourceMaterielleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ressources")
@RequiredArgsConstructor
public class RessourceMaterielleController {

    private final RessourceMaterielleService service;

    /**
     * ➤ Créer une ressource matérielle
     */
    @PostMapping("/create")
    public ResponseEntity<RessourceMaterielle> create(@RequestBody RessourceMaterielle res) {
        return ResponseEntity.ok(service.create(res));
    }

    /**
     * ➤ Modifier une ressource
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<RessourceMaterielle> update(
            @PathVariable String id,
            @RequestBody RessourceMaterielle res) {

        return ResponseEntity.ok(service.update(id, res));
    }

    /**
     * ➤ Supprimer une ressource
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    /**
     * ➤ Récupérer une ressource par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RessourceMaterielle> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * ➤ Lister toutes les ressources
     */
    @GetMapping("/all")
    public ResponseEntity<List<RessourceMaterielle>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * ➤ Enregistrer l'utilisation d’une ressource dans une intervention
     */
    @PostMapping("/utilisation/{id}")
    public ResponseEntity<String> enregistrerUtilisation(
            @PathVariable String id,
            @RequestParam String interventionId,
            @RequestParam int quantite) {

        service.enregistrerUtilisation(id, interventionId, quantite);

        return ResponseEntity.ok("Utilisation enregistrée avec succès !");
    }
}
