package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.EmployeeInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmployeeInformationRepository extends JpaRepository<EmployeeInformation, Integer> {
    @Query("""
        select e
        from EmployeeInformation e
        where e.user.employeeCode = :employeeCode
    """)
    EmployeeInformation findByUserEmployeeCode(@Param("employeeCode") String employeeCode);

    @Query("""
        select ei from EmployeeInformation ei
        join fetch ei.user u
        left join fetch ei.position p
        where u.employeeCode = :employeeCode
    """)
    Optional<EmployeeInformation> findByEmployeeCodeFetchAll(@Param("employeeCode") String employeeCode);
}
