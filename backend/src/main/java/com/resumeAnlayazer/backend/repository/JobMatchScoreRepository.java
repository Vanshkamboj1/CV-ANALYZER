package com.resumeAnlayazer.backend.repository;

import com.resumeAnlayazer.backend.model.JobMatchScoreModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobMatchScoreRepository extends JpaRepository<JobMatchScoreModel, Long> {
    Optional<JobMatchScoreModel> findFirstByJobIdAndResumeId(Long jobId, Long resumeId);
    List<JobMatchScoreModel> findByJobId(Long jobId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM JobMatchScoreModel j WHERE j.job.id = :jobId")
    void deleteByJobId(Long jobId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM JobMatchScoreModel j WHERE j.resume.id = :resumeId")
    void deleteByResumeId(Long resumeId);
}
