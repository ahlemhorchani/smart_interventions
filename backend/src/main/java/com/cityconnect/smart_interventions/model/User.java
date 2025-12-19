package com.cityconnect.smart_interventions.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String nom;
    private String prenom;

    @Indexed(unique = true)
    private String email;

    private String motDePasse;
    private Role role;
    private Boolean disponibilite;
    private String position;
    private Double latitude;
    private Double longitude;
    private String numeroTelephone;
    private Date dateCreation;
    private Date dateModification;

    public enum Role {
        ADMIN,
        TECHNICIEN,
        CITOYEN
    }
}