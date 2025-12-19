package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.Equipement;
import com.cityconnect.smart_interventions.model.Equipement.EtatEquipement;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipementRepository extends MongoRepository<Equipement, String> {
    
        List<Equipement> findByEtat(EtatEquipement etat);  
    
}