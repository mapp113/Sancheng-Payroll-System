package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{employeeCode}")
    public User getUserByCode(@PathVariable String employeeCode) {
        return userService.getUserByCode(employeeCode);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{employeeCode}")
    public User updateUser(@PathVariable String employeeCode, @RequestBody User user) {
        return userService.updateUser(employeeCode, user);
    }

    @DeleteMapping("/{employeeCode}")
    public void deleteUser(@PathVariable String employeeCode) {
        userService.deleteUser(employeeCode);
    }
}