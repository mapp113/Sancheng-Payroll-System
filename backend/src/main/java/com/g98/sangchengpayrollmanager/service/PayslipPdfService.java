package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.PaySummary;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.PaySummaryRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PayslipPdfService {
    private final PaySummaryRepository paySummaryRepo;
    private final UserRepository userRepo;

    @Value("${payslip.print-url}")
    private String printBaseUrl;

    /**
     * Tạo payslip PDF cho employee + month,
     * lưu đường dẫn vào PaySummary.payslipUrl và trả về PaySummary đã update.
     */
    public PaySummary generatePayslipAndUpdateSummary(String employeeCode, LocalDate month) {
        // 1. Tìm PaySummary trong DB (đã được tính lương xong trước đó)
        PaySummary summary = paySummaryRepo
                .findByUserEmployeeCodeAndDateAndStatus(employeeCode, month, "draft")
                .orElseThrow(() -> new IllegalStateException(
                        "Không tìm thấy PaySummary draft cho " + employeeCode + " tháng " + month
                ));

        // 2. Generate PDF
        String pdfPath = generatePayslipPdf(employeeCode, month);

        // 3. Update payslip_url
        summary.setPayslipUrl(pdfPath.toString());
        return paySummaryRepo.save(summary);
    }

    /**
     * Tạo PDF payslip cho 1 nhân viên + 1 tháng.
     * @param employeeCode mã nhân viên
     * @param month        tháng lương (ví dụ YearMonth.of(2025, 11))
     * @return Path đầy đủ tới file PDF đã tạo
     */
    public String generatePayslipPdf(String employeeCode, LocalDate month) {
        String monthStr = month.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        try {
            // 1. Build URL React:
            // http://localhost:3000/print/payroll-detail?employeeCode=EMP001&month=2025-11
            String url = UriComponentsBuilder.fromHttpUrl(printBaseUrl)
                    .queryParam("employeeCode", employeeCode)
                    .queryParam("month", month.toString()) // 2025-11
                    .build()
                    .toUriString();

            // 2. Xác định thư mục lưu file:
            // backend (working dir) -> parent() = Sangcheng-Payroll-Manager
            Path backendDir = Paths.get("").toAbsolutePath();
            Path projectRoot = backendDir.getParent();
            if (projectRoot == null) {
                throw new IllegalStateException("Cannot resolve project root from backend directory: " + backendDir);
            }

            Path storageDir = projectRoot
                    .resolve("server")
                    .resolve("pdf-storage")
                    .resolve("payslips");

            Files.createDirectories(storageDir);

            // 3. Tạo tên file: payslip_EMP001_2025-11.pdf
            String fileName = String.format("payslip_%s_%s.pdf", employeeCode, monthStr);
            Path pdfPath = storageDir.resolve(fileName);

            // 4. Dùng Playwright mở trang React và export PDF
            try (Playwright playwright = Playwright.create()) {
                Browser browser = playwright.chromium()
                        .launch(new BrowserType.LaunchOptions().setHeadless(true));

                BrowserContext context = browser.newContext();
                Page page = context.newPage();

                page.navigate(url);
                // Đợi React + API load xong, tuỳ app có thể chỉnh thời gian hoặc thêm waitForSelector
                page.waitForLoadState(LoadState.LOAD);

                // 2) Đo chiều cao nội dung trang (px)
                int scrollHeight = (int) page.evaluate("() => document.documentElement.scrollHeight");

                // 3) Tạo PDF với width/height custom, không chia trang
                String widthPx = "1280px";                 // khớp với thiết kế React
                String heightPx = scrollHeight + "px";     // full chiều cao

                byte[] pdfBytes = page.pdf(new Page.PdfOptions()
                        .setPrintBackground(true)
                        .setWidth(widthPx)
                        .setHeight(heightPx)
                );

                Files.write(pdfPath, pdfBytes);

                browser.close();
            }

            // tính relative path
            Path relativePath = projectRoot.resolve("server").relativize(pdfPath);
            // convert thành URL-friendly
            String relativeUrl = "/" + relativePath.toString().replace("\\", "/");

            return relativeUrl;

        } catch (Exception e) {
            System.err.println("Error generating payslip PDF for " + employeeCode + " " + monthStr + ": " + e);
            throw new RuntimeException("Cannot generate payslip PDF for employee "
                    + employeeCode + " month " + monthStr, e);
        }
    }


    public ResponseEntity<Resource> downloadPayslip(String employeeCode, LocalDate month) throws IOException {
        String username = AuthService.getCurrentUsername();

        User user = userRepo.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Không có người này: " + username));

        boolean isHr = "hr".equalsIgnoreCase(user.getRole().getName());
        boolean isEmployee = "employee".equalsIgnoreCase(user.getRole().getName());
        boolean isManager = "manager".equalsIgnoreCase(user.getRole().getName());
        boolean isOwner = employeeCode.equals(user.getEmployeeCode());

        // HR=> cho phép hết
        if (!isHr) {
            // EMPLOYEE => chỉ tải của chính mình
            if (isEmployee && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // MANAGER => chỉ tải của chính mình
            if (isManager && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }


        // 3. Build file path
        // -----------------------------
        String monthStr = month.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String fileName = "payslip_" + employeeCode + "_" + monthStr + ".pdf";

        Path backendDir = Paths.get("").toAbsolutePath();     // /backend
        Path projectRoot = backendDir.getParent();            // project root

        Path pdfPath = projectRoot
                .resolve("server")
                .resolve("pdf-storage")
                .resolve("payslips")
                .resolve(fileName);

        if (!Files.exists(pdfPath)) {
            return ResponseEntity.notFound().build();
        }

        // 4. Trả file về FE
        // -----------------------------
        byte[] bytes = Files.readAllBytes(pdfPath);
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(bytes.length)
                .body(resource);
    }


}

