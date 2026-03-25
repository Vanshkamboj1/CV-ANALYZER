package com.resumeAnlayazer.backend.repository;

import com.resumeAnlayazer.backend.model.AIResponseModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AIResponseRepository extends JpaRepository<AIResponseModel, Long> {
    Optional<AIResponseModel> findByUploadedText_Id(Long uploadedTextId);
}
