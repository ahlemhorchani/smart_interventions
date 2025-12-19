package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.ServiceMunicipal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceMunicipalRepository extends MongoRepository<ServiceMunicipal, String> {
}
