export const leaveTypeMapping: Record<string, string> = {
  annual: "Nghỉ phép năm",
  sick: "Nghỉ ốm",
  maternity: "Thai sản",
  wedding_employee: "Nghỉ cưới",
  wedding_child: "Con cưới",
  funeral_parent: "Tang cha/mẹ",
  unpaid: "Nghỉ không lương",
  OT_COMP: "Nghỉ bù OT",
};

export const durationMapping: Record<string, string> = {
  FULL_DAY: "Cả ngày",
  MORNING: "Buổi sáng",
  AFTERNOON: "Buổi chiều",
};

export function getLeaveTypeName(code: string): string {
  return leaveTypeMapping[code] || code;
}

export function getDurationName(code: string): string {
  return durationMapping[code] || code;
}
