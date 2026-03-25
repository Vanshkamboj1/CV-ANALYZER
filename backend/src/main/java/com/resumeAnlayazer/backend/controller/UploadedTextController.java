package com.resumeAnlayazer.backend.controller;

import com.resumeAnlayazer.backend.dto.UploadedTextRequestDto;
import com.resumeAnlayazer.backend.dto.UploadedTextResponseDto;
import com.resumeAnlayazer.backend.service.UploadedTextService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UploadedTextController {

    private final UploadedTextService uploadedTextService;

    /**
     * Upload a PDF resume, extract text, and trigger AI analysis
     */
    @PostMapping("/resume")
    public ResponseEntity<UploadedTextResponseDto> uploadResume(
            @ModelAttribute UploadedTextRequestDto requestDto) {

        UploadedTextResponseDto response =
                uploadedTextService.uploadAndExtract(requestDto.getHrUserId(), requestDto.getFile());

        return ResponseEntity.ok(response);
    }

    /**
     * Get uploaded resume details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UploadedTextResponseDto> getUploadedTextById(@PathVariable Long id) {
        UploadedTextResponseDto response = uploadedTextService.getUploadedTextById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get AI analysis result for a specific uploaded resume
     */
    @GetMapping("/{id}/analysis")
    public ResponseEntity<UploadedTextResponseDto> getAIResponse(@PathVariable Long id) {
        UploadedTextResponseDto response = uploadedTextService.analyzeWithAI(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all resumes uploaded by a specific HR user
     */
    @GetMapping("/hr/{hrUserId}")
    public ResponseEntity<List<UploadedTextResponseDto>> getAllResumesByHr(@PathVariable Long hrUserId) {
        List<UploadedTextResponseDto> responses = uploadedTextService.getAllResumesByHr(hrUserId);
        return ResponseEntity.ok(responses);
    }
}
