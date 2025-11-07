package com.g98.sangchengpayrollmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SangchengPayrollManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SangchengPayrollManagerApplication.class, args);
    }

}
