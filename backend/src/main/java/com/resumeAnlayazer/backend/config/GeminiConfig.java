package com.resumeAnlayazer.backend.config;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {
    @Bean
    public Client geminiClient() {
        String apiKey = System.getProperty("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getenv("GEMINI_API_KEY");
        }
        
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            return Client.builder().apiKey(apiKey.trim()).build();
        }
        // Fallback to default if not found; user will need to set GEMINI_API_KEY in .env
        return new Client();
    }
}
