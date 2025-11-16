import { decodeJwt } from "./jwt";

type TargetField = "employee_code" | "full_name" | "role";

export const getUserData = (target: TargetField) => {
  const userStr = window.sessionStorage.getItem("scpm.auth.user");
  if (!userStr) {
    return;
  }

  try {
    const parsed = JSON.parse(userStr);
    const token = parsed?.token;
    // if (!token) return;
    if (!token) {
      return;
    }

    // Giải mã token để lấy sub
    // const decoded = jwtDecode<JwtPayload>(token);
    // setUsername(decoded.full_name || "Unknown User");
    const decoded = decodeJwt(token);

    return decoded ? decoded[target] : undefined;
  } catch (error) {
    console.error("JWT decode error:", error);
  }
}

export function getUserMeta(target: TargetField){
  const userStr = window.sessionStorage.getItem("scpm.auth.user");
  if (!userStr) {
    return;
  }
  const parsed = JSON.parse(userStr);
  if (target === "role"){
    return parsed.role;
  } else if (target === "full_name"){
    return parsed.fullName;
  }
}