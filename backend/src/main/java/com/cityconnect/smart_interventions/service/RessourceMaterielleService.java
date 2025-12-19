package com.cityconnect.smart_interventions.service;

import com.cityconnect.smart_interventions.model.RessourceMaterielle;
import java.util.List;

public interface RessourceMaterielleService {

    RessourceMaterielle create(RessourceMaterielle r);

    RessourceMaterielle update(String id, RessourceMaterielle r);

    void delete(String id);

    RessourceMaterielle getById(String id);

    List<RessourceMaterielle> getAll();

    void enregistrerUtilisation(String id, String interventionId, int quantite);
}
