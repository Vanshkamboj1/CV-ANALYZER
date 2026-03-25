package com.resumeAnlayazer.backend.util;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AIClient {

    // Set this to your Vertex AI endpoint or leave default for standard endpoint
    @Value("${vertexai.project-id:}")
    private String projectId;

    @Value("${vertexai.location:us-central1}")
    private String location;

    @Value("${vertexai.model:gemini-1.5}")
    private String model;

    @Value("${vertexai.api-key:}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Simple example: call Vertex AI REST text generation endpoint using an API key.
     * Returns the raw JSON response body. This is intentionally minimal — parse and map
     * the response as needed for your app.
     */
    public String generateText(String prompt) throws IOException, InterruptedException {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("vertexai.api-key must be set in application.properties (or as env var)");
        }

        String endpoint = String.format("https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/%s:predict",
                location, projectId, location, model);

        String requestBody = "{\"instances\":[{\"content\":\"" + escapeJson(prompt) + "\"}],\"parameters\":{\"maxOutputTokens\":256}}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new IOException("Vertex AI request failed: " + response.statusCode() + " - " + response.body());
        }
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
