package com.resumeAnlayazer.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchScoreDTO {
    private Long resumeId;
    private String fileName;
    private int matchScore;  // 0–100
    private int matchedSkillsCount;
    private int totalJobSkills;
}
