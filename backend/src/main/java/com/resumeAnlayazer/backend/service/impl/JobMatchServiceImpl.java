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
import com.resumeAnlayazer.backend.model.FeedbackModel;
import com.resumeAnlayazer.backend.repository.FeedbackRepository;
import com.resumeAnlayazer.backend.model.AIResponseModel;
import com.resumeAnlayazer.backend.repository.AIResponseRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class JobMatchServiceImpl implements JobMatchService {

    private final JobPostingRepository jobPostingRepository;
    private final UploadedTextRepository uploadedTextRepository;
    private final FeedbackRepository feedbackRepository;
    private final AIResponseRepository aiResponseRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JobMatchServiceImpl(JobPostingRepository jobPostingRepository,
                               UploadedTextRepository uploadedTextRepository,
                               FeedbackRepository feedbackRepository,
                               AIResponseRepository aiResponseRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.uploadedTextRepository = uploadedTextRepository;
        this.feedbackRepository = feedbackRepository;
        this.aiResponseRepository = aiResponseRepository;
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
            // Ignore resumes where AI analysis completely failed
            if ("FAILED".equalsIgnoreCase(resume.getStatus())) continue;

            if (resume.getExtractedText() == null || resume.getExtractedText().isBlank()) continue;

            String resumeText = resume.getExtractedText().toLowerCase();
            int matchedSkills = 0;

            // Attempt to load AI Extracted Skills
            Set<String> aiExtractedSkills = new HashSet<>();
            Optional<AIResponseModel> aiOpt = aiResponseRepository.findByUploadedText_Id(resume.getId());
            
            if (aiOpt.isPresent() && aiOpt.get().getAiJson() != null) {
                try {
                    JsonNode root = objectMapper.readTree(aiOpt.get().getAiJson());
                    JsonNode skillsNode = root.path("skills");
                    if (!skillsNode.isMissingNode()) {
                        skillsNode.elements().forEachRemaining(category -> {
                            if (category.isArray()) {
                                category.forEach(item -> aiExtractedSkills.add(item.asText().toLowerCase().trim()));
                            }
                        });
                    }
                } catch (Exception e) {
                    System.err.println("Failed to parse AI JSON for resume ID: " + resume.getId());
                }
            }

            for (String skill : jobSkills) {
                // If AI extracted skills exist, do exact/contains match on the cleaned AI extracted array
                if (!aiExtractedSkills.isEmpty()) {
                    // Match if any AI skill is equal to or contains the job skill (e.g., ai extracts "C++ Programming", job skill is "C++")
                    boolean match = aiExtractedSkills.stream().anyMatch(s -> s.equals(skill) || s.contains(skill));
                    if (match) {
                        matchedSkills++;
                    }
                } else {
                    // Fallback to strict regex matching on raw text if AI hasn't analyzed it yet
                    String pattern = "\\b" + Pattern.quote(skill) + "\\b";
                    if (Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(resumeText).find()) {
                        matchedSkills++;
                    } else if (!skill.matches(".*[a-zA-Z].*") || skill.contains("+") || skill.contains("#") || skill.contains(".")) {
                        // Fallback for symbols like C++, C#, .NET
                        if (resumeText.contains(skill)) {
                            matchedSkills++;
                        }
                    }
                }
            }

            double skillScore = jobSkills.isEmpty()
                    ? 0
                    : ((double) matchedSkills / jobSkills.size()) * 100.0;

            int descScore = calcTextOverlap(jobDesc, resumeText);

            int finalScore = (int) Math.round((skillScore * 0.9) + (descScore * 0.1));
            if (finalScore > 100) finalScore = 100;

            Optional<FeedbackModel> feedbackOpt = feedbackRepository.findByJobIdAndResumeId(jobId, resume.getId());
            String feedbackText = feedbackOpt.map(FeedbackModel::getFeedbackText).orElse(null);
            String feedbackStatus = feedbackOpt.map(FeedbackModel::getStatus).orElse("PENDING");

            matches.add(new MatchScoreDTO(
                    resume.getId(),
                    resume.getFileName(),
                    finalScore,
                    matchedSkills,
                    jobSkills.size(),
                    feedbackText,
                    feedbackStatus
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
