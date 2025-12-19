package com.cityconnect.smart_interventions.service;

import java.util.List;

import com.cityconnect.smart_interventions.model.User;

public interface UserService {

    User create(User u);

    User update(String id, User u);

    void delete(String id);

    User getById(String id);

    List<User> getAll();

    List<User> findTechniciensDisponibles();
}
