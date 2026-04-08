package com.resumeAnlayazer.backend.controller;

import com.resumeAnlayazer.backend.dto.FeedbackRequestDTO;
import com.resumeAnlayazer.backend.model.FeedbackModel;
import com.resumeAnlayazer.backend.model.JobPostingModel;
import com.resumeAnlayazer.backend.model.UploadedTextModel;
import com.resumeAnlayazer.backend.repository.FeedbackRepository;
import com.resumeAnlayazer.backend.repository.JobPostingRepository;
import com.resumeAnlayazer.backend.repository.UploadedTextRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UploadedTextRepository uploadedTextRepository;

    public FeedbackController(FeedbackRepository feedbackRepository, JobPostingRepository jobPostingRepository, UploadedTextRepository uploadedTextRepository) {
        this.feedbackRepository = feedbackRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.uploadedTextRepository = uploadedTextRepository;
    }

    @PostMapping("/{jobId}/resumes/{resumeId}/feedback")
    public ResponseEntity<FeedbackModel> saveOrUpdateFeedback(
            @PathVariable Long jobId,
            @PathVariable Long resumeId,
            @RequestBody FeedbackRequestDTO request) {

        JobPostingModel job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        UploadedTextModel resume = uploadedTextRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        FeedbackModel feedback = feedbackRepository.findByJobIdAndResumeId(jobId, resumeId)
                .orElse(new FeedbackModel());

        feedback.setJob(job);
        feedback.setResume(resume);
        feedback.setFeedbackText(request.getFeedbackText());
        feedback.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");

        FeedbackModel savedFeedback = feedbackRepository.save(feedback);
        return ResponseEntity.ok(savedFeedback);
    }
}
