package com.resumeAnlayazer.backend.dto;

import com.resumeAnlayazer.backend.model.HRUserModel;

public class HRUserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String companyName;

    public HRUserResponseDTO() {}

    public HRUserResponseDTO(Long id, String name, String email, String companyName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.companyName = companyName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public static HRUserResponseDTO fromModel(HRUserModel model) {
        if (model == null) return null;
        return new HRUserResponseDTO(
                model.getId(),
                model.getName(),
                model.getEmail(),
                model.getCompanyName()
        );
    }
}
