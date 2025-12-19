package com.cityconnect.smart_interventions.service.impl;

import com.cityconnect.smart_interventions.model.*;
import com.cityconnect.smart_interventions.repository.ServiceMunicipalRepository;
import com.cityconnect.smart_interventions.service.ServiceMunicipalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceMunicipalServiceImpl implements ServiceMunicipalService {

    private final ServiceMunicipalRepository repository;

    @Override
    public ServiceMunicipal create(ServiceMunicipal s) {
        s.setDateCreation(new Date());
        return repository.save(s);
    }

    @Override
    public List<ServiceMunicipal> getAll() {
        return repository.findAll();
    }

    @Override
    public ServiceMunicipal getById(String id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Service non trouvé avec l'ID: " + id));
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    @Override
    public ServiceMunicipal update(String id, ServiceMunicipal service) {
        ServiceMunicipal existing = getById(id);

        existing.setNom(service.getNom());
        existing.setDescription(service.getDescription());
        if (service.getInterventionsRecent() != null) {
            existing.setInterventionsRecent(service.getInterventionsRecent());
        }

        return repository.save(existing);
    }

    @Override
    public List<ServiceMunicipal> searchByNom(String nom) {
        return repository.findAll()
                .stream()
                .filter(s -> s.getNom() != null && s.getNom().toLowerCase().contains(nom.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Override
    public void addInterventionRecent(String serviceId, String titre, String statut, String urgence) {
        ServiceMunicipal s = getById(serviceId);

        if (s.getInterventionsRecent() == null) {
            s.setInterventionsRecent(new ArrayList<>());
        }

        ServiceMunicipal.InterventionRecent inter = ServiceMunicipal.InterventionRecent.builder()
                .titre(titre)
                .statut(Intervention.Statut.valueOf(statut))
                .urgence(Intervention.Urgence.valueOf(urgence))
                .dateCreation(new Date())
                .build();

        s.getInterventionsRecent().add(inter);
        repository.save(s);
    }
}
