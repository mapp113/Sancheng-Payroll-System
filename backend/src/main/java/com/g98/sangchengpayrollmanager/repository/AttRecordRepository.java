package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.AttRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttRecordRepository extends JpaRepository<AttRecord, Integer> {

    // Check duplicate record
    boolean existsByUserIdAndCheckTime(String userId, LocalDateTime checkTime);

    // Lấy thời gian check cuối cùng để sync incremental
    @Query("SELECT MAX(a.checkTime) FROM AttRecord a")
    LocalDateTime findLatestCheckTime();

    // Lấy records theo nhân viên và tháng
    @Query("SELECT a FROM AttRecord a " +
            "WHERE a.userId = :userId " +
            "AND YEAR(a.checkTime) = :year AND MONTH(a.checkTime) = :month " +
            "ORDER BY a.checkTime")
    List<AttRecord> findByUserAndMonth(String userId, int year, int month);

    // Lấy records theo ngày
    List<AttRecord> findByDate(LocalDate date);

    // Lấy check-in/out của 1 nhân viên trong 1 ngày
    @Query("SELECT a FROM AttRecord a " +
            "WHERE a.userId = :userId " +
            "AND a.date = :date " +
            "ORDER BY a.checkTime")
    List<AttRecord> findByUserIdAndDate(String userId, LocalDate date);
}
