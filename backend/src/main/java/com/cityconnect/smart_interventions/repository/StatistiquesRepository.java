package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.Statistiques;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatistiquesRepository extends MongoRepository<Statistiques, String> {

}
