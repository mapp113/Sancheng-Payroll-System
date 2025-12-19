package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {

    Page<LeaveRequest> findByStatus(LeaveandOTStatus status, Pageable pageable);

    Page<LeaveRequest> findByUser_EmployeeCode(String employeeCode, Pageable pageable);

    @Query("""
        SELECT lr FROM LeaveRequest lr
        JOIN lr.user u
        WHERE LOWER(u.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        """)
    Page<LeaveRequest> searchByEmployeeCodeOrName(@Param("keyword") String keyword, Pageable pageable);


    @Query("""
    SELECT COUNT(l) > 0
    FROM LeaveRequest l
    WHERE l.user.employeeCode = :empCode
      AND l.fromDate <= :toDate
      AND COALESCE(l.toDate, l.fromDate) >= :fromDate
      AND l.status <> 'REJECTED'
    """)
    boolean existsOverlappingLeave(@Param("empCode") String employeeCode,
                                   @Param("fromDate") LocalDate fromDate,
                                   @Param("toDate") LocalDate toDate);
    @Query("""
    SELECT lr FROM LeaveRequest lr
    WHERE (:month IS NULL OR MONTH(lr.createdDate) = :month)
     AND (:year IS NULL OR YEAR(lr.createdDate) = :year)
    ORDER BY 
       CASE WHEN lr.status = 'PENDING' THEN 0 ELSE 1 END ASC,
       lr.createdDate DESC
   """)
    Page<LeaveRequest> filterByMonthYear(
            @Param("month") Integer month, @Param("year") Integer year, Pageable pageable);

    List<LeaveRequest> findByUser_EmployeeCode(String employeeCode);

    List<LeaveRequest> findByStatus(LeaveandOTStatus status);

    @Query("""
    SELECT lr FROM LeaveRequest lr
    WHERE lr.user = :user
      AND lr.status = :status
      AND lr.fromDate <= :date
      AND (lr.toDate IS NULL OR lr.toDate >= :date)
""")
    Optional<LeaveRequest> findByUserAndDateAndStatus(User user,
                                                      LocalDate date,
                                                      String status
    );

    Optional<LeaveRequest> findByAttachmentPath(String attachmentPath);
}
