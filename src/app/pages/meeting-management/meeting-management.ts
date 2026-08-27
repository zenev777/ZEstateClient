import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetingService } from '../../core/services/meeting.service';
import { SessionService } from '../../core/services/session.service';
import { MeetingMinutes, MeetingSummary } from '../../core/models/meeting.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const MEETING_STATUS_LABELS = ['Предстоящо', 'В момента', 'Приключило'];

function toLocalInput(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-meeting-management',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, BottomNav],
  templateUrl: './meeting-management.html',
})
export class MeetingManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly meetingService = inject(MeetingService);
  private readonly session = inject(SessionService);

  readonly statusLabels = MEETING_STATUS_LABELS;
  readonly isManager = this.session.hasRole('HouseManager');

  readonly meetingsLoading = signal(true);
  readonly meetings = signal<MeetingSummary[]>([]);
  readonly meetingsError = signal<string | null>(null);

  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly generatingLink = signal(false);

  readonly expandedId = signal<number | null>(null);
  readonly minutesByMeetingId = signal<Record<number, MeetingMinutes[]>>({});
  readonly uploadingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    agenda: [''],
    startDate: [toLocalInput(new Date()), Validators.required],
    endDate: [toLocalInput(new Date(Date.now() + 60 * 60 * 1000)), Validators.required],
    location: [''],
    meetUrl: [''],
    status: ['Upcoming' as 'Upcoming' | 'Active' | 'Closed'],
  });

  ngOnInit(): void {
    this.loadMeetings();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadMeetings(): void {
    this.meetingsLoading.set(true);
    this.meetingsError.set(null);
    this.meetingService.getMeetings().subscribe({
      next: (meetings) => {
        this.meetings.set(meetings);
        this.meetingsLoading.set(false);
      },
      error: (err: Error) => {
        this.meetingsError.set(err.message);
        this.meetingsLoading.set(false);
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      agenda: '',
      startDate: toLocalInput(new Date()),
      endDate: toLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
      location: '',
      meetUrl: '',
      status: 'Upcoming',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  startEdit(meeting: MeetingSummary): void {
    this.editingId.set(meeting.id);
    this.form.reset({
      title: meeting.title,
      description: meeting.description ?? '',
      agenda: meeting.agenda ?? '',
      startDate: meeting.startDate.slice(0, 16),
      endDate: meeting.endDate.slice(0, 16),
      location: meeting.location ?? '',
      meetUrl: meeting.meetUrl ?? '',
      status: (['Upcoming', 'Active', 'Closed'] as const)[meeting.status] ?? 'Upcoming',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  cancelForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.formError.set(null);
  }

  generateLink(): void {
    this.generatingLink.set(true);
    this.meetingService.generateMeetLink().subscribe({
      next: (res) => {
        this.generatingLink.set(false);
        this.form.patchValue({ meetUrl: res.meetUrl });
      },
      error: () => this.generatingLink.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request = {
      title: raw.title,
      description: raw.description || null,
      agenda: raw.agenda || null,
      startDate: raw.startDate,
      endDate: raw.endDate,
      location: raw.location || null,
      meetUrl: raw.meetUrl || null,
    };

    this.formSubmitting.set(true);
    this.formError.set(null);

    const editingId = this.editingId();
    const call = editingId
      ? this.meetingService.updateMeeting(editingId, { ...request, status: raw.status })
      : this.meetingService.createMeeting(request);

    call.subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.formOpen.set(false);
        this.editingId.set(null);
        this.loadMeetings();
      },
      error: (err: Error) => {
        this.formSubmitting.set(false);
        this.formError.set(err.message);
      },
    });
  }

  deleteMeeting(meeting: MeetingSummary): void {
    if (!confirm(`Да изтрия ли събранието "${meeting.title}"?`)) {
      return;
    }

    this.deletingId.set(meeting.id);
    this.meetingsError.set(null);

    this.meetingService.deleteMeeting(meeting.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadMeetings();
      },
      error: (err: Error) => {
        this.deletingId.set(null);
        this.meetingsError.set(err.message);
      },
    });
  }

  toggleMinutes(meeting: MeetingSummary): void {
    if (this.expandedId() === meeting.id) {
      this.expandedId.set(null);
      return;
    }

    this.expandedId.set(meeting.id);
    if (!this.minutesByMeetingId()[meeting.id]) {
      this.meetingService.getMinutes(meeting.id).subscribe({
        next: (docs) => this.minutesByMeetingId.update((map) => ({ ...map, [meeting.id]: docs })),
        error: () => {},
      });
    }
  }

  minutesFor(meetingId: number): MeetingMinutes[] {
    return this.minutesByMeetingId()[meetingId] ?? [];
  }

  uploadMinutes(meeting: MeetingSummary, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingId.set(meeting.id);
    this.meetingService.uploadMinutes(meeting.id, file).subscribe({
      next: () => {
        this.uploadingId.set(null);
        input.value = '';
        this.meetingService.getMinutes(meeting.id).subscribe((docs) =>
          this.minutesByMeetingId.update((map) => ({ ...map, [meeting.id]: docs })),
        );
      },
      error: () => {
        this.uploadingId.set(null);
        input.value = '';
      },
    });
  }

  downloadMinutes(doc: MeetingMinutes): void {
    this.meetingService.downloadDocument(doc.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}
