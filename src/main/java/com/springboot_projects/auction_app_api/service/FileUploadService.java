package com.springboot_projects.auction_app_api.service;

import com.springboot_projects.auction_app_api.config.FileUploadConfig;
import com.springboot_projects.auction_app_api.dto.FileUploadResponse;
import com.springboot_projects.auction_app_api.exception.InvalidFileException;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    @Autowired
    private FileUploadConfig fileUploadConfig;

    public FileUploadResponse uploadFile(MultipartFile file) {
        validateFile(file);

        // Get original filename outside try block for error logging
        String originalFilename = file.getOriginalFilename();

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(fileUploadConfig.getUploadDir());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(extension);

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create response
            FileUploadResponse response = new FileUploadResponse();
            response.setFileName(uniqueFilename);
            response.setOriginalFileName(originalFilename);
            response.setFileSize(file.getSize());
            response.setContentType(file.getContentType());
            response.setFileUrl(fileUploadConfig.getBaseUrl() + uniqueFilename);
            response.setUploadTime(LocalDateTime.now());

            logger.info("File uploaded successfully: {}", uniqueFilename);
            return response;

        } catch (IOException e) {
            logger.error("Failed to upload file: {}", originalFilename, e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    public List<FileUploadResponse> uploadMultipleFiles(MultipartFile[] files) {
        List<FileUploadResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                responses.add(uploadFile(file));
            }
        }

        return responses;
    }

    public boolean deleteFile(String filename) {
        try {
            Path filePath = Paths.get(fileUploadConfig.getUploadDir()).resolve(filename);
            boolean deleted = Files.deleteIfExists(filePath);

            if (deleted) {
                logger.info("File deleted successfully: {}", filename);
            } else {
                logger.warn("File not found for deletion: {}", filename);
            }

            return deleted;
        } catch (IOException e) {
            logger.error("Failed to delete file: {}", filename, e);
            return false;
        }
    }

    public byte[] getFile(String filename) throws IOException {
        Path filePath = Paths.get(fileUploadConfig.getUploadDir()).resolve(filename);

        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found: " + filename);
        }

        return Files.readAllBytes(filePath);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        if (file.getSize() > fileUploadConfig.getMaxFileSize()) {
            throw new InvalidFileException("File size exceeds maximum allowed size of " +
                    fileUploadConfig.getMaxFileSize() + " bytes");
        }

        String extension = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();
        if (!Arrays.asList(fileUploadConfig.getAllowedExtensions()).contains(extension)) {
            throw new InvalidFileException("File type not allowed. Allowed types: " +
                    Arrays.toString(fileUploadConfig.getAllowedExtensions()));
        }

        // Additional security check for content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidFileException("Invalid file content type. Only images are allowed.");
        }
    }

    private String generateUniqueFilename(String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("%s_%s.%s", timestamp, uuid, extension);
    }
}