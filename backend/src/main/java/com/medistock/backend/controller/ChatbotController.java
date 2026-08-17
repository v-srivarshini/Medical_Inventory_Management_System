package com.medistock.backend.controller;

//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medistock.backend.dto.ChatRequest;
import com.medistock.backend.dto.ChatResponse;
import com.medistock.backend.service.ChatbotService;

@RestController
@RequestMapping("/api/chatbot")
//@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {

        String reply = chatbotService.askAI(request.getMessage());

        return new ChatResponse(reply);
    }
}
