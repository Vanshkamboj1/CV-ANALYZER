package com.resumeAnlayazer.backend.config;

import com.resumeAnlayazer.backend.model.HRUserModel;
import com.resumeAnlayazer.backend.repository.HRUserRepository;
import com.resumeAnlayazer.backend.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final HRUserRepository hrUserRepository;
    private final JwtUtil jwtUtil;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(HRUserRepository hrUserRepository, JwtUtil jwtUtil) {
        this.hrUserRepository = hrUserRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            response.sendRedirect(frontendUrl + "/signin?error=oauth_email_missing");
            return;
        }

        // Check if user exists, else create
        Optional<HRUserModel> userOpt = hrUserRepository.findByEmail(email);
        HRUserModel user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = new HRUserModel();
            user.setEmail(email);
            user.setName(name != null ? name : "Google User");
            // Set dummy password and company name to satisfy constraints
            user.setPassword(UUID.randomUUID().toString());
            user.setCompanyName("N/A");
            user = hrUserRepository.save(user);
        }

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        // Redirect to frontend with tokens
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}
