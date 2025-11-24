package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.LegalPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface LegalPolicyRepository extends JpaRepository<LegalPolicy,Integer> {

    // --- Trả về policy theo code và còn hiệu lực tại thời điểm asOfDate ---
    @Query("""
        SELECT p FROM LegalPolicy p
        WHERE p.code = :code
          AND p.effectiveFrom <= :asOfDate
          AND (p.effectiveTo IS NULL OR p.effectiveTo >= :asOfDate)
        """)
    LegalPolicy findActiveByCode(
            @Param("code") String code,
            @Param("asOfDate") LocalDate asOfDate
    );

    boolean existsByCode(String code);
}
