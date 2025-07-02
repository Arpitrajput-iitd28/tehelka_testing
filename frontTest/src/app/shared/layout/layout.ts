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
    this.loadUserData();
    console.log('Layout component initialized');
  }

  // Sidebar methods
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    console.log('Sidebar collapsed:', this.sidebarCollapsed);
    
    if (this.sidebarCollapsed) {
      this.testsDropdownOpen = false;
      this.projectsDropdownOpen = false;
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    console.log('Mobile sidebar open:', this.mobileSidebarOpen);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  // Dropdown methods with debugging
  toggleTestsDropdown(): void {
    console.log('BEFORE - testsDropdownOpen:', this.testsDropdownOpen);
    console.log('BEFORE - sidebarCollapsed:', this.sidebarCollapsed);
    
    this.testsDropdownOpen = !this.testsDropdownOpen;
    this.projectsDropdownOpen = false;
    
    console.log('AFTER - testsDropdownOpen:', this.testsDropdownOpen);
    
    // Force change detection
    setTimeout(() => {
        console.log('After timeout - testsDropdownOpen:', this.testsDropdownOpen);
        const tooltipElement = document.querySelector('.tooltip-dropdown');
        console.log('Tooltip element found:', tooltipElement);
    }, 100);
  }

  toggleProjectsDropdown(): void {
    console.log('toggleProjectsDropdown called, sidebarCollapsed:', this.sidebarCollapsed);
    
    this.projectsDropdownOpen = !this.projectsDropdownOpen;
    this.testsDropdownOpen = false; // Close other dropdown
    console.log('Projects dropdown is now:', this.projectsDropdownOpen);
  }
  getButtonPosition(buttonType: string): number {
    // Simple calculation - adjust as needed
    const headerHeight = 80;
    const itemHeight = 50;
    const buttonIndex = buttonType === 'tests' ? 1 : 2; // Dashboard=0, Tests=1, Projects=2
    return headerHeight + (buttonIndex * itemHeight);
  }
  // Header methods
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.userMenuOpen = false;
    console.log('Notifications panel:', this.showNotifications);
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.showNotifications = false;
    console.log('User menu open:', this.userMenuOpen);
  }

  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    console.log('Notification dismissed:', id);
  }

  loadUserData(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      console.log('User data loaded:', this.currentUser);
    }
  }

  navigateToDashboard(): void {
    console.log('Navigating to dashboard');
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Helper method to check dropdown state (for debugging)
  getDropdownState(): string {
    return `Tests: ${this.testsDropdownOpen}, Projects: ${this.projectsDropdownOpen}`;
  }
}
