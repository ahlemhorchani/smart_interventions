package com.cityconnect.smart_interventions.dto;

import java.util.Date;
import java.util.List;
import com.cityconnect.smart_interventions.model.Intervention;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InterventionDTO {
    private String id;
    private String titre;
    private String type;
    private String description;
    private String urgence;
    private String statut;
    private Date dateCreation;
    private String equipementId;    // En string depuis l'API
    private String technicienId;    // En string depuis l'API
    private String citoyenId;       // Peut être null
    private String serviceMunicipalId;
    private List<Intervention.Commentaire> commentaires;
    private List<Intervention.HistoriqueStatut> historiqueStatut;
    private Date dateDebut;
    private Date dateFin;
    private Integer dureeReelle;

    // Méthode pour convertir DTO -> Entity (AJOUTEZ CECI!)
    public Intervention toEntity() {
        Intervention intervention = new Intervention();
        intervention.setId(this.id);
        intervention.setTitre(this.titre);
        intervention.setType(this.type);
        intervention.setDescription(this.description);
        
        // Gérer les énumérations
        if (this.urgence != null) {
            try {
                intervention.setUrgence(Intervention.Urgence.valueOf(this.urgence));
            } catch (IllegalArgumentException e) {
                intervention.setUrgence(Intervention.Urgence.NORMAL);
            }
        } else {
            intervention.setUrgence(Intervention.Urgence.NORMAL);
        }
        
        if (this.statut != null) {
            try {
                intervention.setStatut(Intervention.Statut.valueOf(this.statut));
            } catch (IllegalArgumentException e) {
                intervention.setStatut(Intervention.Statut.EN_ATTENTE);
            }
        } else {
            intervention.setStatut(Intervention.Statut.EN_ATTENTE);
        }
        
        intervention.setDateCreation(this.dateCreation != null ? this.dateCreation : new Date());
        
        // ✅ Définir les IDs directement comme strings
        intervention.setEquipementId(this.equipementId);
        intervention.setTechnicienId(this.technicienId);
        
        // ✅ citoyenId peut être null ou vide
        if (this.citoyenId != null && !this.citoyenId.trim().isEmpty()) {
            intervention.setCitoyenId(this.citoyenId);
        } else {
            intervention.setCitoyenId(null);
        }
        
        // ✅ serviceMunicipalId
        if (this.serviceMunicipalId != null && !this.serviceMunicipalId.isEmpty()) {
            intervention.setServiceMunicipalId(this.serviceMunicipalId);
        }
        
        intervention.setCommentaires(this.commentaires);
        intervention.setHistoriqueStatut(this.historiqueStatut);
        intervention.setDateDebut(this.dateDebut);
        intervention.setDateFin(this.dateFin);
        intervention.setDureeReelle(this.dureeReelle);
        
        return intervention;
    }

    public static InterventionDTO fromEntity(Intervention intervention) {
        InterventionDTO dto = new InterventionDTO();
        dto.setId(intervention.getId());
        dto.setTitre(intervention.getTitre());
        dto.setType(intervention.getType());
        dto.setDescription(intervention.getDescription());
        dto.setUrgence(intervention.getUrgence() != null ? intervention.getUrgence().name() : null);
        dto.setStatut(intervention.getStatut() != null ? intervention.getStatut().name() : null);
        dto.setDateCreation(intervention.getDateCreation());
        
        // Les IDs sont déjà des strings dans l'entité
        dto.setEquipementId(intervention.getEquipementId());
        dto.setTechnicienId(intervention.getTechnicienId());
        dto.setCitoyenId(intervention.getCitoyenId());
        dto.setServiceMunicipalId(intervention.getServiceMunicipalId());
        
        dto.setCommentaires(intervention.getCommentaires());
        dto.setHistoriqueStatut(intervention.getHistoriqueStatut());
        dto.setDateDebut(intervention.getDateDebut());
        dto.setDateFin(intervention.getDateFin());
        dto.setDureeReelle(intervention.getDureeReelle());
        return dto;
    }
}