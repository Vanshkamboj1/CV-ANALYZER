package com.resumeAnlayazer.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UploadedTextModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The HR user who uploaded the resume
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hr_user_id", nullable = false)
    private HRUserModel hrUser;

    // Original uploaded filename
    @Column(name = "file_name", nullable = false)
    private String fileName;

    // Extracted text from the uploaded PDF (set after backend parsing)
    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    // Status (e.g. PENDING, PROCESSED, FAILED)
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    // Timestamp of creation
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }
}
