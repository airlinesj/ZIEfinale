import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" *ngIf="isLoggedIn && !isAdmin" [ngClass]="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <button class="collapse-btn" (click)="toggleSidebar()" title="Toggle Sidebar">
          <span class="material-symbols-outlined">{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</span>
        </button>
      </div>

      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <a routerLink="/form-m1" class="nav-item" routerActiveOptions="{ exact: true }" routerLinkActive="active">
            <span class="icon material-symbols-outlined">assignment</span>
            <span class="label" *ngIf="!isCollapsed">ZIE APPLICATION FORM</span>
          </a>

          <a routerLink="/payment" class="nav-item" routerActiveOptions="{ exact: true }" routerLinkActive="active">
            <span class="icon material-symbols-outlined">payment</span>
            <span class="label" *ngIf="!isCollapsed">PAYMENT</span>
          </a>
        </nav>

        <button (click)="logout()" class="logout-btn">
          <span class="icon material-symbols-outlined">logout</span>
          <span class="label" *ngIf="!isCollapsed">LOGOUT</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 80px;
      width: 250px;
      height: calc(100vh - 80px);
      background-color: #004A59;
      border-right: 2.5px solid #B99532;
      display: flex;
      flex-direction: column;
      padding: 0;
      z-index: 999;
      transition: width 0.3s ease;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 15px;
      border-bottom: 2.5px solid #B99532;
      display: flex;
      justify-content: flex-end;
    }

    .collapse-btn {
      background: none;
      border: none;
      color: #B99532;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .collapse-btn:hover {
      color: #FFFFFF;
      transform: scale(1.1);
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      font-size: 24px;
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px 0;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 18px 20px;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      border-left: 3px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .sidebar.collapsed .nav-item {
      padding: 18px 8px;
      justify-content: center;
    }

    .nav-item:hover {
      background-color: rgba(185, 149, 50, 0.2);
      border-left-color: #B99532;
      padding-left: 17px;
    }

    .sidebar.collapsed .nav-item:hover {
      padding-left: 8px;
    }

    .nav-item.active {
      background-color: rgba(185, 149, 50, 0.3);
      border-left-color: #B99532;
      padding-left: 17px;
    }

    .sidebar.collapsed .nav-item.active {
      padding-left: 8px;
    }

    .icon {
      font-size: 24px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .label {
      flex: 1;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 18px 20px;
      background-color: rgba(185, 149, 50, 0.2);
      color: #FFFFFF;
      border: 2.5px solid #B99532;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border-radius: 8px;
      margin: 0 15px 20px 15px;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;
      justify-content: center;
    }

    .sidebar.collapsed .logout-btn {
      padding: 18px 8px;
      margin: 0 8px 20px 8px;
      gap: 0;
    }

    .logout-btn:hover {
      background-color: #B99532;
      color: #004A59;
      transform: translateX(5px);
    }

    .sidebar.collapsed .logout-btn:hover {
      transform: scale(1.05);
    }

    .logout-btn .icon {
      font-size: 22px;
      width: 24px;
      text-align: center;
    }

    .logout-btn .label {
      flex: 1;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 200px;
      }

      .sidebar.collapsed {
        width: 70px;
      }

      .nav-item, .logout-btn {
        padding: 15px 15px;
        font-size: 13px;
      }

      .sidebar.collapsed .nav-item,
      .sidebar.collapsed .logout-btn {
        padding: 15px 8px;
      }

      .icon {
        font-size: 20px;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isCollapsed = false;

  @Output() sidebarCollapseChange = new EventEmitter<boolean>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'Admin';
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarCollapseChange.emit(this.isCollapsed);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
