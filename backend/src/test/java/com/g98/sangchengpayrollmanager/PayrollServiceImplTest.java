package com.g98.sangchengpayrollmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.LeaveRequestRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) // chạy context web thật
@AutoConfigureMockMvc(addFilters = false) // tắt security filter trong test
@TestPropertySource(properties = "spring.security.enabled=false") // phòng trường hợp SecurityConfig khác
class LeaveRequestControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private LeaveTypeRepository leaveTypeRepository;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // bảo đảm ObjectMapper có JavaTimeModule để serialize LocalDate
        objectMapper.findAndRegisterModules();

        leaveRequestRepository.deleteAll();

        leaveTypeRepository.findByCodeIgnoreCase("annual").orElseGet(() -> {
            LeaveType lt = new LeaveType();
            lt.setCode("annual");
            lt.setName("annual");
            lt.setIsPaid(true);
            lt.setIsCountedAsLeave(true);
            lt.setStandardDaysPerYear(new BigDecimal("12"));
            lt.setNote("Seed for tests");
            return leaveTypeRepository.save(lt);
        });

        userRepository.findByEmployeeCode("EMP001").orElseGet(() -> {
            User u = new User();
            u.setEmployeeCode("EMP001");
            u.setFullName("Test User");
            return userRepository.save(u);
        });
    }

    @Test
    void testSubmitFullDayLeave() throws Exception {
        LeaveRequestCreateDTO dto = new LeaveRequestCreateDTO();
        dto.setEmployeeCode("EMP001");
        dto.setFromDate(LocalDate.of(2025, 10, 10));
        dto.setToDate(LocalDate.of(2025, 10, 12));
        dto.setDuration("FULL_DAY");
        dto.setLeaveType("annual");
        dto.setReason("Nghỉ phép cá nhân");

        var result = mockMvc.perform(post("/api/leave/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andReturn();

        // ✅ In ra body response để xem trong console
        System.out.println("=== RESPONSE BODY ===");
        System.out.println(result.getResponse().getContentAsString());
    }

}
