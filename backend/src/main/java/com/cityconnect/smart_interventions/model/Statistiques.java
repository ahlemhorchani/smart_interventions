package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "statistiques")
public class Statistiques {

    @Id
    private String id;

    private Double tauxResolution;
    private Double tempsMoyenIntervention;
    private Map<String, Integer> nbInterventionsParService;
    private Map<String, Integer> nbInterventionsParZone;
    private Map<String, Double> performanceTechniciens;
    private List<String> topZonesProblemes;
    private Double tauxSatisfactionCitoyens;
}