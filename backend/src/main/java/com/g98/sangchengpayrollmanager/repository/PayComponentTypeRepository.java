package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.PayComponentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayComponentTypeRepository extends JpaRepository<PayComponentType, Integer> {

    Optional<PayComponentType> findByid(Integer id);

    Optional<PayComponentType> findByName(String name);
}