import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../mock-users';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  private loaded = false;

  readonly users$: Observable<User[]> = this.usersSubject.asObservable();

  load() {
    if (!this.loaded) {
      this.http
        .get<User[]>('/api/users')
        .pipe(
          catchError(() => of(MOCK_USERS)),
          finalize(() => (this.loaded = true)),
        )
        .subscribe((users) => {
          this.usersSubject.next(users);
        });
    }
  }
}
