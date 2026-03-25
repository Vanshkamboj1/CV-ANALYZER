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
                You are a Resume Analyzer AI.
                Analyze the given resume text and return a **strictly valid JSON object** (no markdown, no explanations).
                The JSON must follow this structure:
                {
                  "personalDetails": {},
                  "education": [],
                  "skills": {},
                  "softSkills": [],
                  "experience": [],
                  "internships": [],
                  "projects": [],
                  "achievements": [],
                  "certifications": [],
                  "summary": ""
                }

                Resume Text:
                """ + resumeText;

        try {
            // Call Gemini API
            GenerateContentResponse response =
                    geminiClient.models.generateContent("gemini-2.5-flash", prompt, null);

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
    public AIResponseModel getAnalysis(Long uploadedTextId) {
        return aiResponseRepository.findByUploadedText_Id(uploadedTextId)
                .orElseThrow(() -> new RuntimeException(
                        "No AI analysis found for this resume. Please analyze it first (uploadedTextId: " + uploadedTextId + ")"));
    }

}
