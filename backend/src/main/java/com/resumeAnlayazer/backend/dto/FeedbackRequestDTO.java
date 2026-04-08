package com.resumeAnlayazer.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequestDTO {
    private String feedbackText;
    private String status; // ACCEPTED, REJECTED, PENDING
}
