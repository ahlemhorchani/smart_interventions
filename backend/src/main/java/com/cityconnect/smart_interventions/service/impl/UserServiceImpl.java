package com.cityconnect.smart_interventions.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Date;
import java.util.List;

import com.cityconnect.smart_interventions.model.User;
import com.cityconnect.smart_interventions.repository.*;
import com.cityconnect.smart_interventions.service.*;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
	@Autowired
    private final UserRepository repository;

    @Override
    public User create(User u) {
        u.setDateCreation(new Date());
        return repository.save(u);
    }

    @Override
    public User update(String id, User u) {
        User ex = repository.findById(id).orElseThrow();

        ex.setNom(u.getNom());
        ex.setPrenom(u.getPrenom());
        ex.setEmail(u.getEmail());
        ex.setNumeroTelephone(u.getNumeroTelephone());
        ex.setPosition(u.getPosition());
        ex.setDisponibilite(u.getDisponibilite());

        ex.setDateModification(new Date());

        return repository.save(ex);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    @Override
    public User getById(String id) {
        return repository.findById(id).orElseThrow();
    }

    @Override
    public List<User> getAll() {
        return repository.findAll();
    }

    @Override
    public List<User> findTechniciensDisponibles() {
        return repository.findByRoleAndDisponibilite("TECHNICIEN", true);
    }
}
