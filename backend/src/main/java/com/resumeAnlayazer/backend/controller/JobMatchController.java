package com.resumeAnlayazer.backend.controller;

import com.resumeAnlayazer.backend.dto.MatchScoreDTO;
import com.resumeAnlayazer.backend.service.JobMatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobMatchController {

    private final JobMatchService jobMatchService;

    public JobMatchController(JobMatchService jobMatchService) {
        this.jobMatchService = jobMatchService;
    }

    /**
     * API: Get match scores for all resumes belonging to the HR who posted this job.
     *
     * Example: GET /api/jobs/12/matches
     *
     * @param jobId ID of the job for which to calculate resume matches
     * @return List of resumes with their match scores
     */
    @GetMapping("/{jobId}/matches")
    public ResponseEntity<List<MatchScoreDTO>> getJobMatches(@PathVariable Long jobId) {
        List<MatchScoreDTO> matches = jobMatchService.getMatchesForJob(jobId);
        return ResponseEntity.ok(matches);
    }
}
