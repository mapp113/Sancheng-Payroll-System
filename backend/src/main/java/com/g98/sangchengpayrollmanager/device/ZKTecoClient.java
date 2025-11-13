package com.g98.sangchengpayrollmanager.device;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class ZKTecoClient {

    @Value("${zkteco.enabled:true}")
    private boolean enabled;

    @Value("${zkteco.ip:192.168.0.2}")
    private String ip;

    @Value("${zkteco.port:4370}")
    private int port;

    @Value("${zkteco.machine-no:1}")
    private int machineNo;

    @Value("${zkteco.password:}")
    private String devicePassword;

    static {
        System.setProperty(com.jacob.com.LibraryLoader.JACOB_DLL_PATH,
                "C:/Users/Admin/Downloads/jacob-1.20-x64.dll");
        com.jacob.com.LibraryLoader.loadJacobLibrary();
    }

    private ActiveXComponent connect() {
        if (!enabled) {
            throw new IllegalStateException("ZKTeco sync disabled");
        }

        com.jacob.com.ComThread.InitSTA();
        ActiveXComponent zk = null;

        try {
            zk = new ActiveXComponent("zkemkeeper.ZKEM");

            boolean ok = Dispatch.call(zk, "Connect_Net", ip, port).getBoolean();
            if (!ok) {
                throw new RuntimeException("Cannot connect to " + ip + ":" + port);
            }

            if (devicePassword != null && !devicePassword.isBlank()) {
                Dispatch.call(zk, "SetCommPassword", Integer.parseInt(devicePassword));
            }

            return zk;

        } catch (Exception ex) {
            if (zk != null) {
                try {
                    Dispatch.call(zk, "Disconnect");
                } catch (Exception ignore) {
                }
                zk.safeRelease();
            }
            com.jacob.com.ComThread.Release();
            throw ex;
        }
    }

    private void disconnect(ActiveXComponent zk) {
        new Thread(() -> {
            try {
                Thread.sleep(50);
                Dispatch.call(zk, "Disconnect");
                Thread.sleep(100);
            } catch (Exception ignore) {
            } finally {
                try {
                    zk.safeRelease();
                } catch (Exception ignore) {
                }
                try {
                    com.jacob.com.ComThread.Release();
                } catch (Exception ignore) {
                }
            }
        }, "ZK-Cleanup").start();
    }

    /**
     * ĐỌC TẤT CẢ LOGS CHẤM CÔNG
     */
    public List<AttendanceLog> readAllLogs() {
        ActiveXComponent zk = null;
        List<AttendanceLog> logs = new ArrayList<>();

        // Timezone constants
        final ZoneId UTC = ZoneId.of("UTC");
        final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

        try {
            zk = connect();
            log.debug("📥 Reading attendance logs from {}:{}", ip, port);

            // Disable device while reading
            Dispatch.call(zk, "EnableDevice", machineNo, false);

            // Read all general logs
            boolean ok = Dispatch.call(zk, "ReadGeneralLogData", machineNo).getBoolean();
            if (!ok) {
                int err = Dispatch.call(zk, "GetLastError").getInt();
                log.error("ReadGeneralLogData failed, error code: {}", err);
                return logs;
            }

            // Parse each record - BY-REFERENCE VARIANTS
            Variant empId = new Variant("", true);
            Variant verifyMode = new Variant(0, true);
            Variant checkType = new Variant(0, true);
            Variant year = new Variant(0, true);
            Variant month = new Variant(0, true);
            Variant day = new Variant(0, true);
            Variant hour = new Variant(0, true);
            Variant minute = new Variant(0, true);
            Variant second = new Variant(0, true);
            Variant workCode = new Variant(0, true);

            int count = 0;
            while (Dispatch.call(zk, "SSR_GetGeneralLogData",
                    new Variant(machineNo), empId, verifyMode, checkType,
                    year, month, day, hour, minute, second, workCode).getBoolean()) {

                try {
                    // Lấy giá trị từ by-ref
                    int y = year.getIntRef();
                    int m = month.getIntRef();
                    int d = day.getIntRef();
                    int h = hour.getIntRef();
                    int min = minute.getIntRef();
                    int s = second.getIntRef();

                    // Validate đầy đủ
                    if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
                        log.debug("Invalid date values: {}-{}-{}", y, m, d);
                        resetVariants(empId, verifyMode, checkType, year, month, day, hour, minute, second, workCode);
                        continue;
                    }

                    if (h < 0 || h > 23 || min < 0 || min > 59 || s < 0 || s > 59) {
                        log.debug("Invalid time values: {}:{}:{}", h, min, s);
                        resetVariants(empId, verifyMode, checkType, year, month, day, hour, minute, second, workCode);
                        continue;
                    }

                    // ✅ FIX: Máy trả về UTC, cần convert sang VN time
                    // Bước 1: Tạo ZonedDateTime với UTC
                    ZonedDateTime utcTime = ZonedDateTime.of(y, m, d, h, min, s, 0, UTC);

                    // Bước 2: Convert sang giờ VN
                    ZonedDateTime vnTime = utcTime.withZoneSameInstant(VN);

                    // Bước 3: Lấy LocalDateTime để lưu DB
                    LocalDateTime checkTime = vnTime.toLocalDateTime();

                    String userId = empId.getStringRef();

                    logs.add(AttendanceLog.builder()
                            .userId(userId)
                            .checkTime(checkTime) // Đã là giờ VN đúng
                            .build());

                    count++;

                    // Log sample để verify
                    if (count <= 3) {
                        log.debug("Sample: UTC {}→VN {} for user {}", utcTime, vnTime, userId);
                    }

                } catch (Exception e) {
                    log.debug("Failed to parse log entry: {}", e.getMessage());
                }

                // Reset all variants for next iteration
                resetVariants(empId, verifyMode, checkType, year, month, day, hour, minute, second, workCode);
            }

            log.info("✅ Read {} attendance logs from device (converted UTC→VN)", count);
            return logs;

        } catch (Exception e) {
            log.error("Failed to read attendance logs: {}", e.getMessage(), e);
            return logs;
        } finally {
            if (zk != null) {
                try {
                    Dispatch.call(zk, "EnableDevice", machineNo, true);
                } catch (Exception ignore) {
                }
                disconnect(zk);
            }
        }
    }

    /**
     * Helper: Reset variants (tránh lặp code)
     */
    private void resetVariants(Variant... variants) {
        // Jacob variants tự reset khi dùng lại, không cần làm gì
        // Method này để code gọn hơn
    }


    /**
     * TẠO/CẬP NHẬT USER
     */
    public boolean upsertUser(String userId, String name, String password, int privilege, boolean enabled) {
        ActiveXComponent zk = null;
        try {
            zk = connect();
            Dispatch.call(zk, "EnableDevice", machineNo, false);

            boolean ok = Dispatch.call(zk, "SSR_SetUserInfo",
                    new Variant(machineNo),
                    new Variant(userId),
                    new Variant(name != null ? name : ""),
                    new Variant(password != null ? password : ""),
                    new Variant(privilege),
                    new Variant(enabled)
            ).getBoolean();

            if (ok) {
                log.info("✅ User {} synced to device", userId);
            }
            return ok;

        } catch (Exception e) {
            log.error("Failed to sync user to device: {}", e.getMessage());
            return false;
        } finally {
            if (zk != null) {
                try {
                    Dispatch.call(zk, "EnableDevice", machineNo, true);
                } catch (Exception ignore) {
                }
                disconnect(zk);
            }
        }
    }

    /**
     * KIỂM TRA USER TỒN TẠI
     */
    public boolean existsUser(String userId) {
        ActiveXComponent zk = null;
        try {
            zk = connect();
            Variant name = new Variant("", true);
            Variant pwd = new Variant("", true);
            Variant prv = new Variant(0, true);
            Variant en = new Variant(false, true);

            return Dispatch.call(zk, "SSR_GetUserInfo",
                    new Variant(machineNo), new Variant(userId),
                    name, pwd, prv, en).getBoolean();

        } catch (Exception e) {
            return false;
        } finally {
            if (zk != null) disconnect(zk);
        }
    }
}