package com.cityconnect.smart_interventions.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private String role; // ADMIN ou TECHNICIEN
}
