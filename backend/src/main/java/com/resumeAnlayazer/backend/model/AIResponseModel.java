package com.resumeAnlayazer.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "ai_response")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AIResponseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_text_id", nullable = false)
    private UploadedTextModel uploadedText;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String aiJson; // Structured AI output stored as JSON string

    @Column(name = "analyzed_at")
    private Instant analyzedAt;

    @PrePersist
    public void prePersist() {
        if (this.analyzedAt == null) {
            this.analyzedAt = Instant.now();
        }
    }
}
