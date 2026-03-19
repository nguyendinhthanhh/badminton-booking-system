package com.badminton.booking.controller;

import com.badminton.booking.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST endpoint that exposes the Gemini-powered court-availability chatbot.
 *
 * Public (no auth required) — whitelisted in SecurityConfig.
 */
@Tag(name = "Chatbot", description = "AI chatbot powered by Google Gemini with Function Calling")
@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class ChatbotController {
@Autowired
    private  GeminiService geminiService;

    /**
     * POST /api/chatbot/message
     *
     * Request body: { "message": "Ngày mai từ 8h đến 10h còn sân không?" }
     * Response:     { "reply": "Hiện tại còn 2 sân trống: ..." }
     */
    @Operation(
            summary = "Send a message to the AI chatbot",
            description = """
                    Sends a natural-language message to the Gemini chatbot. \
                    The bot will automatically call the availability tool when needed \
                    and return a friendly Vietnamese reply.
                    
                    Example request body:
                    ```json
                    { "message": "Ngày mai từ 8 giờ đến 10 giờ còn sân trống không?" }
                    ```
                    """)
    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");

        if (userMessage == null || userMessage.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Trường 'message' không được để trống."));
        }

        String reply = geminiService.processUserMessage(userMessage.trim());
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
