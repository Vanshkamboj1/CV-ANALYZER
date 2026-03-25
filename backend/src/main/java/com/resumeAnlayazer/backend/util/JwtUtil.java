package com.resumeAnlayazer.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpirationMs;

    private Key key;

    // initialize signing key after bean creation
    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate Access Token
    public String generateAccessToken(Long hrId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(String.valueOf(hrId))
                .claim("hrId", hrId)
                .claim("email", email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + accessTokenExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Generate Refresh Token
    public String generateRefreshToken(Long hrId) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(String.valueOf(hrId))
                .claim("hrId", hrId)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + refreshTokenExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Validate a JWT token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    // Extract all claims
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extract HR ID (custom claim)
    public Long extractHrId(String token) {
        Claims claims = getClaims(token);
        Object hrId = claims.get("hrId");
        if (hrId == null) return Long.valueOf(claims.getSubject());
        return Long.valueOf(String.valueOf(hrId));
    }

    // Extract email (optional helper)
    public String extractEmail(String token) {
        Claims claims = getClaims(token);
        return (String) claims.get("email");
    }
}
