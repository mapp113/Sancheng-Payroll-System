package com.g98.sangchengpayrollmanager.controller;


import com.g98.sangchengpayrollmanager.model.dto.TaxLevelDTO;
import com.g98.sangchengpayrollmanager.model.dto.taxlevel.TaxLevelResponse;
import com.g98.sangchengpayrollmanager.service.TaxLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config/tax-level")
@RequiredArgsConstructor
public class TaxLevelController {
    private final TaxLevelService taxLevelService;

    @GetMapping
    public List<TaxLevelResponse> getAllTaxLevels() {
        return taxLevelService.getAllTaxLevels();
    }

    @PostMapping
    public TaxLevelResponse create (@RequestBody TaxLevelDTO request ) {
        return taxLevelService.addTaxLevel(request);
    }

    @PutMapping("/{id}")
    public TaxLevelResponse update (@PathVariable Integer id,
                                    @RequestBody TaxLevelDTO request) {
        return taxLevelService.updateTaxLevel(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete (@PathVariable Integer id) {
        taxLevelService.deleteTaxLevel(id);
        return ResponseEntity.noContent().build();
    }

}
