package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.ContractPdfDTO;
import com.g98.sangchengpayrollmanager.model.dto.ContractTemplateDTO;
import com.g98.sangchengpayrollmanager.model.dto.ContractUploadResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeInfoResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileUpdateRequest;
import com.g98.sangchengpayrollmanager.model.entity.Contract;
import com.g98.sangchengpayrollmanager.model.entity.EmployeeInformation;
import com.g98.sangchengpayrollmanager.model.entity.Position;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.ContractRepository;
import com.g98.sangchengpayrollmanager.repository.EmployeeInformationRepository;
import com.g98.sangchengpayrollmanager.repository.PositionRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeInformationRepository repo;
    private final ContractRepository contractRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;

    public EmployeeInfoResponse getByEmployeeCode(String employeeCode) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));
        return EmployeeInfoResponse.fromEntity(info);
    }

    @Transactional
    public EmployeeProfileResponse getProfile(String employeeCode) {

        // 1️⃣ Tìm User trước (bắt buộc phải có)
        User user = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy user với mã: " + employeeCode)
                );

        // 2️⃣ Tìm EmployeeInformation, nếu chưa có thì auto-create
        EmployeeInformation info = repo
                .findByEmployeeCodeFetchAll(employeeCode)
                .orElseGet(() -> {
                    EmployeeInformation e = new EmployeeInformation();
                    e.setUser(user);
                    // các field khác để null → bổ sung sau
                    return repo.save(e);
                });

        // 3️⃣ Contract là OPTIONAL
        Contract contract = contractRepository
                .findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode)
                .orElse(null);

        // 4️⃣ Mapping an toàn
        return mapToProfile(info, contract);
    }


    @Transactional
    public EmployeeProfileResponse updateProfile(String employeeCode, String role, EmployeeProfileUpdateRequest request) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));

        User user = info.getUser();
        String contractCode = "CT-" + employeeCode;
        Contract contract = contractRepository.findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode)
                .orElseGet(() -> {
                    Contract c = new Contract();
                    c.setContractCode(contractCode);
                    c.setUser(user);
                    // các field khác để null → bổ sung sau
                    return contractRepository.save(c);
                });

        if (isEmployee(role)) {
            validateEmployeeFields(request);
            applyBasicUpdates(user, info, request);
        } else if (isHr(role)) {
            applyFullUpdates(user, info, contract, request);
        } else {
            throw new RuntimeException("Bạn không có quyền cập nhật hồ sơ");
        }

        userRepository.save(user);
        repo.save(info);

        return mapToProfile(info, contract);
    }

    private void applyBasicUpdates(User user, EmployeeInformation info, EmployeeProfileUpdateRequest request) {
        if (request.getPhone() != null) {
            user.setPhoneNo(request.getPhone());
        }
        if (request.getPersonalEmail() != null) {
            user.setEmail(request.getPersonalEmail());
        }
        if (request.getAddress() != null) {
            info.setAddress(request.getAddress());
        }
    }

    private void applyFullUpdates(User user, EmployeeInformation info, Contract contract, EmployeeProfileUpdateRequest request) {
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPersonalEmail() != null) {
            user.setEmail(request.getPersonalEmail());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getPhone() != null) {
            user.setPhoneNo(request.getPhone());
        }
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chức vụ với ID: " + request.getPositionId()));
            info.setPosition(position);
        }
        if (request.getTaxCode() != null) {
            info.setTaxNo(request.getTaxCode());
        }
        if (request.getCitizenId() != null) {
            info.setSocialNo(request.getCitizenId());
        }
        if (request.getAddress() != null) {
            info.setAddress(request.getAddress());
        }
        if (request.getDependentsNo() != null) {
            info.setDependentsNo(Integer.valueOf(request.getDependentsNo()));
        }

        if (contract != null) {
            if (request.getContractType() != null) {
                contract.setType(request.getContractType());
            }
            updateStatus(user, contract, request.getStatus());

            if (request.getJoinDate() != null) {
                contract.setStartDate(request.getJoinDate());
            }
            if (request.getVisaExpiry() != null) {
                contract.setEndDate(request.getVisaExpiry());
            }

            // ⭐ XÓA HOẶC COMMENT DÒNG NÀY - không cập nhật pdfPath từ request nữa
            // if (request.getContractUrl() != null) {
            //     contract.setPdfPath(request.getContractUrl());
            // }
        } else {
            updateStatus(user, null, request.getStatus());
        }
    }

    @Transactional(readOnly = true)
    public ContractTemplateDTO generateContractTemplate(String employeeCode) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));

        Contract contract = contractRepository.findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng của nhân viên"));

        ClassPathResource templateResource = new ClassPathResource("templates/contract-template.docx");

        try (InputStream is = templateResource.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             ByteArrayOutputStream os = new ByteArrayOutputStream()) {

            Map<String, String> replacements = buildTemplateReplacements(info, contract);
            replaceInParagraphs(document.getParagraphs(), replacements);
            replaceInTables(document.getTables(), replacements);

            document.write(os);
            byte[] content = os.toByteArray();

            return ContractTemplateDTO.builder()
                    .fileName("hop-dong-" + employeeCode + ".docx")
                    .content(content)
                    .size((long) content.length)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo hợp đồng từ template: " + e.getMessage(), e);
        }
    }

    private Map<String, String> buildTemplateReplacements(EmployeeInformation info, Contract contract) {
        User user = info.getUser();

        String employeeName = Optional.ofNullable(user.getFullName()).orElse("");
        String dob = formatDate(user.getDob());
        String citizenId = Optional.ofNullable(info.getSocialNo()).orElse("");
        String address = Optional.ofNullable(info.getAddress()).orElse("");
        String startDate = formatDate(contract.getStartDate());
        String endDate = formatDate(contract.getEndDate());
        String baseSalary = formatSalary(contract.getBaseSalary());

        Map<String, String> replacements = new LinkedHashMap<>();
        replacements.put("{{employee_name}}", employeeName);
        replacements.put("{{dob}}", dob);
        replacements.put("{{id}}", citizenId);
        replacements.put("{{addr}}", address);
        replacements.put("{{from}}", startDate);
        replacements.put("{{to}}", endDate);
        replacements.put("lương cơ bản:", "lương cơ bản: " + baseSalary);

        return replacements;
    }

    private String formatDate(LocalDate date) {
        if (date == null) {
            return "";
        }
        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                .appendPattern("dd/MM/yyyy")
                .toFormatter();
        return date.format(formatter);
    }

    private String formatSalary(Integer amount) {
        if (amount == null) {
            return "";
        }
        return String.format("%,d", amount);
    }

    private void replaceInParagraphs(List<XWPFParagraph> paragraphs, Map<String, String> replacements) {
        for (XWPFParagraph paragraph : paragraphs) {
            for (XWPFRun run : paragraph.getRuns()) {
                String text = run.getText(0);
                if (text == null) {
                    continue;
                }
                String replacedText = replaceWithValues(text, replacements);
                if (!text.equals(replacedText)) {
                    run.setText(replacedText, 0);
                }
            }
        }
    }

    private void replaceInTables(List<XWPFTable> tables, Map<String, String> replacements) {
        for (XWPFTable table : tables) {
            table.getRows().forEach(row -> row.getTableCells().forEach(cell -> {
                replaceInParagraphs(cell.getParagraphs(), replacements);
                replaceInTables(cell.getTables(), replacements);
            }));
        }
    }

    private String replaceWithValues(String text, Map<String, String> replacements) {
        String replacedText = text;
        for (Map.Entry<String, String> entry : replacements.entrySet()) {
            if (replacedText.contains(entry.getKey())) {
                replacedText = replacedText.replace(entry.getKey(), entry.getValue());
            }
        }
        return replacedText;
    }

    private EmployeeProfileResponse mapToProfile(EmployeeInformation info, Contract contract) {
        User user = info.getUser();
        Position position = info.getPosition();
        LocalDate joinDate = contract != null ? contract.getStartDate() : null;
        LocalDate visaExpiry = contract != null ? contract.getEndDate() : null;

        String status = contract != null ? contract.getStatus() : resolveUserStatus(user.getStatus());
        String contractType = contract != null ? contract.getType() : null;

        String contractUrl = null;
        if (contract != null) {
            if (contract.hasPdfInDatabase()) {
                contractUrl = "/api/v1/hr/users/" + user.getEmployeeCode() + "/contract/view";
            } else if (contract.getPdfPath() != null && !contract.getPdfPath().isEmpty()) {
                contractUrl = contract.getPdfPath();
            }
        }

        int dependentsNo = info.getDependentsNo() != null ? info.getDependentsNo() : 0;

        return new EmployeeProfileResponse(
                user.getEmployeeCode(),
                user.getFullName(),
                position != null ? position.getId() : null,        // ⭐ Thêm positionId
                position != null ? position.getName() : null,      // Position name
                joinDate,
                user.getEmail(),
                contractType,
                user.getPhoneNo(),
                user.getDob(),
                status,
                info.getSocialNo(),
                info.getAddress(),
                visaExpiry,
                contractUrl,
                info.getTaxNo(),
                dependentsNo
        );
    }

    private String resolveUserStatus(Integer status) {
        if (Objects.equals(status, 1)) return "ACTIVE";
        if (Objects.equals(status, 0)) return "INACTIVE";
        return "UNKNOWN";
    }

    private void updateStatus(User user, Contract contract, String status) {
        if (status == null) {
            return;
        }

        if (contract != null) {
            contract.setStatus(status);
            return;
        }

        if (status.equalsIgnoreCase("ACTIVE")) {
            user.setStatus(1);
        } else if (status.equalsIgnoreCase("INACTIVE")) {
            user.setStatus(0);
        }
    }

    private boolean isEmployee(String role) {
        return role != null && role.equalsIgnoreCase("EMPLOYEE");
    }

    private boolean isHr(String role) {
        return role != null && role.equalsIgnoreCase("HR");
    }

    private void validateEmployeeFields(EmployeeProfileUpdateRequest request) {
        boolean hasRestrictedChange = request.getFullName() != null
                || request.getPositionId() != null
                || request.getDob() != null
                || request.getContractType() != null
                || request.getTaxCode() != null
                || request.getCitizenId() != null
                || request.getStatus() != null
                || request.getJoinDate() != null
                || request.getVisaExpiry() != null
                || request.getContractUrl() != null;

        if (hasRestrictedChange) {
            throw new RuntimeException("Nhân viên chỉ được phép cập nhật số điện thoại, địa chỉ và email");
        }
    }

    @Transactional
    public ContractUploadResponse uploadContractPdf(String employeeCode, MultipartFile file) {
        // 1. Validation
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File hợp đồng không được để trống");
        }

        if (!Objects.equals(file.getContentType(), "application/pdf")) {
            throw new RuntimeException("Chỉ chấp nhận tập tin PDF");
        }

        // Kiểm tra kích thước file (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File quá lớn. Kích thước tối đa là 10MB");
        }

        // 2. Tìm hợp đồng
        Contract contract = contractRepository
                .findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng của nhân viên"));

        try {
            // 3. Lưu file vào database
            String originalFileName = StringUtils.cleanPath(
                    Objects.requireNonNull(file.getOriginalFilename())
            );

            LocalDateTime now = LocalDateTime.now();

            contract.setPdfFileName(originalFileName);
            contract.setPdfContent(file.getBytes());
            contract.setPdfSize(file.getSize());
            contract.setPdfUploadedAt(now);

            contractRepository.save(contract);

            // 4. Tạo response với URLs để frontend sử dụng
            String downloadUrl = "/api/v1/hr/users/" + employeeCode + "/contract/download";
            String viewUrl = "/api/v1/hr/users/" + employeeCode + "/contract/view";

            return ContractUploadResponse.builder()
                    .fileName(originalFileName)
                    .fileSize(file.getSize())
                    .uploadedAt(now.format(DateTimeFormatter.ISO_DATE_TIME))
                    .message("File đã được lưu thành công vào database")
                    .downloadUrl(downloadUrl)
                    .viewUrl(viewUrl)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Tải lên file hợp đồng thất bại: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ContractPdfDTO getContractPdf(String employeeCode) {
        Contract contract = contractRepository
                .findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng"));

        // Ưu tiên lấy từ database
        if (contract.getPdfContent() != null && contract.getPdfContent().length > 0) {
            return ContractPdfDTO.builder()
                    .fileName(contract.getPdfFileName())
                    .content(contract.getPdfContent())
                    .size(contract.getPdfSize())
                    .source("database")
                    .build();
        }

        // Fallback: lấy từ file (nếu có data cũ trong pdf_path)
        if (contract.getPdfPath() != null && !contract.getPdfPath().isEmpty()) {
            try {
                Path filePath = Paths.get(contract.getPdfPath());
                byte[] content = Files.readAllBytes(filePath);
                return ContractPdfDTO.builder()
                        .fileName(filePath.getFileName().toString())
                        .content(content)
                        .size((long) content.length)
                        .source("file")
                        .build();
            } catch (IOException e) {
                throw new RuntimeException("Không đọc được file: " + e.getMessage());
            }
        }

        throw new RuntimeException("Hợp đồng chưa có file PDF");
    }
}

