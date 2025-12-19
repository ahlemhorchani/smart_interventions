package com.cityconnect.smart_interventions.controller;

import com.cityconnect.smart_interventions.model.ServiceMunicipal;
import com.cityconnect.smart_interventions.service.ServiceMunicipalService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services-municipaux")
@RequiredArgsConstructor
public class ServiceMunicipalController {

    private final ServiceMunicipalService serviceMunicipalService;

    /**
     * ➕ Créer un service municipal
     */
    @PostMapping("/create")
    public ResponseEntity<ServiceMunicipal> create(@RequestBody ServiceMunicipal s) {
        System.out.println("📥 Création service: " + s.getNom());
        ServiceMunicipal created = serviceMunicipalService.create(s);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 📄 Récupérer tous les services
     */
    @GetMapping("/all")
    public ResponseEntity<List<ServiceMunicipal>> getAll() {
        System.out.println("📥 GET /all - Récupération de tous les services");
        List<ServiceMunicipal> services = serviceMunicipalService.getAll();
        System.out.println("✅ " + services.size() + " service(s) trouvé(s)");
        return ResponseEntity.ok(services);
    }

    /**
     * 🔍 Récupérer un service par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        System.out.println("📥 GET /" + id + " - Récupération du service");
        
        try {
            // ✅ Validation de l'ID
            if (id == null || id.trim().isEmpty()) {
                System.err.println("❌ ID vide ou null");
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "L'ID du service ne peut pas être vide"));
            }
            
            ServiceMunicipal service = serviceMunicipalService.getById(id);
            System.out.println("✅ Service trouvé: " + service.getNom());
            return ResponseEntity.ok(service);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Service non trouvé avec ID: " + id);
            System.err.println("❌ Erreur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Service non trouvé avec l'ID: " + id));
        } catch (Exception e) {
            System.err.println("❌ Erreur serveur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur serveur: " + e.getMessage()));
        }
    }

    /**
     * ✏️ Mettre à jour un service
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody ServiceMunicipal service) {
        System.out.println("📥 PUT /update/" + id);
        
        try {
            ServiceMunicipal updated = serviceMunicipalService.update(id, service);
            System.out.println("✅ Service mis à jour: " + updated.getNom());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.err.println("❌ Service non trouvé: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Erreur mise à jour: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur lors de la mise à jour"));
        }
    }

    /**
     * 🗑️ Supprimer un service
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        System.out.println("📥 DELETE /delete/" + id);
        
        try {
            serviceMunicipalService.delete(id);
            System.out.println("✅ Service supprimé: " + id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("❌ Service non trouvé: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * ➕ Ajouter une intervention récente à un service
     * ✅ CORRECTION: Retourner un objet Map au lieu de String
     */
    @PostMapping("/{serviceId}/interventions/add")
    public ResponseEntity<Map<String, String>> addInterventionRecent(
            @PathVariable String serviceId,
            @RequestParam String titre,
            @RequestParam String statut,
            @RequestParam String urgence
    ) {
        System.out.println("📥 POST /" + serviceId + "/interventions/add");
        System.out.println("   - Titre: " + titre);
        System.out.println("   - Statut: " + statut);
        System.out.println("   - Urgence: " + urgence);
        
        try {
            serviceMunicipalService.addInterventionRecent(serviceId, titre, statut, urgence);
            System.out.println("✅ Intervention ajoutée avec succès");
            
            // ✅ CORRECTION: Retourner un Map au lieu d'un String
            return ResponseEntity.ok(Map.of("message", "Intervention ajoutée avec succès !"));
            
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Paramètres invalides: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Paramètres invalides: " + e.getMessage()));
        } catch (RuntimeException e) {
            System.err.println("❌ Service non trouvé: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Service non trouvé: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Erreur serveur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur serveur: " + e.getMessage()));
        }
    }


    /**
     * 🔍 Rechercher par nom
     */
    @GetMapping("/search")
    public ResponseEntity<List<ServiceMunicipal>> searchByName(@RequestParam String nom) {
        System.out.println("📥 GET /search?nom=" + nom);
        List<ServiceMunicipal> services = serviceMunicipalService.searchByNom(nom);
        System.out.println("✅ " + services.size() + " service(s) trouvé(s)");
        return ResponseEntity.ok(services);
    }
}