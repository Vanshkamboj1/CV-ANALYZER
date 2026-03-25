package com.resumeAnlayazer.backend.service;

import com.resumeAnlayazer.backend.dto.JobPostingRequestDTO;
import com.resumeAnlayazer.backend.dto.JobPostingResponseDto;

import java.util.List;

public interface JobPostingService {
    JobPostingResponseDto createJobPosting(JobPostingRequestDTO requestDto);
    List<JobPostingResponseDto> getAllByHrUserId(Long hrUserId);
    JobPostingResponseDto getJobPostingById(Long id);
    void deleteJobPosting(Long id);

}
