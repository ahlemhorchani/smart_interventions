package com.cityconnect.smart_interventions.model;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "signalements")
public class Signalement {
    @Id
    private String id;

    @NotBlank(message = "Le titre est requis")
    @Size(max = 100, message = "Le titre ne peut pas dépasser 100 caractères")
    private String titre;

    @NotBlank(message = "La description est requise")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    @NotBlank(message = "Le type est requis")
    @Pattern(regexp = "POTHOLE|LIGHTING|GARBAGE|TREE|WATER|SIGNAL|OTHER", 
             message = "Type invalide. Valeurs autorisées: POTHOLE, LIGHTING, GARBAGE, TREE, WATER, SIGNAL, OTHER")
    private String type;

    @NotBlank(message = "L'urgence est requise")
    @Pattern(regexp = "LOW|MEDIUM|HIGH", 
             message = "Urgence invalide. Valeurs autorisées: LOW, MEDIUM, HIGH")
    private String urgence;

    private String photo;

    @NotBlank(message = "La localisation est requise")
    private String localisation;

    @NotBlank(message = "Les coordonnées sont requises")
    private String coordonnees;

    @NotBlank(message = "L'adresse est requise")
    private String adresse;

    @NotNull(message = "Le statut est requis")
    private Statut statut;

    @NotBlank(message = "Le nom de contact est requis")
    private String contactNom;

    @NotBlank(message = "L'email de contact est requis")
    @Email(message = "Format d'email invalide")
    private String contactEmail;

    @Pattern(regexp = "^[0-9]{8}$|^$", 
             message = "Le téléphone doit contenir exactement 8 chiffres ou être vide")
    private String contactTelephone;

    private String citoyenId;
    
    private String interventionId;

    private List<Historique> historique;

    @NotNull(message = "La date de création est requise")
    private Date dateCreation;

    public enum Statut {
        RECU,
        EN_TRAITEMENT,
        RESOLU
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Historique {
        private Date date;
        private String action;
        private String responsable;
    }

    // Enums pour référence
    public enum Type {
        POTHOLE,
        LIGHTING,
        GARBAGE,
        TREE,
        WATER,
        SIGNAL,
        OTHER
    }

    public enum Urgence {
        LOW,
        MEDIUM,
        HIGH
    }
}