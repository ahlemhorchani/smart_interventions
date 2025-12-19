package com.cityconnect.smart_interventions.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.util.Date;
import javax.crypto.SecretKey;

@Component
public class JwtUtils {

    private final String secret = "AZERTYUIOPQSDFGHJKLMWXCVBN1234567890";
    private final long expirationMs = 24 * 60 * 60 * 1000; // 24h

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ⭐ MODIFIEZ ICI : Utilisez userId comme subject au lieu de email
    public String generateToken(String userId, String email, String role) {
        return Jwts.builder()
                .subject(userId)  // ⬅️ Utilisez l'ID comme subject
                .claim("email", email)  // ⬅️ Stockez l'email dans les claims
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // ⭐ AJOUTEZ cette méthode pour extraire l'email des claims
    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    // ⭐ AJOUTEZ cette méthode pour extraire l'ID (subject)
    public String extractUserId(String token) {
        return parseClaims(token).getSubject(); // Subject = userId
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractUserId(token); // ⬅️ Retourne maintenant l'ID
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}