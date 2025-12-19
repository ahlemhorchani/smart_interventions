package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.*;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.bson.types.ObjectId;

import java.util.Date;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "equipements")
public class Equipement {

    @Id
    private String id;

    private String type;
    private String adresse;
    private EtatEquipement etat;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint localisation;

    private List<InterventionResume> dernieresInterventions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterventionResume {
    	
    	private ObjectId interventionId;
        private String titre;
        private Date date;
        private String technicien;
    }

    public enum EtatEquipement {
        FONCTIONNEL,
        DEFECTUEUX
    }
}
