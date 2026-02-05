import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="header">
      <img src="assets/zielogo.png" alt="ZIE Logo" class="logo" onerror="this.style.display='none'" />
      <div class="title">ZIMBABWE INSTITUTE OF ENGINEERS</div>
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
      cursor: pointer;
    }

    .logo:hover {
      opacity: 0.9;
    }

    .title {
      margin-left: 20px;
      font-size: 20px;
      font-weight: 700;
      color: #004A59;
      letter-spacing: 1px;
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
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to login status
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
