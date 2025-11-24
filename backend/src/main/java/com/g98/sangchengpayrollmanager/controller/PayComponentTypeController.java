package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.PayComponentTypeDTO;
import com.g98.sangchengpayrollmanager.model.dto.paycomponenttype.PayComponentTypeRespone;
import com.g98.sangchengpayrollmanager.service.PayComponentTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config/pay-component-type")
@RequiredArgsConstructor
public class PayComponentTypeController {

    private final PayComponentTypeService payComponentTypeService;

    @PreAuthorize("hasAnyRole('HR', 'Manager')")
    @GetMapping
    public List<PayComponentTypeRespone> getAll() {
        return payComponentTypeService.findAll();
    }

    @PreAuthorize("hasAnyRole('HR', 'Manager')")
    @GetMapping("/{id}")
    public PayComponentTypeRespone getById(@PathVariable Integer id) {
        return payComponentTypeService.getById(id);
    }

    @PreAuthorize("hasRole('HR')")
    @PostMapping
    public PayComponentTypeRespone create(@RequestBody PayComponentTypeDTO request) {
        return payComponentTypeService.create(request);
    }

    @PreAuthorize("hasRole('HR')")
    @PutMapping("/{id}")
    public PayComponentTypeRespone update(@PathVariable Integer id,
                                          @RequestBody PayComponentTypeDTO request) {
        return payComponentTypeService.update(id, request);
    }

    @PreAuthorize("hasRole('HR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Integer id) {
        payComponentTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
