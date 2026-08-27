export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
}
