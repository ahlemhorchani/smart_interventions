package com.cityconnect.smart_interventions.service.impl;

import com.cityconnect.smart_interventions.dto.*;
import com.cityconnect.smart_interventions.model.User;
import com.cityconnect.smart_interventions.repository.UserRepository;
import com.cityconnect.smart_interventions.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.cityconnect.smart_interventions.service.*;

import java.util.Date;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest request) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new Exception("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new Exception("Mot de passe incorrect");
        }

        String token = jwtUtils.generateToken(user.getId(),  user.getEmail(), user.getRole().name());

        return new LoginResponse(
            token,
            user.getRole().name(),
            user.getNom(),
            user.getPrenom(),
            user.getId()
        );
    }

    @Override
    public LoginResponse register(RegisterRequest request) throws Exception {
        // Logs de débogage
        System.out.println("=== REGISTER START ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Role reçu: " + request.getRole());

        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            System.out.println("❌ Email déjà utilisé");
            throw new Exception("Email déjà utilisé");
        }

        // Validation et conversion du rôle
        User.Role userRole;
        try {
            userRole = User.Role.valueOf(request.getRole().toUpperCase());
            System.out.println("✅ Rôle converti: " + userRole);
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Rôle invalide: " + request.getRole());
            throw new Exception("Rôle invalide: " + request.getRole());
        }

        // Validation des champs obligatoires
        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            throw new Exception("Le nom est obligatoire");
        }
        if (request.getPrenom() == null || request.getPrenom().trim().isEmpty()) {
            throw new Exception("Le prénom est obligatoire");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new Exception("L'email est obligatoire");
        }
        if (request.getMotDePasse() == null || request.getMotDePasse().length() < 6) {
            throw new Exception("Le mot de passe doit contenir au moins 6 caractères");
        }

        // Encoder le mot de passe
        String encodedPassword = passwordEncoder.encode(request.getMotDePasse());
        System.out.println("✅ Mot de passe encodé");

        // Créer l'utilisateur
        User user = User.builder()
            .nom(request.getNom().trim())
            .prenom(request.getPrenom().trim())
            .email(request.getEmail().trim().toLowerCase())
            .motDePasse(encodedPassword)
            .role(userRole)
            .disponibilite(true)
            .dateCreation(new Date())
            .dateModification(new Date())
            .build();

        User savedUser = null;
        try {
            savedUser = userRepository.save(user);
            System.out.println("✅ Utilisateur sauvegardé: " + savedUser.getId());
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la sauvegarde: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("Erreur lors de la création de l'utilisateur: " + e.getMessage());
        }

        // ⭐ CORRECTION : Retirer le code en double et générer le token
        String token = jwtUtils.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        return new LoginResponse(
            token,
            savedUser.getRole().name(),
            savedUser.getNom(),
            savedUser.getPrenom(),
            savedUser.getId()
        );
    }
}