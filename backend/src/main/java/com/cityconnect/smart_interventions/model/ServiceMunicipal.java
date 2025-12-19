package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "services_municipaux")
public class ServiceMunicipal {

	@MongoId(FieldType.STRING)
	private String id;

    private String nom;
    private String description;
    private List<InterventionRecent> interventionsRecent;
    private Date dateCreation;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterventionRecent {
        private String titre;
        private Intervention.Statut statut;
        private Date dateCreation;
        private Intervention.Urgence urgence;
    }
}
