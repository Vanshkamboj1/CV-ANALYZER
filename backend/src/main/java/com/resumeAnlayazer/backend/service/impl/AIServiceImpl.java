package com.resumeAnlayazer.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.resumeAnlayazer.backend.model.AIResponseModel;
import com.resumeAnlayazer.backend.model.UploadedTextModel;
import com.resumeAnlayazer.backend.repository.AIResponseRepository;
import com.resumeAnlayazer.backend.repository.UploadedTextRepository;
import com.resumeAnlayazer.backend.model.JobMatchScoreModel;
import com.resumeAnlayazer.backend.model.JobPostingModel;
import com.resumeAnlayazer.backend.repository.JobMatchScoreRepository;
import com.resumeAnlayazer.backend.repository.JobPostingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.resumeAnlayazer.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final UploadedTextRepository uploadedTextRepository;
    private final AIResponseRepository aiResponseRepository;
    private final JobPostingRepository jobPostingRepository;
    private final JobMatchScoreRepository jobMatchScoreRepository;
    private final Client geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AIResponseModel analyzeResume(Long uploadedTextId) {
        UploadedTextModel uploadedText = uploadedTextRepository.findById(uploadedTextId)
                .orElseThrow(() -> new RuntimeException("Uploaded text not found with id: " + uploadedTextId));

        String resumeText = uploadedText.getExtractedText();

        // Strong prompt (forces JSON only, avoids markdown)
        String prompt = """
                You are an expert Resume Analyzer AI.
                Analyze the given resume text and extract all details with high accuracy.
                Return a **strictly valid JSON object** (no markdown, no explanations, only JSON).
                Extract as much detail as possible into the descriptions.
                The JSON must follow this exact structure:
                {
                  "personalDetails": {
                    "name": "string",
                    "email": "string",
                    "phone": "string",
                    "location": "string"
                  },
                  "education": [
                    {
                      "degree": "string",
                      "institution": "string",
                      "startDate": "string",
                      "endDate": "string",
                      "gpa": "string"
                    }
                  ],
                  "skills": {
                    "languages": ["string"],
                    "frameworksLibraries": ["string"],
                    "tools": ["string"]
                  },
                  "softSkills": ["string"],
                  "experience": [
                    {
                      "title": "string",
                      "company": "string",
                      "location": "string",
                      "startDate": "string",
                      "endDate": "string",
                      "description": ["string"]
                    }
                  ],
                  "internships": [
                    {
                      "title": "string",
                      "company": "string",
                      "location": "string",
                      "startDate": "string",
                      "endDate": "string",
                      "description": ["string"]
                    }
                  ],
                  "projects": [
                    {
                      "title": "string",
                      "description": ["string"]
                    }
                  ],
                  "achievements": ["string"],
                  "certifications": ["string"],
                  "summary": "string"
                }

                Resume Text:
                """ + resumeText;

        try {
            // Call Gemini API with Retry for 503 errors
            GenerateContentResponse response = null;
            int maxRetries = 2; // Reduced retries so it doesn't hang long
            int attempt = 0;
            long waitTimeMs = 2000;

            while (attempt < maxRetries) {
                try {
                    attempt++;
                    response = geminiClient.models.generateContent("gemini-2.5-flash", prompt, null);
                    break; // Success
                } catch (Exception e) {
                    boolean isRateLimit = e.getMessage() != null && e.getMessage().contains("429");
                    boolean isUnavailable = e.getMessage() != null && e.getMessage().contains("503");
                    
                    if ((isRateLimit || isUnavailable) && attempt < maxRetries) {
                        // Free tiers enforce 15 RPM, meaning we often need to wait ~12+ seconds to clear 429s.
                        long actualWaitMs = isRateLimit ? Math.max(waitTimeMs, 12000) : waitTimeMs;
                        
                        System.err.println("Gemini Network Limit! Error: " + (isRateLimit ? "429 Too Many Requests" : "503 Service Unavailable") + 
                            " (attempt " + attempt + " of " + maxRetries + "). Retrying in " + (actualWaitMs/1000) + "s...");
                        
                        try { Thread.sleep(actualWaitMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                        waitTimeMs *= 2; // Exponential backoff
                    } else if (attempt >= maxRetries) {
                        throw new RuntimeException("AI service is busy. Please try again in a few seconds.", e);
                    } else {
                        throw e; // Rethrow if it's an unrecoverable error
                    }
                }
            }

            if (response == null) {
                throw new RuntimeException("AI service is busy. Please try again in a few seconds.");
            }
            
            String aiResultText = response.text();
            System.out.println("Gemini raw response:\n" + aiResultText);

            // 🧹 Clean markdown fences or extra characters
            aiResultText = aiResultText.trim()
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```", "")
                    .trim();

            // Validate if JSON is parsable
            Object jsonResponse = objectMapper.readValue(aiResultText, Object.class);
            String jsonString = objectMapper.writeValueAsString(jsonResponse);

            // Save AI response
            AIResponseModel aiResponse = AIResponseModel.builder()
                    .uploadedText(uploadedText)
                    .aiJson(jsonString)
                    .analyzedAt(Instant.now())
                    .build();

            AIResponseModel savedResponse = aiResponseRepository.save(aiResponse);

            uploadedText.setStatus("ANALYZED");
            uploadedTextRepository.save(uploadedText);

            return savedResponse;

        } catch (Exception e) {
            uploadedText.setStatus("FAILED");
            uploadedTextRepository.save(uploadedText);

            System.err.println(" AI analysis failed for uploadedTextId=" + uploadedTextId +
                    ": " + e.getMessage());
            
            if (e.getMessage() != null && e.getMessage().contains("AI service is busy")) {
                throw new RuntimeException(e.getMessage(), e); // Throw graceful fallback msg
            }
            throw new RuntimeException("Error while generating AI response: " + e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void analyzeResumeAsync(Long uploadedTextId) {
        try {
            analyzeResume(uploadedTextId);
        } catch (Exception e) {
            System.err.println("Async AI analysis failed: " + e.getMessage());
        }
    }

    @Override
    public AIResponseModel getAnalysis(Long uploadedTextId) {
        return aiResponseRepository.findByUploadedText_Id(uploadedTextId)
                .orElseThrow(() -> new RuntimeException(
                        "No AI analysis found for this resume. Please analyze it first (uploadedTextId: " + uploadedTextId + ")"));
    }

    @Override
    @Async
    public void calculateAIScoreForJobAsync(Long jobId, Long resumeId) {
        try {
            // Check if already exists to avoid duplicate work
            if (jobMatchScoreRepository.findFirstByJobIdAndResumeId(jobId, resumeId).isPresent()) {
                return; 
            }

            JobPostingModel job = jobPostingRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
            
            UploadedTextModel resume = uploadedTextRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

            AIResponseModel aiResponse = aiResponseRepository.findByUploadedText_Id(resumeId).orElse(null);
            
            String resumeData = (aiResponse != null && aiResponse.getAiJson() != null) 
                    ? aiResponse.getAiJson() 
                    : resume.getExtractedText(); // fallback to raw text

            String jobDesc = job.getJobDescription() != null ? job.getJobDescription() : "";
            String jobSkills = job.getSkills() != null ? job.getSkills() : "";

            String prompt = """
                You are a strict and unbiased senior HR evaluator.
                
                Your task is to critically evaluate how well a candidate matches a job posting.
                
                SCORING RULES (VERY IMPORTANT):
                - Do NOT give high scores easily.
                - 90–100: Exceptional match (almost perfect alignment in skills, experience, and role relevance)
                - 75–89: Strong match (most key skills present, minor gaps)
                - 50–74: Moderate match (some important skills missing or weak experience)
                - 25–49: Weak match (major skill gaps, limited relevance)
                - 0–24: Poor match (little to no alignment)
                
                EVALUATION CRITERIA:
                1. Skill match (primary importance)
                2. Relevant experience (years + domain relevance)
                3. Project/work relevance
                4. Missing critical skills (apply strong penalties)
                5. Overclaiming or vague profile (penalize)
                
                STRICT INSTRUCTIONS:
                - Penalize missing REQUIRED SKILLS heavily
                - Do NOT assume skills that are not explicitly mentioned
                - Do NOT reward generic or unrelated experience
                - Be critical and realistic, not generous
                
                OUTPUT FORMAT:
                Return ONLY a valid JSON object. No extra text.
                
                {
                  "score": number (0–100),
                  "reasoning": "Exactly 2 concise sentences explaining strengths and gaps"
                }
                
                JOB DESCRIPTION:
                """ + jobDesc + """
                
                REQUIRED SKILLS:
                """ + jobSkills + """
                
                CANDIDATE PROFILE:
                """ + resumeData;

            GenerateContentResponse response = null;
            int maxRetries = 2; // Reduced retries
            int attempt = 0;
            long waitTimeMs = 2000;

            while (attempt < maxRetries) {
                try {
                    attempt++;
                    response = geminiClient.models.generateContent("gemini-2.5-flash", prompt, null);
                    break;
                } catch (Exception e) {
                    boolean isRateLimit = e.getMessage() != null && e.getMessage().contains("429");
                    boolean isUnavailable = e.getMessage() != null && e.getMessage().contains("503");
                    if ((isRateLimit || isUnavailable) && attempt < maxRetries) {
                        long actualWaitMs = isRateLimit ? Math.max(waitTimeMs, 12000) : waitTimeMs;
                        System.err.println("Gemini Network Limit! Retrying in " + (actualWaitMs/1000) + "s (Attempt " + attempt + " of " + maxRetries + ")...");
                        try { Thread.sleep(actualWaitMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                        waitTimeMs *= 2;
                    } else if (attempt >= maxRetries) {
                         throw new RuntimeException("AI service is busy. Please try again in a few seconds.", e);
                    } else {
                        throw e;
                    }
                }
            }

            if (response == null) {
                throw new RuntimeException("AI service is busy. Please try again in a few seconds.");
            }

            String aiResultText = response.text()
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```", "")
                    .trim();

            JsonNode root = objectMapper.readTree(aiResultText);
            int score = root.path("score").asInt(0);
            String reasoning = root.path("reasoning").asText("No reasoning provided");

            JobMatchScoreModel scoreModel = JobMatchScoreModel.builder()
                    .job(job)
                    .resume(resume)
                    .aiScore(score)
                    .aiReasoning(reasoning)
                    .calculatedAt(Instant.now())
                    .build();

            jobMatchScoreRepository.save(scoreModel);

        } catch (Exception e) {
            System.err.println("Async AI scoring failed for jobId=" + jobId + " resumeId=" + resumeId + ": " + e.getMessage());
            
            try {
                JobMatchScoreModel scoreModel = JobMatchScoreModel.builder()
                        .job(jobPostingRepository.findById(jobId).orElse(null))
                        .resume(uploadedTextRepository.findById(resumeId).orElse(null))
                        .aiScore(-1) // -1 indicates failure
                        .aiReasoning("AI service is extremely busy due to high demand. Please retry in a few seconds.")
                        .calculatedAt(Instant.now())
                        .build();
                if (scoreModel.getJob() != null && scoreModel.getResume() != null) {
                    jobMatchScoreRepository.save(scoreModel);
                }
            } catch(Exception ex) {
                System.err.println("Failed to save fallback score: " + ex.getMessage());
            }
        }
    }
}
