package com.volunteerhub.VolunteerHub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileUploadService {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new RuntimeException("File is empty");

        // Upload lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

        String cloudUrl = uploadResult.get("secure_url").toString();

        System.out.println(">>> Cloudinary URL: " + cloudUrl);
        return cloudUrl;
    }
}