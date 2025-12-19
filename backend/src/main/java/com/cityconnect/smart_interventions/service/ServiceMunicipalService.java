package com.cityconnect.smart_interventions.service;

import com.cityconnect.smart_interventions.model.ServiceMunicipal;
import java.util.List;

public interface ServiceMunicipalService {

    ServiceMunicipal create(ServiceMunicipal s);

    List<ServiceMunicipal> getAll();

    ServiceMunicipal getById(String id);

    void delete(String id);

    ServiceMunicipal update(String id, ServiceMunicipal service);

    List<ServiceMunicipal> searchByNom(String nom);

    void addInterventionRecent(
            String serviceId,
            String titre,
            String statut,
            String urgence
    );
}
