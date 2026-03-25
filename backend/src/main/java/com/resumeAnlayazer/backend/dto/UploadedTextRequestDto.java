package com.resumeAnlayazer.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UploadedTextRequestDto {

    @NotNull(message = "HR User ID is required")
    private Long hrUserId;

    @NotNull(message = "File is required")
    private MultipartFile file;

    // Optional fields — filled after extraction inside service
    private String fileName;   // extracted from file.getOriginalFilename()
    private String extractedText; // text extracted from the PDF
}
