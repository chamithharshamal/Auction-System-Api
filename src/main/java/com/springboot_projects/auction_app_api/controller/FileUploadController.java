package com.springboot_projects.auction_app_api.controller;

import com.springboot_projects.auction_app_api.dto.ApiResponse;
import com.springboot_projects.auction_app_api.dto.FileUploadResponse;
import com.springboot_projects.auction_app_api.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileUploadController {
    
    @Autowired
    private FileUploadService fileUploadService;
    
    // Upload single file
    @PostMapping("/upload")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(@RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileUploadService.uploadFile(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded successfully", response));
    }
    
    // Upload multiple files
    @PostMapping("/upload/multiple")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files) {
        List<FileUploadResponse> responses = fileUploadService.uploadMultipleFiles(files);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Files uploaded successfully", responses));
    }
    
    // Get/Download file
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) throws IOException {
        byte[] fileContent = fileUploadService.getFile(filename);
        
        // Determine content type based on file extension
        String contentType = determineContentType(filename);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(fileContent);
    }
    
    // Delete file
    @DeleteMapping("/{filename}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> deleteFile(@PathVariable String filename) {
        boolean deleted = fileUploadService.deleteFile(filename);
        
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("File deleted successfully", true));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("File not found or could not be deleted"));
        }
    }
    
    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
}