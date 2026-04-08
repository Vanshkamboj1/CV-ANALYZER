package com.resumeAnlayazer.backend.repository;

import com.resumeAnlayazer.backend.model.FeedbackModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackModel, Long> {
    Optional<FeedbackModel> findByJobIdAndResumeId(Long jobId, Long resumeId);
}
