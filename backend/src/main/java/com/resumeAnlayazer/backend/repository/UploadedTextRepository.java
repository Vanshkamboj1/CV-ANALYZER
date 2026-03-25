package com.resumeAnlayazer.backend.repository;

import com.resumeAnlayazer.backend.model.UploadedTextModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadedTextRepository extends JpaRepository<UploadedTextModel,Long> {
    List<UploadedTextModel> findByHrUserId(Long hrUserId);

}
