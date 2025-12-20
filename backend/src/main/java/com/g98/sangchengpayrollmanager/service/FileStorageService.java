package com.g98.sangchengpayrollmanager.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_EXT = Set.of("png", "jpg", "jpeg", "webp","pdf");
    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    /**
     * Lưu ảnh vào: <projectRoot>/server/file-storage/leave-attachments/
     * Trả về relativeUrl dạng: /file-storage/leave-attachments/<fileName>
     */
    public String saveLeaveAttachment(String employeeCode, LocalDateTime now, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null; // không có file thì return null
        }

        // Validate size
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File quá lớn. Tối đa 10MB.");
        }

        // Validate extension
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = getExtensionLower(originalName);
        if (!ALLOWED_IMAGE_EXT.contains(ext)) {
            throw new IllegalArgumentException("Chỉ cho phép file: png, jpg, jpeg, webp, pdf");
        }

        // 1) Resolve project root
        Path backendDir = Paths.get("").toAbsolutePath();
        Path projectRoot = Files.isDirectory(backendDir.resolve("server")) ? backendDir : backendDir.getParent();

        if (projectRoot == null) {
            throw new IllegalStateException("Cannot resolve project root from backend directory: " + backendDir);
        }

        // 2) Thư mục lưu
        Path storageDir = projectRoot
                .resolve("server")
                .resolve("file-storage")
                .resolve("leave-attachments");

        Files.createDirectories(storageDir);

        // 3) Tên file (unique)
        // dạng leave_EMP001_20251219_153012_ab12cd34.jpg
        String timeStr = now.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String rand = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String fileName = String.format("leave_%s_%s_%s.%s", employeeCode, timeStr, rand, ext);

        Path filePath = storageDir.resolve(fileName);

        // 4) Write file
        Files.write(filePath, file.getBytes(), StandardOpenOption.CREATE_NEW);

        // 5) Tính relativeUrl
        Path relativePath = projectRoot.resolve("server").relativize(filePath);
        String relativeUrl = "/" + relativePath.toString().replace("\\", "/");

        return relativeUrl;
    }

    /**
     * Dựng đường dẫn tới file ảnh theo fileName
     * <projectRoot>/server/file-storage/leave-attachments/<fileName>
     */
    public Path resolveLeaveAttachmentPathByFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) return null;

        // chặn path traversal
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException("Invalid fileName");
        }

        Path backendDir = Paths.get("").toAbsolutePath();
        Path projectRoot = Files.isDirectory(backendDir.resolve("server")) ? backendDir : backendDir.getParent();

        if (projectRoot == null) {
            throw new IllegalStateException("Cannot resolve project root from backend directory: " + backendDir);
        }


        return projectRoot
                .resolve("server")
                .resolve("file-storage")
                .resolve("leave-attachments")
                .resolve(fileName)
                .normalize();
    }

    public String detectImageContentTypeByFileName(String fileName) {
        String name = fileName == null ? "" : fileName.toLowerCase();
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }

    private String getExtensionLower(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).trim().toLowerCase();
    }


}
