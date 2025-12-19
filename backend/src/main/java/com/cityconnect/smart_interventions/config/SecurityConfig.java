package com.cityconnect.smart_interventions.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.cityconnect.smart_interventions.utils.JwtFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.authorizeHttpRequests(auth -> auth
            // ⭐ IMPORTANT : Autoriser OPTIONS pour CORS preflight
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            
            // ⭐ Routes publiques (pas d'authentification requise)
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/signalements/**").permitAll()
            .requestMatchers("/api/**").authenticated()
            .requestMatchers("/api/**").permitAll()
            .requestMatchers("/api/interventions/technicien/me").hasRole("TECHNICIEN")
            
            // ⭐ TODO: Configurer les autres routes protégées plus tard
            // Pour l'instant, autoriser tout pour tester
            .anyRequest().permitAll()  // ⚠️ TEMPORAIREMENT - à changer après
        );

        // Ajouter le filtre JWT (même temporairement désactivé)
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Autorise localhost:4200
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        
        // Autorise toutes les headers importantes
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Autorise toutes les méthodes
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Autorise les credentials
        configuration.setAllowCredentials(true);
        
        // Headers exposés
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));
        
        // Cache CORS 1 heure
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}