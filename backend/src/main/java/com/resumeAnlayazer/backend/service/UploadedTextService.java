package com.resumeAnlayazer.backend.service;

import com.resumeAnlayazer.backend.dto.UploadedTextResponseDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface UploadedTextService {

    //  Upload a new PDF, extract its text, and save record
    UploadedTextResponseDto uploadAndExtract(Long hrUserId, MultipartFile file);

    //  Fetch a single uploaded resume by its ID
    UploadedTextResponseDto getUploadedTextById(Long id);

    //  Send extracted text to AI (and update AI response in DB)
    UploadedTextResponseDto analyzeWithAI(Long uploadedTextId);

    //  List all resumes uploaded by a specific HR user
    List<UploadedTextResponseDto> getAllResumesByHr(Long hrUserId);
}
