package com.resumeAnlayazer.backend.controller;

import com.resumeAnlayazer.backend.dto.JobPostingRequestDTO;
import com.resumeAnlayazer.backend.dto.JobPostingResponseDto;
import com.resumeAnlayazer.backend.service.JobPostingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobPostingController {
    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    /**
     * Create a new job posting
     */
    @PostMapping("/create")
    public ResponseEntity<JobPostingResponseDto> createJob(
            @Valid @RequestBody JobPostingRequestDTO requestDto) {

        JobPostingResponseDto createdJob = jobPostingService.createJobPosting(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }

    /**
     * Get all job postings for a specific HR user
     */
    @GetMapping("/hr/{hrId}")
    public ResponseEntity<List<JobPostingResponseDto>> getJobsByHrId(@PathVariable Long hrId) {
        List<JobPostingResponseDto> jobs = jobPostingService.getAllByHrUserId(hrId);
        return ResponseEntity.ok(jobs);
    }

    /**
     * Get a single job posting by its ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobPostingResponseDto> getJobById(@PathVariable Long id) {
        JobPostingResponseDto job = jobPostingService.getJobPostingById(id);
        return ResponseEntity.ok(job);
    }

    /**
     * Delete a job posting by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteJobPosting(@PathVariable Long id) {
        jobPostingService.deleteJobPosting(id);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Job posting deleted successfully");
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.OK.value());

        return ResponseEntity.ok(response);
    }
}
