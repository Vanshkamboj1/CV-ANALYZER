package com.resumeAnlayazer.backend.service.impl;

import com.resumeAnlayazer.backend.dto.JobPostingRequestDTO;
import com.resumeAnlayazer.backend.dto.JobPostingResponseDto;
import com.resumeAnlayazer.backend.model.HRUserModel;
import com.resumeAnlayazer.backend.model.JobPostingModel;
import com.resumeAnlayazer.backend.repository.HRUserRepository;
import com.resumeAnlayazer.backend.repository.JobPostingRepository;
import com.resumeAnlayazer.backend.service.JobPostingService;
import com.resumeAnlayazer.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final HRUserRepository hrUserRepository;

    public JobPostingServiceImpl(JobPostingRepository jobPostingRepository,
                                 HRUserRepository hrUserRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.hrUserRepository = hrUserRepository;
    }


    @Override
    public JobPostingResponseDto createJobPosting(JobPostingRequestDTO requestDto) {
        HRUserModel hrUser = hrUserRepository.findById(requestDto.getHrUserId())
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        JobPostingModel jobPosting = JobPostingModel.builder()
                .hrUser(hrUser)
                .jobTitle(requestDto.getJobTitle())
                .jobDescription(requestDto.getJobDescription())
                .skills(requestDto.getSkills())
                .status(requestDto.getStatus() != null ? requestDto.getStatus() : "Draft")
                .build();

        JobPostingModel saved = jobPostingRepository.save(jobPosting);
        return mapToResponseDto(saved);
    }

    @Override
    public List<JobPostingResponseDto> getAllByHrUserId(Long hrUserId) {
        return jobPostingRepository.findByHrUserId(hrUserId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public JobPostingResponseDto getJobPostingById(Long id) {
        JobPostingModel jobPosting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found"));
        return mapToResponseDto(jobPosting);
    }

    @Override
    public void deleteJobPosting(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job posting not found");
        }
        jobPostingRepository.deleteById(id);
    }

    private JobPostingResponseDto mapToResponseDto(JobPostingModel model) {
        return JobPostingResponseDto.builder()
                .id(model.getId())
                .hrUserId(model.getHrUser().getId())
                .jobTitle(model.getJobTitle())
                .jobDescription(model.getJobDescription())
                .skills(model.getSkills())
                .status(model.getStatus())
                .createdAt(model.getCreatedAt())
                .build();
    }
}
