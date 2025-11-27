export interface Notification {
  id: string;
  //user: string;
  title: string;
  message: string;
  type: 'SALARY' | 'OT_REQUEST' | 'LEAVE_REQUEST' | 'APPROVED';
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}