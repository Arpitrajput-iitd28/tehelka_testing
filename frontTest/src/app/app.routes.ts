import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { CreateTestComponent } from './pages/tests/create-test/create-test';
import { ManageTestsComponent } from './pages/tests/manage-tests/manage-tests';
import { ViewTestsComponent } from './pages/tests/view-tests/view-tests';
import { ViewProjectsComponent } from './pages/projects/view-projects/view-projects';
import { CreateProjectComponent } from './pages/projects/create-project/create-project';
import { ManageProjectsComponent } from './pages/projects/manage-projects/manage-projects';
import { SchedulesComponent } from './pages/schedules/schedules';
import { SignupComponent } from './pages/signup/signup';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';
import { ProjectDetailsComponent } from './pages/projects/view-projects-details/view-projects-details';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    
    { path: 'tests', component: ViewTestsComponent },
    { path: 'tests/create', component: CreateTestComponent },
    { path: 'tests/manage', component: ManageTestsComponent },

    { path: 'projects', component: ViewProjectsComponent },
    { path: 'projects/create', component: CreateProjectComponent },
    { path: 'projects/manage', component: ManageProjectsComponent },
    { path: 'projects/:id', component: ProjectDetailsComponent },

    { path: 'schedules', component: SchedulesComponent },
    
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];