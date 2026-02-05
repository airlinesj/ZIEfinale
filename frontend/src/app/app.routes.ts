import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { ApplicantDashboardComponent } from './pages/applicant-dashboard.component';
import { FormM1Component } from './pages/form-m1.component';
import { SponsorReviewComponent } from './pages/sponsor-review.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: ApplicantDashboardComponent },
  { path: 'form-m1', component: FormM1Component },
  { path: 'sponsor-review/:token', component: SponsorReviewComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: '**', redirectTo: '/' },
];
