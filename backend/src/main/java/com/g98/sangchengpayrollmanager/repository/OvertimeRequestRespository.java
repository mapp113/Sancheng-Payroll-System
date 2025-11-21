package com.g98.sangchengpayrollmanager.repository;


import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.OvertimeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.g98.sangchengpayrollmanager.model.entity.User;
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
        List<OvertimeRequest> findByStatus(String status);

    @Query("""
        SELECT ot FROM OvertimeRequest ot
        WHERE ot.user = :user
          AND ot.status = :status
          AND DATE(ot.fromTime) = :date
    """)
    List<OvertimeRequest> findByUserAndDateAndStatus(
            @Param("user") User user,
            @Param("date") LocalDate date,
            @Param("status") String status
    );

    Page<OvertimeRequest> findByStatus(String status, Pageable pageable);

    Page<OvertimeRequest> findByUser_EmployeeCode(String employeeCode, Pageable pageable);

    // tìm theo lịch
    @Query("""
            SELECT o
           FROM OvertimeRequest o
           WHERE (:month IS NULL OR FUNCTION('month', o.otDate) = :month)
             AND (:year  IS NULL OR FUNCTION('year',  o.otDate) = :year)
           ORDER BY
               CASE
                   WHEN o.status = 'PENDING' THEN 0 ELSE 1
               END ASC,
               o.createdDateOT DESC
           """)
    Page<OvertimeRequest> filterByMonthYear(@Param("month") Integer month,
                                            @Param("year") Integer year,
                                            Pageable pageable);

    // search
    @Query("""
    SELECT o FROM OvertimeRequest o
    JOIN o.user u
    WHERE LOWER(u.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    Page<OvertimeRequest> searchByEmployeeCodeOrName(
            @Param("keyword") String keyword, Pageable pageable);


    //tinhs tổng số giờ trong tháng
    @Query("""
    SELECT COALESCE(SUM(o.workedTime), 0)
    FROM OvertimeRequest o
    WHERE o.user.employeeCode = :empCode
      AND o.otDate BETWEEN :monthStart AND :monthEnd
      AND o.status IN ('PENDING', 'APPROVED')
   """)
    int sumWorkedHoursInMonth(@Param("empCode") String empCode,
                              @Param("monthStart") LocalDate monthStart,
                              @Param("monthEnd") LocalDate monthEnd);



    // đếm để tránh bị trunùng
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

    @Query("""
       SELECT COALESCE(SUM(o.workedTime), 0)
       FROM OvertimeRequest o
       WHERE o.user.employeeCode = :empCode
         AND o.otDate BETWEEN :yearStart AND :yearEnd
         AND o.status = 'APPROVED'
       """)
    int sumWorkedHoursInYear(@Param("empCode") String empCode,
                             @Param("yearStart") LocalDate yearStart,
                             @Param("yearEnd") LocalDate yearEnd);
}
