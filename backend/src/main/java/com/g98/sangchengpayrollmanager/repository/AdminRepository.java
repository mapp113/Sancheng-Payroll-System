package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdminRepository extends JpaRepository<User, String> {

    // đếm user theo role
    @Query("""
            select u.role.id as roleId, count(u) as total
            from User u
            group by u.role.id
            """)
    List<RoleCountProjection> countUsersGroupByRole();

    // nếu cần trả hết user cho bảng
    List<User> findAll();

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);
}

