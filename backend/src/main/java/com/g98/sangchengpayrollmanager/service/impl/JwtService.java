package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key signingKey;

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @PostConstruct
    public void init() {
        byte[] keyBytes = jwtSecret.getBytes();
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo token với claims tùy chỉnh
     */
    public String generateToken(String username, String fullName, Role role, String employeeCode) {
        try {
            Instant now = Instant.now();
            Instant expiryDate = now.plusMillis(jwtExpiration);

            Map<String, Object> claims = new HashMap<>();
            claims.put("username", username);
            claims.put("full_name", fullName);
            claims.put("role_name", role.getName());
            claims.put("role_id", role.getId());
            claims.put("employee_code", employeeCode); // ➕ Thêm employeeCode vào token

            log.info("Tạo token cho user: {}", username);
            log.info("Thời gian tạo: {} ({})", now, ZonedDateTime.ofInstant(now, VIETNAM_ZONE));
            log.info("Thời gian hết hạn: {} ({})", expiryDate, ZonedDateTime.ofInstant(expiryDate, VIETNAM_ZONE));

            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setIssuedAt(Date.from(now))
                    .setExpiration(Date.from(expiryDate))
                    .signWith(signingKey, SignatureAlgorithm.HS256)
                    .compact();

        } catch (Exception e) {
            log.error("Lỗi khi tạo JWT token: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo JWT token", e);
        }
    }


    /**
     * Trích xuất username từ token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Trích xuất role từ token
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> {
            Object roleName = claims.get("role_name");
            if (roleName != null) return roleName.toString();

            // token cũ: "role": {"id":1,"name":"Admin"}
            Object roleObj = claims.get("role");
            if (roleObj instanceof Map<?, ?> map) {
                Object name = map.get("name");
                return name != null ? name.toString() : null;
            }
            if (roleObj instanceof String s) {
                return s;
            }
            return null;
        });
    }


    /**
     * Method chung để trích xuất thông tin từ token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractEmployeeCode(String token) {
        return extractClaim(token, claims -> {
            Object employeeCode = claims.get("employee_code");
            return employeeCode != null ? employeeCode.toString() : null;
        });
    }

    /**
     * Trích xuất tất cả claims từ token
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Lỗi khi đọc claims từ token: {}", e.getMessage());
            throw e;
        }
    }


    /**
     * Kiểm tra token có hợp lệ không
     */
    public boolean validateToken(String token) {
        try {
            if (token == null || token.isEmpty()) {
                log.error("Token trống hoặc null");
                return false;
            }

            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);

            return !isTokenExpired(token);

        } catch (ExpiredJwtException e) {
            log.warn("Token đã hết hạn: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            log.error("Chữ ký token không hợp lệ: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.error("Token không đúng định dạng: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("Token không được hỗ trợ: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.error("Token claims rỗng: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi validate token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra token đã hết hạn chưa
     */
    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            Instant now = Instant.now();

            // Log chi tiết thông tin thời gian để debug
            log.info("Token expiration: {} ({})", expiration,
                    ZonedDateTime.ofInstant(expiration.toInstant(), VIETNAM_ZONE));
            log.info("Current time UTC: {} ({})", now,
                    ZonedDateTime.ofInstant(now, VIETNAM_ZONE));
            log.info("Time difference: {} milliseconds",
                    now.toEpochMilli() - expiration.toInstant().toEpochMilli());

            return expiration.toInstant().isBefore(now);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra hết hạn token: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Lấy thời gian hết hạn từ token
     */
    private Date extractExpiration(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thời gian hết hạn từ token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Phương thức cũ để tương thích ngược
     *
     * @deprecated Sử dụng extractUsername thay thế
     */
    @Deprecated
    public String getUsernameFromToken(String token) {
        return extractUsername(token);
    }

    /**
     * Trả access token (JWT) từ thông tin user — tiện gọi nhanh trong AuthService.
     */
    public String getAccessToken(String username, String fullName, Role role, String employeeCode) {
        return generateToken(username, fullName, role, employeeCode);
    }


}