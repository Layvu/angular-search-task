import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
})
export class UserListComponent {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  searchCtrl: FormControl<string>;
  statusCtrl: FormControl<string>;
  users$: Observable<User[]>;
  filteredUsers$: Observable<User[]>;
  selectedEmail: string | null = null;

  constructor() {
    this.usersService.load();

    this.users$ = this.usersService.users$;
    this.searchCtrl = this.fb.nonNullable.control('');
    this.statusCtrl = this.fb.nonNullable.control('all');

    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchCtrl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.statusCtrl.valueChanges.pipe(startWith('all')),
    ]).pipe(
      map(([users, search, status]) => {
        const normalizedSearch = search.toLowerCase().trim();

        return users
          .filter(
            (user) => normalizedSearch === '' || user.name.toLowerCase().includes(normalizedSearch),
          )
          .filter((user) => {
            if (status === 'active') return user.active;
            if (status === 'inactive') return !user.active;
            return true; // 'all'
          });
      }),
    );
  }

  selectUser(user: User) {
    this.selectedEmail = user.email;
  }

  clearSelection() {
    this.selectedEmail = null;
  }

  trackById(index: number, user: User) {
    return user.id;
  }
}
