package com.medical.inventory.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.inventory.dto.AiChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiChatService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${ollama.api.url:http://localhost:11434/api}")
    private String ollamaApiUrl;

    @Value("${ollama.model:llama3.2}")
    private String model;

    public AiChatService(ObjectMapper objectMapper) {

        this.objectMapper = objectMapper;

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:11434/api")
                .build();
    }

    /**
     * Main AI method.
     */
    public String askAI(AiChatRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "AI request cannot be null."
            );
        }

        if (request.getQuestion() == null ||
                request.getQuestion().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Question cannot be empty."
            );
        }

        String inventoryContext =
                buildInventoryContext(request);

        String prompt = buildPrompt(
                request.getQuestion(),
                inventoryContext
        );

        Map<String, Object> body =
                new HashMap<>();

        body.put("model", model);

        body.put("prompt", prompt);

        body.put("stream", false);

        try {

            String responseBody =
                    restClient
                            .post()
                            .uri("/generate")
                            .contentType(
                                    MediaType.APPLICATION_JSON
                            )
                            .body(body)
                            .retrieve()
                            .body(String.class);

            if (responseBody == null ||
                    responseBody.isBlank()) {

                throw new RuntimeException(
                        "Ollama returned an empty response."
                );
            }

            return extractResponse(
                    responseBody
            );

        } catch (Exception exception) {

            System.err.println(
                    "Ollama API error: "
                            + exception.getMessage()
            );

            throw new RuntimeException(
                    "Unable to get response from local AI service.",
                    exception
            );
        }
    }

    /**
     * Build the prompt sent to Llama.
     */
    private String buildPrompt(
            String question,
            String inventoryContext) {

        return """
                You are MedInventory AI Assistant.

                You are an AI assistant inside a medical
                inventory management application.

                Your job is to help the user understand and
                operate the MedInventory application.

                You can help with:

                - Medicine inventory
                - Medicine quantities
                - Low stock medicines
                - Out of stock medicines
                - Medicine expiry
                - Expiring medicines
                - Billing
                - Customers
                - Suppliers
                - Reports
                - General MedInventory usage
                - Basic medical inventory management concepts

                IMPORTANT RULES:

                1. Use the inventory data provided below when
                   answering inventory-specific questions.

                2. Never invent medicine names, quantities,
                   bills, suppliers, customers, or inventory data.

                3. If the supplied inventory data does not contain
                   the information required, clearly say that the
                   information is not available.

                4. If the user asks which medicines are low in
                   stock, use the supplied inventory information.

                5. If the user asks about out-of-stock medicines,
                   identify medicines whose quantity is zero.

                6. Do not diagnose diseases.

                7. Do not provide personalized medical treatment.

                8. For medical questions, provide general
                   educational information and recommend consulting
                   a qualified healthcare professional when appropriate.

                9. Keep answers clear and concise.

                10. Use bullet points when useful.

                11. If the user asks how to use MedInventory,
                    explain the relevant feature step by step.

                CURRENT MEDINVENTORY DATA:

                """
                + inventoryContext
                + """

                USER QUESTION:

                """
                + question;
    }

    /**
     * Convert inventory context to readable JSON.
     */
    private String buildInventoryContext(
            AiChatRequest request) {

        if (request.getInventoryContext() == null ||
                request.getInventoryContext().isEmpty()) {

            return "No inventory data is currently available.";
        }

        try {

            return objectMapper
                    .writerWithDefaultPrettyPrinter()
                    .writeValueAsString(
                            request.getInventoryContext()
                    );

        } catch (Exception exception) {

            return request
                    .getInventoryContext()
                    .toString();
        }
    }

    /**
     * Extract "response" from Ollama JSON.
     */
    private String extractResponse(
            String responseBody) {

        try {

            JsonNode root =
                    objectMapper.readTree(
                            responseBody
                    );

            JsonNode response =
                    root.get("response");

            if (response != null &&
                    response.isTextual()) {

                return response
                        .asText()
                        .trim();
            }

            return responseBody;

        } catch (Exception exception) {

            System.err.println(
                    "Ollama response parsing error: "
                            + exception.getMessage()
            );

            return responseBody;
        }
    }
}