import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
export const routes: Routes = [
    {path: "login", component: LoginComponent},
    {path: "", redirectTo:'/login',pathMatch:'full'},
    {path: 'dashboard', component: DashboardComponent},
    {path: "**", redirectTo:'/login'},
]