import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateVoteQuestionRequest, VoteQuestionSummary, VoteValue } from '../models/voting.models';

@Injectable({ providedIn: 'root' })
export class VotingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getQuestions(meetingId: number): Observable<VoteQuestionSummary[]> {
    return this.http
      .get<VoteQuestionSummary[]>(`${this.baseUrl}/meetings/${meetingId}/vote-questions`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  createQuestion(meetingId: number, request: CreateVoteQuestionRequest): Observable<VoteQuestionSummary> {
    return this.http
      .post<VoteQuestionSummary>(`${this.baseUrl}/meetings/${meetingId}/vote-questions`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  vote(questionId: number, value: VoteValue): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/vote-questions/${questionId}/vote`, { value })
      .pipe(catchError(this.rethrowWithMessage));
  }

  getResult(questionId: number): Observable<VoteQuestionSummary> {
    return this.http
      .get<VoteQuestionSummary>(`${this.baseUrl}/vote-questions/${questionId}/result`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  private rethrowWithMessage(error: HttpErrorResponse) {
    const body = error.error;
    let message = 'Възникна неочаквана грешка. Опитай отново.';

    if (typeof body === 'string') {
      message = body;
    } else if (body?.message) {
      message = body.message;
    } else if (Array.isArray(body)) {
      message = body.join(' ');
    } else if (body?.errors) {
      message = Object.values<string[]>(body.errors).flat().join(' ');
    }

    return throwError(() => new Error(message));
  }
}
