import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="header">
      <img src="assets/zielogo.png" alt="ZIE Logo" class="logo" />
      <div class="title">Zimbabwe Institution of Engineers</div>
      <div style="margin-left: auto; display: flex; gap: 15px;">
        <a routerLink="/dashboard" class="nav-link" *ngIf="isLoggedIn">Dashboard</a>
        <button (click)="logout()" class="nav-button" *ngIf="isLoggedIn">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      background-color: #FFFFFF;
      border-bottom: 2.5px solid #B99532;
      display: flex;
      align-items: center;
      padding: 0 20px;
      z-index: 1000;
    }

    .logo {
      height: 60px;
      width: auto;
    }

    .title {
      margin-left: 20px;
      font-size: 24px;
      font-weight: 700;
      color: #004A59;
    }

    .nav-link, .nav-button {
      text-decoration: none;
      color: #004A59;
      font-weight: 600;
      cursor: pointer;
      background: none;
      border: none;
      font-size: 14px;
    }

    .nav-button:hover {
      color: #B99532;
    }
  `]
})
export class HeaderComponent {
  isLoggedIn = false;

  logout(): void {
    // TODO: Implement logout
  }
}
