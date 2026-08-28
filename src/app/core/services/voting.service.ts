import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
import { CreateVoteQuestionRequest, VoteQuestionSummary, VoteValue } from '../models/voting.models';

@Injectable({ providedIn: 'root' })
export class VotingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getQuestions(meetingId: number): Observable<VoteQuestionSummary[]> {
    return this.http
      .get<VoteQuestionSummary[]>(`${this.baseUrl}/meetings/${meetingId}/vote-questions`)
      .pipe(catchError(rethrowWithMessage));
  }

  createQuestion(meetingId: number, request: CreateVoteQuestionRequest): Observable<VoteQuestionSummary> {
    return this.http
      .post<VoteQuestionSummary>(`${this.baseUrl}/meetings/${meetingId}/vote-questions`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  vote(questionId: number, value: VoteValue): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/vote-questions/${questionId}/vote`, { value })
      .pipe(catchError(rethrowWithMessage));
  }

  getResult(questionId: number): Observable<VoteQuestionSummary> {
    return this.http
      .get<VoteQuestionSummary>(`${this.baseUrl}/vote-questions/${questionId}/result`)
      .pipe(catchError(rethrowWithMessage));
  }
}
