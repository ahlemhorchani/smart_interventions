package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.RessourceMaterielle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RessourceMaterielleRepository extends MongoRepository<RessourceMaterielle, String> {

}
