// MeetingStatus: Upcoming = 0, Active = 1, Closed = 2

export interface MeetingSummary {
  id: number;
  title: string;
  description: string | null;
  agenda: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  meetUrl: string | null;
  status: number;
}

export interface MeetingFormRequest {
  title: string;
  description?: string | null;
  agenda?: string | null;
  startDate: string;
  endDate: string;
  location?: string | null;
  meetUrl?: string | null;
}

export interface MeetingUpdateRequest extends MeetingFormRequest {
  status: 'Upcoming' | 'Active' | 'Closed';
}

export interface MeetingMinutes {
  id: number;
  fileName: string;
  uploadedAt: string;
}
