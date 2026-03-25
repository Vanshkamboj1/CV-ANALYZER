package com.resumeAnlayazer.backend.service.impl;

import com.resumeAnlayazer.backend.dto.UploadedTextResponseDto;
import com.resumeAnlayazer.backend.exception.ResourceNotFoundException;
import com.resumeAnlayazer.backend.model.AIResponseModel;
import com.resumeAnlayazer.backend.model.HRUserModel;
import com.resumeAnlayazer.backend.model.UploadedTextModel;
import com.resumeAnlayazer.backend.repository.AIResponseRepository;
import com.resumeAnlayazer.backend.repository.HRUserRepository;
import com.resumeAnlayazer.backend.repository.UploadedTextRepository;
import com.resumeAnlayazer.backend.service.AIService;
import com.resumeAnlayazer.backend.service.UploadedTextService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadedTextServiceImpl implements UploadedTextService {

    private final UploadedTextRepository uploadedTextRepository;
    private final HRUserRepository hrUserRepository;
    private final AIService aiService;
    private final AIResponseRepository aiResponseRepository;

    // Step 1: Upload and Extract PDF
    @Override
    public UploadedTextResponseDto uploadAndExtract(Long hrUserId, MultipartFile file) {
        HRUserModel hrUser = hrUserRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR User not found with ID: " + hrUserId));

        String extractedText;
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {

            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new IOException("Failed to extract text from PDF file: " + file.getOriginalFilename());
            }

        } catch (IOException e) {
            throw new RuntimeException("PDF extraction failed: " + e.getMessage());
        }

        UploadedTextModel upload = UploadedTextModel.builder()
                .hrUser(hrUser)
                .fileName(file.getOriginalFilename())
                .extractedText(extractedText)
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        UploadedTextModel saved = uploadedTextRepository.save(upload);

        // Trigger AI Analysis immediately
        AIResponseModel aiResponse = null;
        try {
            aiResponse = aiService.analyzeResume(saved.getId());
            saved.setStatus("ANALYZED");
        } catch (Exception e) {
            saved.setStatus("FAILED");
            log.error(" AI analysis failed for uploadedTextId={} : {}", saved.getId(), e.getMessage());
        }

        uploadedTextRepository.save(saved);

        return UploadedTextResponseDto.builder()
                .id(saved.getId())
                .hrUserId(hrUser.getId())
                .fileName(saved.getFileName())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .aiJson(aiResponse != null ? aiResponse.getAiJson() : null)
                .build();
    }

    // Step 2: Get a single uploaded resume
    @Override
    public UploadedTextResponseDto getUploadedTextById(Long id) {
        UploadedTextModel upload = uploadedTextRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedText not found with id: " + id));

        return UploadedTextResponseDto.builder()
                .id(upload.getId())
                .hrUserId(upload.getHrUser().getId())
                .fileName(upload.getFileName())
                .status(upload.getStatus())
                .createdAt(upload.getCreatedAt())
                .aiJson(aiResponseRepository.findByUploadedText_Id(upload.getId())
                        .map(AIResponseModel::getAiJson)
                        .orElse(null))
                .build();
    }

    // Step 3: Re-run or manually trigger AI again
    @Override
    public UploadedTextResponseDto analyzeWithAI(Long uploadedTextId) {
        UploadedTextModel upload = uploadedTextRepository.findById(uploadedTextId)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedText not found"));

        AIResponseModel aiResponse = aiService.analyzeResume(uploadedTextId);
        upload.setStatus("COMPLETED");
        uploadedTextRepository.save(upload);

        return UploadedTextResponseDto.builder()
                .id(upload.getId())
                .hrUserId(upload.getHrUser().getId())
                .fileName(upload.getFileName())
                .status(upload.getStatus())
                .createdAt(upload.getCreatedAt())
                .aiJson(aiResponse.getAiJson())
                .build();
    }

    // Step 4: Get all resumes uploaded by a specific HR
    @Override
    public List<UploadedTextResponseDto> getAllResumesByHr(Long hrUserId) {
        return uploadedTextRepository.findByHrUserId(hrUserId)
                .stream()
                .map(upload -> UploadedTextResponseDto.builder()
                        .id(upload.getId())
                        .hrUserId(upload.getHrUser().getId())
                        .fileName(upload.getFileName())
                        .status(upload.getStatus())
                        .createdAt(upload.getCreatedAt())
                        .aiJson(aiResponseRepository.findByUploadedText_Id(upload.getId())
                                .map(AIResponseModel::getAiJson)
                                .orElse(null))
                        .build())
                .collect(Collectors.toList());
    }
}
