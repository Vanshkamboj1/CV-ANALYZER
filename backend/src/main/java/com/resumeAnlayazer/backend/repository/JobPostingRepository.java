package com.resumeAnlayazer.backend.repository;

import com.resumeAnlayazer.backend.model.JobPostingModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPostingModel,Long> {
    List<JobPostingModel> findByHrUserId(Long hrUserId);
}
