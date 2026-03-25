package com.resumeAnlayazer.backend.repository;

import com.resumeAnlayazer.backend.model.HRUserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HRUserRepository extends JpaRepository<HRUserModel,Long> {
    Optional<HRUserModel> findByEmail(String email);
    boolean existsByEmail(String email);
}
