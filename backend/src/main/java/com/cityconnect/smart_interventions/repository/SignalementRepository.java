package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.Signalement;
import com.cityconnect.smart_interventions.model.Signalement.Statut;
import com.cityconnect.smart_interventions.model.Signalement.Type;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementRepository extends MongoRepository<Signalement, String> {
    
    List<Signalement> findByStatut(Statut statut);
    
    List<Signalement> findByType(Type type);
    
    List<Signalement> findByUrgence(String urgence);
    
    List<Signalement> findByCitoyenId(String citoyenId);
}