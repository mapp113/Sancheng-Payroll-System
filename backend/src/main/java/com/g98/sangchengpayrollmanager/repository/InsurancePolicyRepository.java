package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import com.g98.sangchengpayrollmanager.model.entity.PaySummary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy,Integer> {
}
