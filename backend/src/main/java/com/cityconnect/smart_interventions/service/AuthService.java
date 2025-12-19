package com.cityconnect.smart_interventions.service;
import com.cityconnect.smart_interventions.dto.LoginRequest;
import com.cityconnect.smart_interventions.dto.LoginResponse;
import com.cityconnect.smart_interventions.dto.RegisterRequest;

public interface AuthService {
	  LoginResponse login(LoginRequest request) throws Exception;
	    
	    // Méthode pour l'inscription
	    LoginResponse register(RegisterRequest request) throws Exception;


}
