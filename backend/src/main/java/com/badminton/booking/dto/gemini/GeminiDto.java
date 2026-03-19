package com.badminton.booking.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Payload DTOs for the Google Gemini generateContent REST API.
 *
 * Reference:
 *   https://ai.google.dev/api/generate-content
 *   https://ai.google.dev/docs/function_calling
 *
 * All classes use @JsonInclude(NON_NULL) so absent fields are not serialised,
 * keeping the JSON compact and preventing Gemini from rejecting unknown nulls.
 */
public class GeminiDto {

    // ════════════════════════════════════════════════════════
    // REQUEST
    // ════════════════════════════════════════════════════════

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Request {
        /** Ordered list of conversation turns. */
        private List<Content> contents;

        /** Tool declarations available to this call. */
        private List<Tool> tools;

        /** Optional generation config (temperature, etc.). */
        @JsonProperty("generationConfig")
        private GenerationConfig generationConfig;

        /** System-level instruction sent once per request. */
        @JsonProperty("systemInstruction")
        private Content systemInstruction;
    }

    // ── Content / Part ────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Content {
        /** "user", "model", or "tool". */
        private String role;
        private List<Part> parts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Part {
        /** Plain text content. */
        private String text;

        /** Used when the model requests a function call. */
        @JsonProperty("functionCall")
        private FunctionCall functionCall;

        /** Used when we return the result of a function call to the model. */
        @JsonProperty("functionResponse")
        private FunctionResponse functionResponse;
    }

    // ── Tool / Function Declaration ───────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Tool {
        @JsonProperty("functionDeclarations")
        private List<FunctionDeclaration> functionDeclarations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FunctionDeclaration {
        private String name;
        private String description;
        /** JSON Schema describing the parameters object. */
        private Schema parameters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Schema {
        private String type;
        /** Key = parameter name, Value = its schema. */
        private Map<String, Schema> properties;
        private List<String> required;
        /** For leaf schemas: description of the field. */
        private String description;
    }

    // ── Function Call / Response ──────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FunctionCall {
        private String name;
        /** Raw parameter map from Gemini (values are primitives / nested maps). */
        private Map<String, Object> args;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FunctionResponse {
        private String name;
        /** Arbitrary response content — Gemini accepts any JSON-serialisable map. */
        private Map<String, Object> response;
    }

    // ── Generation Config ─────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GenerationConfig {
        private Double temperature;
        @JsonProperty("maxOutputTokens")
        private Integer maxOutputTokens;
    }

    // ════════════════════════════════════════════════════════
    // RESPONSE
    // ════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        private List<Candidate> candidates;
        @JsonProperty("promptFeedback")
        private PromptFeedback promptFeedback;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        private Content content;
        @JsonProperty("finishReason")
        private String finishReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PromptFeedback {
        @JsonProperty("blockReason")
        private String blockReason;
    }
}
