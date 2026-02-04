import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  title = 'zie-frontend';
}
