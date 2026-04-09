package com.resumeAnlayazer.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.resumeAnlayazer.backend.model.AIResponseModel;
import com.resumeAnlayazer.backend.model.UploadedTextModel;
import com.resumeAnlayazer.backend.repository.AIResponseRepository;
import com.resumeAnlayazer.backend.repository.UploadedTextRepository;
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
            int maxRetries = 3;
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
                    } else {
                        throw e; // Rethrow if it's an unrecoverable error or we ran out of retries
                    }
                }
            }

            if (response == null) {
                throw new RuntimeException("Failed to get response after " + maxRetries + " retries due to 503 Service Unavailable.");
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

}
