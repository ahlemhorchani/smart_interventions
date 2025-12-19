package com.cityconnect.smart_interventions.repository;

import com.cityconnect.smart_interventions.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    List<User> findByDisponibilite(Boolean disponibilite);

	List<User> findByRoleAndDisponibilite(String string, boolean b);
}
