package com.resumeAnlayazer.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingResponseDto {
    private Long id;
    private Long hrUserId;
    private String jobTitle;
    private String jobDescription;
    private String skills;
    private String status;
    private Instant createdAt;
}