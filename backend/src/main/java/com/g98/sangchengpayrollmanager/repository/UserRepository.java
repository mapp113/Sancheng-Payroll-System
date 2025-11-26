package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.username = :username")
    Optional<User> findByUsernameWithRole(@Param("username") String username);


    // ✅ Thêm mới: trả về employeeCode theo userId
    @Query("SELECT u.employeeCode FROM User u WHERE u.userId = :userId")
    String findEmployeeCodeByUserId(@Param("userId") String userId);

    Optional<User> findByEmployeeCode(String employeeCode);

    Optional<User> findByEmail(String email);

    List<User> findByStatus(Integer status);


    @Query("SELECT u FROM User u WHERE u.role.name = 'Manager'")
    List<User> findAllManagers();

}