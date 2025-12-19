package com.cityconnect.smart_interventions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicienDTO {

    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String numeroTelephone;
    private Boolean disponibilite;
    private String position;
    private Double latitude;
    private Double longitude;
    private Integer score;           // Score calculé côté backend ou front pour suggestion
    private Boolean competencesMatch; // Indique si le technicien est compétent pour le type d'intervention

    // Constructeur pour mapper depuis un User
    public TechnicienDTO(com.cityconnect.smart_interventions.model.User user) {
        this.id = user.getId();
        this.nom = user.getNom();
        this.prenom = user.getPrenom();
        this.email = user.getEmail();
        this.numeroTelephone = user.getNumeroTelephone();
        this.disponibilite = user.getDisponibilite();
        this.position = user.getPosition();
        this.latitude = user.getLatitude();
        this.longitude = user.getLongitude();
        this.score = 0; // Valeur par défaut
        this.competencesMatch = false; // Valeur par défaut
    }
}
