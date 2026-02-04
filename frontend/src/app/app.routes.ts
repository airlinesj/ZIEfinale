import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { FormM1Component } from './pages/form-m1.component';
import { SponsorReviewComponent } from './pages/sponsor-review.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'form-m1', component: FormM1Component },
  { path: 'sponsor-review/:token', component: SponsorReviewComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: '**', redirectTo: '/login' },
];
