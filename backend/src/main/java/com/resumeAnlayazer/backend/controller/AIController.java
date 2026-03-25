package com.resumeAnlayazer.backend.controller;

import com.resumeAnlayazer.backend.model.AIResponseModel;
import com.resumeAnlayazer.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    @GetMapping("/{uploadedTextId}")
    public ResponseEntity<AIResponseModel> getAnalysis(@PathVariable Long uploadedTextId) {
        AIResponseModel response = aiService.getAnalysis(uploadedTextId);
        return ResponseEntity.ok(response);
    }
}
