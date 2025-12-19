package com.cityconnect.smart_interventions.utils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        
        System.out.println("\n=== JWT FILTER ===");
        System.out.println("Path: " + path);
        System.out.println("Method: " + method);
        
        // Ignorer OPTIONS (preflight CORS) et les routes d'authentification
        if (method.equals("OPTIONS") || path.startsWith("/api/auth/")) {
            System.out.println("⏩ Skipping JWT check for: " + (method.equals("OPTIONS") ? "OPTIONS" : "auth endpoint"));
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + (authHeader != null ? "Present" : "Null"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Token found: " + token.substring(0, Math.min(20, token.length())) + "...");

            try {
                if (jwtUtils.isTokenValid(token)) {
                    System.out.println("✅ Token VALID");
                    
                    // ⭐ CRUCIAL : Extraire l'email et mettre l'authentification dans SecurityContext
                    String email = jwtUtils.extractUsername(token);
                    System.out.println("✅ Email extracted: " + email);
                    
                    // Créer l'authentification Spring Security
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                    
                    // ⭐ METTRE l'authentification dans le contexte (TRÈS IMPORTANT)
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("✅ Authentication set in SecurityContext for: " + email);
                    
                } else {
                    System.out.println("❌ Token INVALID");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Token invalide\"}");
                    return;
                }
            } catch (Exception e) {
                System.out.println("❌ Token ERROR: " + e.getMessage());
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Erreur token: " + e.getMessage() + "\"}");
                return;
            }
        } else {
            System.out.println("⚠️ No Authorization header found");
            // Ne pas bloquer ici - laisser Spring Security décider
        }

        System.out.println("✅ Proceeding with filter chain...");
        filterChain.doFilter(request, response);
    }
}