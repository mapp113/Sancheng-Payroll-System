package com.g98.sangchengpayrollmanager.security;


public class ConfirmException extends RuntimeException {
    private final String code;
    private final String message;
    private final Object payload;

    public ConfirmException(String code, String message, Object payload) {
        super(message);
        this.code = code;
        this.message = message;
        this.payload = payload;
    }

    public String getCode() { return code; }
    public Object getPayload() { return payload; }
}
