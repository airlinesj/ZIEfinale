import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { SidebarComponent } from './components/sidebar.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  template: `
    <app-header *ngIf="!isLandingPage && !isAuthPage && !isFullscreenPage"></app-header>
    <app-sidebar *ngIf="!isLandingPage && !isAuthPage && !isFullscreenPage" (sidebarCollapseChange)="onSidebarCollapse($event)"></app-sidebar>
    <div class="main-content" [ngClass]="{ 'with-sidebar': !isAdmin && isLoggedIn && !isLandingPage && !isAuthPage && !isFullscreenPage && !sidebarCollapsed, 'sidebar-collapsed': !isAdmin && isLoggedIn && !isLandingPage && !isAuthPage && !isFullscreenPage && sidebarCollapsed, 'landing': isLandingPage, 'fullscreen': isFullscreenPage }">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-content {
      margin-top: 80px;
      transition: margin-left 0.3s ease;
      min-height: calc(100vh - 80px);
    }

    .main-content.landing {
      margin-top: 0;
      height: 100vh;
    }

    .main-content.fullscreen {
      margin-top: 0;
      margin-left: 0 !important;
      min-height: 100vh;
    }

    .main-content.with-sidebar {
      margin-left: 250px;
    }

    .main-content.sidebar-collapsed {
      margin-left: 80px;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-top: 70px;
        min-height: calc(100vh - 70px);
      }

      .main-content.with-sidebar {
        margin-left: 200px;
      }

      .main-content.sidebar-collapsed {
        margin-left: 70px;
      }
    }

    @media (max-width: 480px) {
      .main-content {
        margin-top: 60px;
        min-height: calc(100vh - 60px);
        margin-left: 0 !important;
      }

      .main-content.landing {
        margin-top: 0;
        min-height: 100vh;
      }
    }
  `],
})
export class AppComponent implements OnInit {
  title = 'zie-frontend';
  isLoggedIn = false;
  isAdmin = false;
  isLandingPage = false;
  isAuthPage = false;
  isFullscreenPage = false;
  sidebarCollapsed = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check current route on init
    this.updatePageStatus();

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageStatus();
      });

    // Subscribe to auth state
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'Admin';
    });
  }

  onSidebarCollapse(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  private updatePageStatus(): void {
    this.isLandingPage = this.router.url === '/';
    const authPages = ['/login', '/register'];
    this.isAuthPage = authPages.includes(this.router.url);
    // Fullscreen pages: certificate and sponsor review (no header/sidebar)
    this.isFullscreenPage = this.router.url.startsWith('/certificate') || this.router.url.startsWith('/sponsor-review');
  }
}
