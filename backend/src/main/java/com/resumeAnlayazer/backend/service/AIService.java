package com.resumeAnlayazer.backend.service;

import com.resumeAnlayazer.backend.model.AIResponseModel;

public interface AIService {
    AIResponseModel analyzeResume(Long uploadedTextId);
    AIResponseModel getAnalysis(Long uploadedTextId);
}
