package com.medical.inventory.controller;

import com.medical.inventory.dto.AiChatRequest;
import com.medical.inventory.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(
            AiChatService aiChatService) {

        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestBody AiChatRequest request) {

        try {

            String answer =
                    aiChatService.askAI(request);

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "answer",
                    answer
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (IllegalArgumentException exception) {

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    false
            );

            response.put(
                    "message",
                    exception.getMessage()
            );

            return ResponseEntity
                    .badRequest()
                    .body(response);

        } catch (Exception exception) {

            exception.printStackTrace();

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    false
            );

            response.put(
                    "message",
                    "Unable to get AI response."
            );

            return ResponseEntity
                    .internalServerError()
                    .body(response);
        }
    }
}