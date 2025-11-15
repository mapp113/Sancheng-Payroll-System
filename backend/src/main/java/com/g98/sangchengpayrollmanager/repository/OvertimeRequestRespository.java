package com.g98.sangchengpayrollmanager.repository;


import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.OvertimeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
    public interface OvertimeRequestRespository extends JpaRepository<OvertimeRequest, Integer> {

    Optional<OvertimeRequestResponse> findOvertimeRequestById(Integer overtimeRequestId);

    Page<OvertimeRequest> findByStatus(String status, Pageable pageable);

    Page<OvertimeRequest> findByUser_EmployeeCode(String employeeCode, Pageable pageable);

    @Query("""
           SELECT o
           FROM OvertimeRequest o
           WHERE (:month IS NULL OR FUNCTION('month', o.otDate) = :month)
             AND (:year  IS NULL OR FUNCTION('year', o.otDate) = :year)
           """)
    Page<OvertimeRequest> filterByMonthYear(@Param("month") Integer month,
                                            @Param("year") Integer year,
                                            Pageable pageable);

    @Query("""
           SELECT o
           FROM OvertimeRequest o
           WHERE (:keyword IS NULL OR :keyword = '' 
              OR LOWER(o.user.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(o.user.fullName)     LIKE LOWER(CONCAT('%', :keyword, '%')))
           """)
    Page<OvertimeRequest> searchByEmployeeCodeOrName(@Param("keyword") String keyword,
                                                     Pageable pageable);

    @Query("""
       SELECT COALESCE(SUM(o.workedTime), 0)
       FROM OvertimeRequest o
       WHERE o.user.employeeCode = :empCode
         AND o.otDate BETWEEN :weekStart AND :weekEnd
         AND o.status IN ('PENDING', 'APPROVED')
       """)
    int sumWorkedHoursInWeek(@Param("empCode") String empCode,
                             @Param("weekStart") LocalDate weekStart,
                             @Param("weekEnd") LocalDate weekEnd);

    @Query("""
       SELECT COUNT(o) > 0
       FROM OvertimeRequest o
       WHERE o.user.employeeCode = :employeeCode
         AND o.otDate = :otDate
         AND o.status IN ('PENDING', 'APPROVED')
         AND (o.fromTime < :toTime AND o.toTime > :fromTime)
       """)
    boolean existsOverlappingRequest(String employeeCode,
                                     LocalDate otDate,
                                     LocalDateTime fromTime,
                                     LocalDateTime toTime);


    Integer id(Integer id);
}

