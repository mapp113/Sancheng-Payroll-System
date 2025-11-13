package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.device.ZKTecoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class BiometricSyncService {
    private final ZKTecoClient zkClient;

    @Qualifier("zkExecutor")
    private final ExecutorService exec;

    public boolean pushUserBlocking(String emp, String name, String pin, boolean admin, long timeoutMs) {
        int priv = admin ? 14 : 0;

        try {
            Boolean result = CompletableFuture
                    .supplyAsync(() -> {
                        try {
                            return zkClient.upsertUser(emp, name, pin, priv, true);
                        } catch (Exception e) {
                            System.err.println("❌ upsertUser failed: " + e.getMessage());
                            return null;
                        }
                    }, exec)
                    .orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                    .exceptionally(ex -> {
                        System.err.println("⚠️ Timeout: " + ex.getMessage());
                        return null;
                    })
                    .join();

            if (Boolean.TRUE.equals(result)) {
                return true;
            }

            // Fallback: check if user exists
            return zkClient.existsUser(emp);

        } catch (Exception e) {
            System.err.println("❌ Exception: " + e.getMessage());
            return false;
        }
    }
}