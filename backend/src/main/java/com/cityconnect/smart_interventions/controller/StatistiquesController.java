package com.cityconnect.smart_interventions.controller;

import com.cityconnect.smart_interventions.model.Statistiques;
import com.cityconnect.smart_interventions.service.StatistiquesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    /**
     * Récupérer les statistiques générales
     */
    @GetMapping("/generales")
    public ResponseEntity<Statistiques> getStatistiquesGenerales() {
        Statistiques stats = statistiquesService.calculerStatistiquesGenerales();
        return ResponseEntity.ok(stats);
    }
}