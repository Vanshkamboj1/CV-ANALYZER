package com.resumeAnlayazer.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class UploadedTextResponseDto {
    private Long id;
    private Long hrUserId;
    private String fileName;
    private String status;
    private Instant createdAt;
    private String aiJson;
}
