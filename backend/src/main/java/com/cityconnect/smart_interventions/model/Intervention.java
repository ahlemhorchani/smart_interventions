package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import org.springframework.lang.Nullable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interventions")
public class Intervention {
    @Id
    private String id;

    private String titre;
    private String type;
    private String description;
    private Urgence urgence;
    private Statut statut;
    private Date dateCreation;

    // SUPPRIMEZ @Field(targetType = FieldType.OBJECT_ID)
    private String equipementId;
    
    // SUPPRIMEZ @Field(targetType = FieldType.OBJECT_ID)
    private String technicienId;
    
    // SUPPRIMEZ @Field(targetType = FieldType.OBJECT_ID)
    @Nullable
    private String citoyenId;
    
    // SUPPRIMEZ @Field(targetType = FieldType.OBJECT_ID)
    private String serviceMunicipalId;
    
    private List<Commentaire> commentaires;
    private List<HistoriqueStatut> historiqueStatut;
    private Date dateDebut;
    private Date dateFin;
    private Integer dureeReelle;

    public enum Urgence { NORMAL, URGENT }
    public enum Statut { EN_ATTENTE, EN_COURS, TERMINEE }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Commentaire {
        private String auteurId;
        private String texte;
        private Date date;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoriqueStatut {
        private String ancienStatut;
        private String nouveauStatut;
        private Date dateChangement;
        private String auteurId;
    }
}