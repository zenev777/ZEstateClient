import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { SessionService } from '../../core/services/session.service';
import { DocumentAccessName, DocumentItem, DocumentTypeName } from '../../core/models/document.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const TYPE_LABELS = ['Протокол', 'Договор', 'Фактура', 'Друго'];
const ACCESS_LABELS = ['Публичен', 'Само домоуправител'];

@Component({
  selector: 'app-document-center',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, BottomNav],
  templateUrl: './document-center.html',
})
export class DocumentCenter implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly documentService = inject(DocumentService);
  private readonly session = inject(SessionService);

  readonly typeLabels = TYPE_LABELS;
  readonly accessLabels = ACCESS_LABELS;
  readonly isManager = this.session.hasRole('HouseManager');

  readonly documentsLoading = signal(true);
  readonly documents = signal<DocumentItem[]>([]);
  readonly error = signal<string | null>(null);

  readonly filterType = this.fb.nonNullable.control('');
  readonly filterFrom = this.fb.nonNullable.control('');
  readonly filterTo = this.fb.nonNullable.control('');

  readonly uploadOpen = signal(false);
  readonly uploading = signal(false);
  readonly selectedFile = signal<File | null>(null);

  readonly uploadForm = this.fb.nonNullable.group({
    type: ['Other' as DocumentTypeName, Validators.required],
    access: ['All' as DocumentAccessName, Validators.required],
  });

  ngOnInit(): void {
    this.loadDocuments();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadDocuments(): void {
    this.documentsLoading.set(true);
    this.error.set(null);
    this.documentService
      .getDocuments({
        type: this.filterType.value || null,
        from: this.filterFrom.value || null,
        to: this.filterTo.value || null,
      })
      .subscribe({
        next: (docs) => {
          this.documents.set(docs);
          this.documentsLoading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.documentsLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.loadDocuments();
  }

  toggleUpload(): void {
    this.uploadOpen.set(!this.uploadOpen());
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  submitUpload(): void {
    const file = this.selectedFile();
    if (!file || this.uploadForm.invalid) {
      return;
    }

    const raw = this.uploadForm.getRawValue();
    this.uploading.set(true);
    this.error.set(null);

    this.documentService.upload(file, raw.type, raw.access).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploadOpen.set(false);
        this.selectedFile.set(null);
        this.loadDocuments();
      },
      error: (err: Error) => {
        this.uploading.set(false);
        this.error.set(err.message);
      },
    });
  }

  download(doc: DocumentItem): void {
    this.documentService.download(doc.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  deleteDocument(doc: DocumentItem): void {
    if (!confirm(`Да изтрия ли "${doc.fileName}"?`)) {
      return;
    }

    this.documentService.delete(doc.id).subscribe({
      next: () => this.loadDocuments(),
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
