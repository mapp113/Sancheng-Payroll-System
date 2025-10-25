package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByCode(String employeeCode) {
        return userRepository.findById(employeeCode)
                .orElseThrow(() -> new RuntimeException("User not found with code: " + employeeCode));
    }

    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername()))
            throw new RuntimeException("Username already exists");
        if (userRepository.existsByEmail(user.getEmail()))
            throw new RuntimeException("Email already exists");
        return userRepository.save(user);
    }

    public User updateUser(String employeeCode, User updated) {
        User existing = getUserByCode(employeeCode);

        existing.setFullName(updated.getFullName());
        existing.setUsername(updated.getUsername());
        existing.setPassword(updated.getPassword());
        existing.setEmail(updated.getEmail());
        existing.setDob(updated.getDob());
        existing.setPhoneNo(updated.getPhoneNo());
        existing.setRole(updated.getRole());

        return userRepository.save(existing);
    }

    public void deleteUser(String employeeCode) {
        userRepository.deleteById(employeeCode);
    }
}
