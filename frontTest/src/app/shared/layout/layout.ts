import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error';
  timestamp: Date;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  @Input() pageTitle: string = 'Dashboard';

  // Sidebar state
  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  testsDropdownOpen = false;
  projectsDropdownOpen = false;

  // Header state
  showNotifications = false;
  userMenuOpen = false;
  searchQuery = '';

  // User data
  currentUser = { 
    name: 'Test User', 
    email: 'test@example.com',
    avatar: 'https://via.placeholder.com/32'
  };

  // Notifications
  notifications: Notification[] = [
    {
      id: '1',
      message: 'Load test "API Performance Test" completed successfully',
      type: 'success',
      timestamp: new Date()
    },
    {
      id: '2',
      message: 'Test "Database Stress Test" failed - check logs',
      type: 'error',
      timestamp: new Date()
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load user data and notifications
    this.loadUserData();
  }

  // Sidebar methods
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      this.testsDropdownOpen = false;
      this.projectsDropdownOpen = false;
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  toggleTestsDropdown(): void {
    if (!this.sidebarCollapsed) {
      this.testsDropdownOpen = !this.testsDropdownOpen;
      this.projectsDropdownOpen = false;
    }
  }

  toggleProjectsDropdown(): void {
    if (!this.sidebarCollapsed) {
      this.projectsDropdownOpen = !this.projectsDropdownOpen;
      this.testsDropdownOpen = false;
    }
  }

  // Header methods
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.userMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.showNotifications = false;
  }

  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  loadUserData(): void {
    // Load user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
