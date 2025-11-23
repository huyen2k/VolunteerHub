package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/uploads")
public class UploadController {

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','EVEN_MANAGER')")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.<java.util.Map<String, String>>builder()
                    .message("File is empty")
                    .build());
        }
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String safeName = UUID.randomUUID() + ext;
        Path dir = Paths.get("uploads", "images");
        Files.createDirectories(dir);
        Path target = dir.resolve(safeName);
        Files.write(target, file.getBytes());

        String url = "/uploads/images/" + safeName;
        var res = new java.util.HashMap<String, String>();
        res.put("url", url);
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, String>>builder().result(res).build());
    }
}