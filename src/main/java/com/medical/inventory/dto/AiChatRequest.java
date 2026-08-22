package com.medical.inventory.dto;

import java.util.Map;

public class AiChatRequest {

    private String question;

    private Map<String, Object> inventoryContext;

    public AiChatRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public Map<String, Object> getInventoryContext() {
        return inventoryContext;
    }

    public void setInventoryContext(
            Map<String, Object> inventoryContext) {
        this.inventoryContext = inventoryContext;
    }
}