package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.TaxLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaxLevelRepository extends JpaRepository<TaxLevel,Integer> {
    @Query("""
        SELECT t FROM TaxLevel t
        WHERE t.effectiveFrom <= :date
          AND (t.effectiveTo IS NULL OR t.effectiveTo >= :date)
    """)
    List<TaxLevel> findActiveLevels(@Param("date") LocalDate date);

    @Modifying
    @Query("UPDATE TaxLevel t SET t.effectiveTo = :endDate WHERE t.effectiveTo IS NULL")
    void closeCurrentPolicy(LocalDate endDate);

    List<TaxLevel> findByEffectiveFrom(LocalDate effectiveFrom);
}
