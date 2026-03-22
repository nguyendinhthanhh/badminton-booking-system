package com.badminton.booking.service;

import com.badminton.booking.dto.gemini.GeminiDto;
import com.badminton.booking.dto.gemini.GeminiDto.*;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Integrates Google Gemini (via the generateContent REST API) with
 * Function Calling to answer natural-language queries about court availability.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Turn 1 – Send user message + tool schema to Gemini                     │
 * │      ↓                                                                  │
 * │  If Gemini returns plain text   → return it directly                    │
 * │  If Gemini returns functionCall → execute the Java method               │
 * │      ↓                                                                  │
 * │  Turn 2 – Feed the tool result back to Gemini for a final human answer  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    // ── Injected dependencies ────────────────────────────────────────────────
    private final RestTemplate restTemplate;
    private final BadmintonCourtService courtService;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    // ── Constants ────────────────────────────────────────────────────────────
    private static final String TOOL_NAME = "checkAvailableCourts";

    // ════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Entry point: accepts a free-form user message and returns a
     * human-friendly reply (possibly after executing the availability tool).
     *
     * @param userMessage the raw message from the end-user
     * @return natural-language reply from Gemini
     */
    public String processUserMessage(String userMessage) {
        log.info("Processing chatbot message: {}", userMessage);

        // ── TURN 1: Send message + tool declaration ──────────────────────────
        Request turn1Request = buildTurn1Request(userMessage);
        Response turn1Response = callGemini(turn1Request);

        if (turn1Response == null || hasNoCandidate(turn1Response)) {
            return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
        }

        Candidate firstCandidate = turn1Response.getCandidates().get(0);
        List<Part> parts = firstCandidate.getContent().getParts();

        // ── Check if Gemini wants to call a function ─────────────────────────
        Optional<FunctionCall> maybeFunctionCall = parts.stream()
                .filter(p -> p.getFunctionCall() != null)
                .map(Part::getFunctionCall)
                .findFirst();

        if (maybeFunctionCall.isEmpty()) {
            // Plain text response — return as-is
            return extractText(parts);
        }

        FunctionCall functionCall = maybeFunctionCall.get();
        log.info("Gemini requested function call: {} with args: {}", functionCall.getName(), functionCall.getArgs());

        // ── Execute the Java tool ────────────────────────────────────────────
        Map<String, Object> toolResult = executeFunction(functionCall);

        // ── TURN 2: Feed tool result back, get the final natural answer ──────
        Request turn2Request = buildTurn2Request(userMessage, firstCandidate.getContent(), functionCall, toolResult);
        Response turn2Response = callGemini(turn2Request);

        if (turn2Response == null || hasNoCandidate(turn2Response)) {
            return "Tôi đã tìm kiếm được kết quả nhưng không thể tổng hợp câu trả lời. Vui lòng thử lại.";
        }

        return extractText(turn2Response.getCandidates().get(0).getContent().getParts());
    }

    // ════════════════════════════════════════════════════════════════════════
    // TOOL EXECUTION
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Routes the function call to the correct Java implementation.
     * Returns a result map that will be serialised back into the Gemini context.
     */
    private Map<String, Object> executeFunction(FunctionCall functionCall) {
        if (!TOOL_NAME.equals(functionCall.getName())) {
            log.warn("Unknown function requested by Gemini: {}", functionCall.getName());
            return Map.of("error", "Unknown function: " + functionCall.getName());
        }
        return executeCheckAvailableCourts(functionCall.getArgs());
    }

    /**
     * Invokes {@link BadmintonCourtService#getAvailableCourts} and converts
     * the result into a plain {@code Map<String, Object>} for Gemini.
     */
    private Map<String, Object> executeCheckAvailableCourts(Map<String, Object> args) {
        try {
            // ── Parse arguments sent by Gemini ───────────────────────────────
            String dateStr      = requireString(args, "date");
            String startTimeStr = requireString(args, "startTime");
            String endTimeStr   = requireString(args, "endTime");

            LocalDate  date      = LocalDate.parse(dateStr);           // e.g. "2026-03-20"
            LocalTime  startTime = LocalTime.parse(startTimeStr);      // e.g. "08:00"
            LocalTime  endTime   = LocalTime.parse(endTimeStr);        // e.g. "10:00"

            // ── Call the existing service ────────────────────────────────────
            List<BadmintonCourtResponse> available = courtService.getAvailableCourts(date, startTime, endTime);

            log.info("checkAvailableCourts({}, {}-{}) → {} courts", date, startTime, endTime, available.size());

            // ── Build a lean result payload for Gemini ───────────────────────
            List<Map<String, Object>> courts = available.stream()
                    .map(c -> {
                        Map<String, Object> entry = new LinkedHashMap<>();
                        entry.put("courtId",   c.getId());
                        entry.put("name",      c.getName());
                        entry.put("type",      c.getType());
                        entry.put("location",  c.getLocation());
                        entry.put("minPrice",  c.getMinPricePerHour());
                        entry.put("maxPrice",  c.getMaxPricePerHour());
                        return entry;
                    })
                    .toList();

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("totalAvailable", available.size());
            result.put("date",      dateStr);
            result.put("startTime", startTimeStr);
            result.put("endTime",   endTimeStr);
            result.put("courts",    courts);
            return result;

        } catch (DateTimeParseException e) {
            log.error("Failed to parse date/time arguments from Gemini: {}", args, e);
            return Map.of("error", "Invalid date or time format. Expected YYYY-MM-DD and HH:mm.");
        } catch (Exception e) {
            log.error("Unexpected error in executeCheckAvailableCourts", e);
            return Map.of("error", "Internal error: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // REQUEST BUILDERS
    // ════════════════════════════════════════════════════════════════════════

    /** Turn 1 – user message + system prompt + tool declaration. */
    private Request buildTurn1Request(String userMessage) {
        return Request.builder()
                .systemInstruction(systemInstruction())
                .tools(List.of(buildToolDeclaration()))
                .contents(List.of(
                        Content.builder()
                                .role("user")
                                .parts(List.of(Part.builder().text(userMessage).build()))
                                .build()
                ))
                .generationConfig(GenerationConfig.builder()
                        .temperature(0.2)          // low temperature for consistent tool use
                        .maxOutputTokens(1024)
                        .build())
                .build();
    }

    /**
     * Turn 2 – full conversation history:
     *   user message → model's functionCall → our functionResponse
     * Gemini uses this context to produce the final natural-language answer.
     */
    private Request buildTurn2Request(
            String userMessage,
            Content modelFunctionCallContent,
            FunctionCall functionCall,
            Map<String, Object> toolResult) {

        // Wrap the tool result in a functionResponse part
        Part functionResponsePart = Part.builder()
                .functionResponse(FunctionResponse.builder()
                        .name(functionCall.getName())
                        .response(toolResult)
                        .build())
                .build();

        return Request.builder()
                .systemInstruction(systemInstruction())
                .tools(List.of(buildToolDeclaration()))
                .contents(List.of(
                        // Turn 1: user's original message
                        Content.builder()
                                .role("user")
                                .parts(List.of(Part.builder().text(userMessage).build()))
                                .build(),
                        // Turn 1: model's function call (must be echoed back)
                        modelFunctionCallContent,
                        // Turn 2: our tool response
                        Content.builder()
                                .role("user")
                                .parts(List.of(functionResponsePart))
                                .build()
                ))
                .generationConfig(GenerationConfig.builder()
                        .temperature(0.9)          // warmer for friendly natural language
                        .maxOutputTokens(1024)
                        .build())
                .build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // TOOL & SYSTEM PROMPT DEFINITIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Declares the {@code checkAvailableCourts} tool with a strict JSON Schema
     * so Gemini knows exactly what parameters to extract from the user's message.
     */
    private Tool buildToolDeclaration() {
        // Parameter schemas
        Map<String, Schema> props = new LinkedHashMap<>();
        props.put("date", Schema.builder()
                .type("STRING")
                .description("The play date in YYYY-MM-DD format, e.g. 2026-03-20")
                .build());
        props.put("startTime", Schema.builder()
                .type("STRING")
                .description("Desired start time in HH:mm format (24-hour), e.g. 08:00")
                .build());
        props.put("endTime", Schema.builder()
                .type("STRING")
                .description("Desired end time in HH:mm format (24-hour), e.g. 10:00")
                .build());

        Schema parameters = Schema.builder()
                .type("OBJECT")
                .properties(props)
                .required(List.of("date", "startTime", "endTime"))
                .build();

        FunctionDeclaration declaration = FunctionDeclaration.builder()
                .name(TOOL_NAME)
                .description("""
                        Checks which badminton courts are available (not booked) for a given date
                        and time window. Call this whenever the user asks about court availability,
                        free slots, or wants to know which courts they can book.
                        """)
                .parameters(parameters)
                .build();

        return Tool.builder()
                .functionDeclarations(List.of(declaration))
                .build();
    }

    /** System-level persona and instructions injected into every Gemini request. */
    private Content systemInstruction() {
        return Content.builder()
                .parts(List.of(Part.builder()
                        .text("""
                            Bạn là một nhân viên chăm sóc khách hàng cực kỳ duyên dáng, nhiệt tình và chuyên nghiệp của Hệ thống Sân Cầu Lông.
                            
                            NHIỆM VỤ CỦA BẠN:
                            1. Luôn chào hỏi thân thiện và xưng hô "Dạ/Mình/Bạn" hoặc "Em/Anh/Chị".
                            2. Khi khách hỏi lịch trống, BẮT BUỘC dùng công cụ `checkAvailableCourts`.
                            3. CÁCH TRÌNH BÀY KẾT QUẢ (Rất quan trọng):
                               - Nếu CÓ sân trống: Báo tin vui kèm emoji 🏸. Liệt kê danh sách sân theo gạch đầu dòng rõ ràng, bao gồm: Tên sân, Vị trí, và Giá tiền.
                               - Nếu HẾT sân: Tỏ ra tiếc nuối 🥺 và gợi ý khách đổi sang giờ khác hoặc ngày khác.
                            4. LUÔN LUÔN kết thúc câu trả lời bằng một câu hỏi gợi mở (Ví dụ: "Bạn có muốn mình giữ chỗ sân này cho bạn luôn không ạ?", "Bạn đi mấy người để mình tư vấn thêm nhé?").
                            
                            LƯU Ý: Không bao giờ để lộ các thông tin kỹ thuật (như biến courtId, định dạng JSON) cho khách hàng thấy. Trả lời bằng tiếng Việt tự nhiên, ngắt dòng cho dễ đọc.
                            """)
                        .build()))
                .build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // HTTP CLIENT
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Sends a {@link Request} to the Gemini REST endpoint and deserialises
     * the {@link Response}. Returns {@code null} on any error.
     */
    private Response callGemini(Request geminiRequest) {
        String url = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            String requestBody = objectMapper.writeValueAsString(geminiRequest);
            log.debug("Gemini request payload:\n{}", requestBody);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Response> responseEntity =
                    restTemplate.postForEntity(url, entity, Response.class);

            Response body = responseEntity.getBody();
            log.debug("Gemini response status: {}", responseEntity.getStatusCode());
            return body;

        } catch (HttpClientErrorException e) {
            log.error("Gemini API client error: {} – {}", e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialise Gemini request", e);
            return null;
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API", e);
            return null;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════════════════

    private boolean hasNoCandidate(Response response) {
        return response.getCandidates() == null || response.getCandidates().isEmpty()
                || response.getCandidates().get(0).getContent() == null
                || response.getCandidates().get(0).getContent().getParts() == null
                || response.getCandidates().get(0).getContent().getParts().isEmpty();
    }

    private String extractText(List<Part> parts) {
        return parts.stream()
                .filter(p -> p.getText() != null)
                .map(Part::getText)
                .findFirst()
                .orElse("Xin lỗi, tôi không có phản hồi phù hợp lúc này.");
    }

    private String requireString(Map<String, Object> args, String key) {
        Object val = args.get(key);
        if (val == null) {
            throw new IllegalArgumentException("Missing required argument: " + key);
        }
        return val.toString().trim();
    }
}
