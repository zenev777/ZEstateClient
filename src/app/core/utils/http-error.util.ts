import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

// status 0 means the request never reached (or came back from) the server at all -
// offline, CORS, or (on Render's free tier) the backend still waking up from a cold
// start, which can take 50+ seconds and aborts the browser's fetch in the meantime.
// HttpErrorResponse.error in that case is the raw browser TypeError ("Failed to
// fetch"), which happens to have a `.message` property too - if we don't check
// status first, the generic body?.message branch below picks that up and leaks the
// raw technical string to the user instead of a real backend {message} response.
const NETWORK_ERROR_MESSAGE =
  'Няма връзка със сървъра. Той може да се събужда след престой без активност — изчакай малко и опитай пак.';

export function rethrowWithMessage(error: HttpErrorResponse) {
  if (error.status === 0) {
    return throwError(() => new Error(NETWORK_ERROR_MESSAGE));
  }

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
