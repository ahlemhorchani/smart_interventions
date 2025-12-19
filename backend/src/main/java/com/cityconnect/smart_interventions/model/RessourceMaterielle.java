package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "ressources_materielles")
public class RessourceMaterielle {

    @Id
    private String id;

    private String nom;
    private Integer quantiteDisponible;
    private String uniteMesure;
    private Date dateDernierApprovisionnement;
    private List<UtilisationRecent> utilisationsRecent;
    private Integer seuilAlerte;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UtilisationRecent {
        private String interventionId;
        private Integer quantiteUtilisee;
        private Date date;
    }
}