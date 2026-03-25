package com.resumeAnlayazer.backend.service.impl;

import com.resumeAnlayazer.backend.dto.MatchScoreDTO;
import com.resumeAnlayazer.backend.model.JobPostingModel;
import com.resumeAnlayazer.backend.model.UploadedTextModel;
import com.resumeAnlayazer.backend.repository.JobPostingRepository;
import com.resumeAnlayazer.backend.repository.UploadedTextRepository;
import com.resumeAnlayazer.backend.service.JobMatchService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class JobMatchServiceImpl implements JobMatchService {

    private final JobPostingRepository jobPostingRepository;
    private final UploadedTextRepository uploadedTextRepository;

    public JobMatchServiceImpl(JobPostingRepository jobPostingRepository,
                               UploadedTextRepository uploadedTextRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.uploadedTextRepository = uploadedTextRepository;
    }

    @Override
    public List<MatchScoreDTO> getMatchesForJob(Long jobId) {
        JobPostingModel job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + jobId));

        Long hrId = job.getHrUser().getId();
        List<UploadedTextModel> resumes = uploadedTextRepository.findByHrUserId(hrId);

        List<String> jobSkills = parseSkills(job.getSkills());
        String jobDesc = Optional.ofNullable(job.getJobDescription()).orElse("").toLowerCase();

        List<MatchScoreDTO> matches = new ArrayList<>();

        for (UploadedTextModel resume : resumes) {
            if (resume.getExtractedText() == null || resume.getExtractedText().isBlank()) continue;

            String resumeText = resume.getExtractedText().toLowerCase();
            int matchedSkills = 0;

            for (String skill : jobSkills) {
                String pattern = "\\b" + Pattern.quote(skill) + "\\b";
                if (Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(resumeText).find()) {
                    matchedSkills++;
                }
            }

            double skillScore = jobSkills.isEmpty()
                    ? 0
                    : ((double) matchedSkills / jobSkills.size()) * 100.0;

            int descScore = calcTextOverlap(jobDesc, resumeText);

            int finalScore = (int) Math.round((skillScore * 0.9) + (descScore * 0.1));
            if (finalScore > 100) finalScore = 100;

            matches.add(new MatchScoreDTO(
                    resume.getId(),
                    resume.getFileName(),
                    finalScore,
                    matchedSkills,
                    jobSkills.size()
            ));
        }

        return matches.stream()
                .sorted(Comparator.comparingInt(MatchScoreDTO::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    private List<String> parseSkills(String skillsCsv) {
        if (skillsCsv == null || skillsCsv.isBlank()) return Collections.emptyList();
        return Arrays.stream(skillsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toList());
    }

    private int calcTextOverlap(String a, String b) {
        if (a.isEmpty() || b.isEmpty()) return 0;

        Set<String> tokensA = Arrays.stream(a.split("\\W+"))
                .filter(s -> s.length() > 2)
                .collect(Collectors.toSet());

        Set<String> tokensB = Arrays.stream(b.split("\\W+"))
                .filter(s -> s.length() > 2)
                .collect(Collectors.toSet());

        if (tokensA.isEmpty() || tokensB.isEmpty()) return 0;

        long common = tokensA.stream().filter(tokensB::contains).count();
        double score = ((double) common / Math.min(tokensA.size(), tokensB.size())) * 100;
        return (int) Math.round(Math.min(score, 100));
    }
}
