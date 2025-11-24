package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.legalpolicy.*;
import com.g98.sangchengpayrollmanager.service.LegalPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/legal-policy")
@RequiredArgsConstructor
public class LegalPolicyController {

    private final LegalPolicyService legalPolicyService;

    @PreAuthorize("hasAnyRole('HR', 'Manager')")
    @GetMapping
    public List<LegalPolicyRespone> getAll() {
        return legalPolicyService.getAllLegalPolicies();
    }
}
