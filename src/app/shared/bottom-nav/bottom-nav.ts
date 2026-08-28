import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  readonly active = input<'home' | 'fees' | 'chat'>('home');
}
