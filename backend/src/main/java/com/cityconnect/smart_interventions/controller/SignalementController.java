package com.cityconnect.smart_interventions.controller;

import com.cityconnect.smart_interventions.model.Signalement;
import com.cityconnect.smart_interventions.service.SignalementService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/signalements")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class SignalementController {

    private final SignalementService signalementService;

    @PostMapping("/create")
    public ResponseEntity<Signalement> create(@RequestBody Signalement s) {
        return ResponseEntity.ok(signalementService.create(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Signalement> update(
            @PathVariable String id, @RequestBody Signalement s) {

        return ResponseEntity.ok(signalementService.update(id, s));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Signalement> updateStatut(
            @PathVariable String id,
            @RequestParam String statut) {

        return ResponseEntity.ok(signalementService.updateStatut(id, statut));
    }
    @GetMapping("/all")
    public ResponseEntity<List<Signalement>> getAllSignalements() {
        return ResponseEntity.ok(signalementService.getAll());
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<Void> uploadPhoto(
            @PathVariable String id,
            @RequestParam("photo") MultipartFile file) {

        signalementService.uploadPhoto(id, file);
        return ResponseEntity.ok().build();
    }
}
