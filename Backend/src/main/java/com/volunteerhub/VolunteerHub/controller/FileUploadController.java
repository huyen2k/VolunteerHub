package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/file-service")
@RequiredArgsConstructor
public class FileUploadController {
    private final FileUploadService fileUploadService;

    @PostMapping("/upload-image")
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileUploadService.uploadImage(file);
            return ApiResponse.<Map<String, String>>builder()
                    .result(Map.of("url", imageUrl))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }
}