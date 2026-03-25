package com.resumeAnlayazer.backend.dto;

public class AuthResponseDTO {
    private HRUserResponseDTO user;
    private String accessToken;
    private String refreshToken;
    private String message;

    public AuthResponseDTO() {}

    public AuthResponseDTO(HRUserResponseDTO user, String accessToken, String refreshToken, String message) {
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.message = message;
    }

    public HRUserResponseDTO getUser() { return user; }
    public void setUser(HRUserResponseDTO user) { this.user = user; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
