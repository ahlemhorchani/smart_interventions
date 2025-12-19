package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String message;
    private Date dateEnvoi;
    private boolean statutLecture;
    private String typeNotification;

    // Changé : Stocker seulement l'ID en String (pas d'@DBRef)
    private String citoyenId;  // Était : @DBRef private User citoyenId;
    private String technicienId;  // Était : @DBRef private User technicienId;
    private String interventionId;  // Était : @DBRef private Intervention interventionId;

    private Date dateCreation;

    // Supprimez le toString() personnalisé si inutile, ou mettez-le à jour
}