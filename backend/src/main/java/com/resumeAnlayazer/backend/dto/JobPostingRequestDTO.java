package com.resumeAnlayazer.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobPostingRequestDTO {
    @NotNull(message = "HR User ID is required")
    private Long hrUserId;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    @NotBlank(message = "Skills are required")
    private String skills;

    /**
     * Optional field: can be "Open", "Closed", or "Draft"
     */
    private String status;
}
