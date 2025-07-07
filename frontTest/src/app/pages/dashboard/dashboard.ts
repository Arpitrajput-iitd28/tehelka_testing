import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LayoutComponent } from '../../shared/layout/layout';
import { ChangeDetectorRef } from '@angular/core';
import { 
  DashboardService, 
  KPIMetrics, 
  PerformanceMetrics, 
  PipelineStatus,
  TopEndpoint,
  RecentTest 
} from './dashboard-service';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LayoutComponent, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('responseTimeChart') responseTimeChart!: BaseChartDirective;
  @ViewChild('errorRateChart') errorRateChart!: BaseChartDirective;
  
  // Add flag to force chart re-render
  private chartRenderKey = 0;
  showCharts = true;
  private viewInitialized = false;

  // Data properties - Initialize to prevent undefined errors
  kpiMetrics: KPIMetrics = {
    systemHealthScore: 0,
    activeTests: 0,
    apiAvailability: 0,
    criticalAlerts: 0
  };

  performanceMetrics: PerformanceMetrics = {
    averageResponseTime: 0,
    errorRate: 0,
    requestsPerSecond: 0,
    latencyP95: 0,
    latencyP99: 0
  };

  pipelineStatus: PipelineStatus = {
    running: 0,
    successful: 0,
    failed: 0,
    scheduled: 0,
    queuedTests: 0
  };

  // Initialize arrays to prevent undefined errors
  topSlowEndpoints: TopEndpoint[] = [];
  recentTests: RecentTest[] = [];

  // Chart data - Initialize to prevent undefined errors
  responseTimeChartData: ChartData<'line'> = { 
    labels: [], 
    datasets: [] 
  };
  errorRateChartData: ChartData<'bar'> = { 
    labels: [], 
    datasets: [] 
  };
  
  // Chart configurations with updated resize handling
  responseTimeChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0, // Immediate resize
    animation: false, // Disable animations completely
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Response Time (ms)'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Time'
            }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    }
  };

errorRateChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0, // Immediate resize
    animation: false, // Disable animations completely
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Error Rate (%)'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Time'
            }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    }
};
  // Fix: Use string literals instead of ChartType
  responseTimeChartType: 'line' = 'line';
  errorRateChartType: 'bar' = 'bar';

  // UI state
  selectedTimeRange: '1h' | '24h' | '7d' = '24h';
  isLoading = true;
  lastUpdated = new Date();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private sidebarEventListener?: () => void;

  // Cache for random values to prevent ExpressionChangedAfterItHasBeenCheckedError
  private randomValueCache = new Map<string, number>();

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Start real-time updates for KPI data immediately
    this.startRealTimeUpdates();
  }

  ngAfterViewInit(): void {
    // Mark view as initialized
    this.viewInitialized = true;
    
    // Create a proper event listener reference for cleanup
    this.sidebarEventListener = () => {
      this.handleSidebarToggle();
    };
    
    window.addEventListener('sidebarToggled', this.sidebarEventListener);
    
    // Load dashboard data after view is initialized
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadDashboardData();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Properly remove event listener
    if (this.sidebarEventListener) {
      window.removeEventListener('sidebarToggled', this.sidebarEventListener);
    }
  }

  private handleSidebarToggle(): void {
    console.log('Sidebar toggled - forcing chart re-render');
    
    // Method 1: Force complete chart re-render
    this.forceChartRerender();
    
    // Method 2: Try multiple resize approaches
    setTimeout(() => {
      this.multipleResizeAttempts();
    }, 400);
  }

  private forceChartRerender(): void {
    // Hide charts temporarily
    this.showCharts = false;
    this.cdr.detectChanges();
    
    // Show charts again after a brief delay
    setTimeout(() => {
      this.showCharts = true;
      this.chartRenderKey++;
      this.cdr.detectChanges();
    }, 100);
  }

  private multipleResizeAttempts(): void {
    // Attempt 1: Window resize event
    window.dispatchEvent(new Event('resize'));
    
    // Attempt 2: Direct chart resize
    setTimeout(() => {
      if (this.responseTimeChart?.chart) {
        this.responseTimeChart.chart.resize();
        this.responseTimeChart.chart.update('none');
      }
      if (this.errorRateChart?.chart) {
        this.errorRateChart.chart.resize();
        this.errorRateChart.chart.update('none');
      }
    }, 50);
    
    // Attempt 3: Force container reflow
    setTimeout(() => {
      this.forceContainerReflow();
    }, 100);
    
    // Attempt 4: Final resize attempt
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }

  private forceContainerReflow(): void {
    const chartContainers = document.querySelectorAll('.chart-wrapper');
    chartContainers.forEach(container => {
      const element = container as HTMLElement;
      const display = element.style.display;
      element.style.display = 'none';
      element.offsetHeight; // Force reflow
      element.style.display = display;
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load chart data with error handling
    this.subscriptions.push(
      this.dashboardService.getResponseTimeChartData(this.selectedTimeRange).subscribe({
        next: (data) => {
          this.responseTimeChartData = data;
          console.log('Response time chart data loaded:', data);
          
          // Force change detection after data is loaded
          this.cdr.detectChanges();
          this.ensureChartsRender();
        },
        error: (error) => {
          console.error('Error loading response time data:', error);
          this.responseTimeChartData = { labels: [], datasets: [] };
          this.cdr.detectChanges();
        }
      }),

      this.dashboardService.getErrorRateChartData(this.selectedTimeRange).subscribe({
        next: (data) => {
          this.errorRateChartData = data;
          console.log('Error rate chart data loaded:', data);
          
          // Force change detection after data is loaded
          this.cdr.detectChanges();
          this.ensureChartsRender();
        },
        error: (error) => {
          console.error('Error loading error rate data:', error);
          this.errorRateChartData = { labels: [], datasets: [] };
          this.cdr.detectChanges();
        }
      }),

      this.dashboardService.getTopSlowEndpoints().subscribe({
        next: (data) => {
          this.topSlowEndpoints = data || [];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading endpoints:', error);
          this.topSlowEndpoints = [];
          this.cdr.detectChanges();
        }
      }),

      this.dashboardService.getRecentTests().subscribe({
        next: (data) => {
          this.recentTests = data || [];
          this.isLoading = false;
          
          // Final change detection and ensure everything is rendered
          this.cdr.detectChanges();
          this.ensureChartsRender();
        },
        error: (error) => {
          console.error('Error loading recent tests:', error);
          this.recentTests = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  private ensureChartsRender(): void {
    if (!this.viewInitialized) return;
    
    // Additional rendering assistance for charts
    setTimeout(() => {
      if (this.responseTimeChart?.chart) {
        this.responseTimeChart.chart.update('none');
      }
      if (this.errorRateChart?.chart) {
        this.errorRateChart.chart.update('none');
      }
      
      // Trigger a window resize to ensure proper chart sizing
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  startRealTimeUpdates(): void {
    // Real-time KPI updates with continuous refresh
    this.subscriptions.push(
      this.dashboardService.getKPIMetrics().subscribe({
        next: (data) => {
          this.kpiMetrics = data;
          this.lastUpdated = new Date();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading KPI metrics:', error);
        }
      }),

      this.dashboardService.getPerformanceMetrics().subscribe({
        next: (data) => {
          this.performanceMetrics = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading performance metrics:', error);
        }
      }),

      this.dashboardService.getPipelineStatus().subscribe({
        next: (data) => {
          this.pipelineStatus = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading pipeline status:', error);
        }
      })
    );

    // Start continuous data refresh for charts and other dynamic content
    this.startContinuousRefresh();
  }

  private startContinuousRefresh(): void {
    // Refresh chart data every 5 seconds
    const chartRefreshInterval = setInterval(() => {
      if (!this.isLoading) {
        this.loadDashboardData();
      }
    }, 5000);

    // Refresh endpoints and tests every 10 seconds
    const endpointRefreshInterval = setInterval(() => {
      this.refreshEndpointsAndTests();
    }, 10000);

    // Store intervals for cleanup
    this.subscriptions.push(
      {
        unsubscribe: () => {
          clearInterval(chartRefreshInterval);
          clearInterval(endpointRefreshInterval);
        }
      } as any
    );
  }

  private refreshEndpointsAndTests(): void {
    this.subscriptions.push(
      this.dashboardService.getTopSlowEndpoints().subscribe({
        next: (data) => {
          this.topSlowEndpoints = data || [];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error refreshing endpoints:', error);
        }
      }),

      this.dashboardService.getRecentTests().subscribe({
        next: (data) => {
          this.recentTests = data || [];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error refreshing tests:', error);
        }
      })
    );
  }

  onTimeRangeChange(): void {
    this.loadDashboardData();
  }

  refreshDashboard(): void {
    this.loadDashboardData();
    this.refreshEndpointsAndTests();
    this.lastUpdated = new Date();
  }

  // Utility methods for templates
  getHealthScoreClass(): string {
    if (this.kpiMetrics.systemHealthScore >= 95) return 'excellent';
    if (this.kpiMetrics.systemHealthScore >= 85) return 'good';
    if (this.kpiMetrics.systemHealthScore >= 70) return 'warning';
    return 'critical';
  }

  getErrorRateClass(): string {
    if (this.performanceMetrics.errorRate <= 1) return 'good';
    if (this.performanceMetrics.errorRate <= 3) return 'warning';
    return 'critical';
  }

  getResponseTimeClass(): string {
    if (this.performanceMetrics.averageResponseTime <= 200) return 'excellent';
    if (this.performanceMetrics.averageResponseTime <= 500) return 'good';
    if (this.performanceMetrics.averageResponseTime <= 1000) return 'warning';
    return 'critical';
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}