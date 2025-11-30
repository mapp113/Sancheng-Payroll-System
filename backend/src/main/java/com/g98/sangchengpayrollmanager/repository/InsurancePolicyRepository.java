package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy,Integer> {
    @Query("""
    SELECT p FROM InsurancePolicy p
    WHERE p.effectiveFrom <= :date
      AND (p.effectiveTo IS NULL OR p.effectiveTo >= :date)
""")
    List<InsurancePolicy> findActivePolicies(LocalDate date);

}
