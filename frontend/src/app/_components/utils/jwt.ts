interface JwtPayload {
    sub?: string;
    full_name?: string;
    employee_code?: string;
    role?: string;
    exp?: number;
    iat?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) {
      return null;
    }
    const normalizedPayload = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(normalizedPayload)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT payload", error);
    return null;
  }
}