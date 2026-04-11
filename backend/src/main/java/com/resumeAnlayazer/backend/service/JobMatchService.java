package com.resumeAnlayazer.backend.service;

import com.resumeAnlayazer.backend.dto.MatchScoreDTO;
import java.util.List;

public interface JobMatchService {
    List<MatchScoreDTO> getMatchesForJob(Long jobId);
    void retryAIAssessment(Long jobId, Long resumeId);
}
