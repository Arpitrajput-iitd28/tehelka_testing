import { Injectable } from '@angular/core';
import { Observable, of, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

export interface KPIMetrics {
  systemHealthScore: number;
  activeTests: number;
  apiAvailability: number;
  criticalAlerts: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  latencyP95: number;
  latencyP99: number;
}

export interface PipelineStatus {
  running: number;
  successful: number;
  failed: number;
  scheduled: number;
  queuedTests: number;
}

export interface TopEndpoint {
  name: string;
  averageResponseTime: number;
  errorRate: number;
  requestCount: number;
}

export interface RecentTest {
  id: number;
  name: string;
  status: 'running' | 'completed' | 'failed';
  duration: string;
  responseTime: number;
  errorRate: number;
  startTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() {}

  // Real-time KPI metrics
  getKPIMetrics(): Observable<KPIMetrics> {
    return interval(5000).pipe(
      map(() => ({
        systemHealthScore: this.randomBetween(85, 99),
        activeTests: this.randomBetween(2, 8),
        apiAvailability: this.randomBetween(95, 100),
        criticalAlerts: this.randomBetween(0, 3)
      }))
    );
  }

  // Performance metrics with trends
  getPerformanceMetrics(): Observable<PerformanceMetrics> {
    return interval(3000).pipe(
      map(() => ({
        averageResponseTime: this.randomBetween(120, 350),
        errorRate: this.randomBetween(0.1, 2.5),
        requestsPerSecond: this.randomBetween(450, 1200),
        latencyP95: this.randomBetween(200, 500),
        latencyP99: this.randomBetween(400, 800)
      }))
    );
  }

  // Pipeline status
  getPipelineStatus(): Observable<PipelineStatus> {
    return interval(4000).pipe(
      map(() => ({
        running: this.randomBetween(1, 5),
        successful: this.randomBetween(15, 25),
        failed: this.randomBetween(0, 3),
        scheduled: this.randomBetween(3, 8),
        queuedTests: this.randomBetween(0, 5)
      }))
    );
  }

  // Response time chart data for ng2-charts
  getResponseTimeChartData(timeRange: '1h' | '24h' | '7d' = '24h'): Observable<ChartData<'line'>> {
    const dataPoints = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 168;
    const responseTimeData: number[] = [];
    const targetData: number[] = [];
    const labels: string[] = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date();
      if (timeRange === '1h') {
        timestamp.setMinutes(timestamp.getMinutes() - (i * 5));
        labels.push(timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      } else if (timeRange === '24h') {
        timestamp.setHours(timestamp.getHours() - i);
        labels.push(timestamp.toLocaleTimeString('en-US', { hour: '2-digit' }));
      } else {
        timestamp.setDate(timestamp.getDate() - i);
        labels.push(timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      
      responseTimeData.push(this.randomBetween(100, 400));
      targetData.push(250); // SLA target
    }
    
    return of({
      labels: labels,
      datasets: [
        {
          label: 'Response Time',
          data: responseTimeData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'SLA Target',
          data: targetData,
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    });
  }

  // Error rate chart data for ng2-charts
  getErrorRateChartData(timeRange: '1h' | '24h' | '7d' = '24h'): Observable<ChartData<'bar'>> {
    const dataPoints = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 168;
    const errorRateData: number[] = [];
    const errorCountData: number[] = [];
    const labels: string[] = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date();
      if (timeRange === '1h') {
        timestamp.setMinutes(timestamp.getMinutes() - (i * 5));
        labels.push(timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      } else if (timeRange === '24h') {
        timestamp.setHours(timestamp.getHours() - i);
        labels.push(timestamp.toLocaleTimeString('en-US', { hour: '2-digit' }));
      } else {
        timestamp.setDate(timestamp.getDate() - i);
        labels.push(timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      
      const errorRate = this.randomBetween(0, 5);
      errorRateData.push(errorRate);
      errorCountData.push(Math.floor(errorRate * this.randomBetween(100, 1000) / 100));
    }
    
    return of({
      labels: labels,
      datasets: [
        {
          label: 'Error Rate (%)',
          data: errorRateData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444',
          borderWidth: 1
        }
      ]
    });
  }

  // Top slowest endpoints
  getTopSlowEndpoints(): Observable<TopEndpoint[]> {
    const endpoints = [
      'POST /api/auth/login',
      'GET /api/users/profile',
      'POST /api/orders/create',
      'GET /api/products/search',
      'PUT /api/users/update',
      'DELETE /api/orders/cancel',
      'GET /api/dashboard/metrics',
      'POST /api/payments/process'
    ];

    return of(endpoints.slice(0, 5).map(name => ({
      name,
      averageResponseTime: this.randomBetween(200, 800),
      errorRate: this.randomBetween(0, 8),
      requestCount: this.randomBetween(1000, 50000)
    })).sort((a, b) => b.averageResponseTime - a.averageResponseTime));
  }

  // Recent test results
  getRecentTests(): Observable<RecentTest[]> {
    const testNames = [
      'API Performance Baseline',
      'Database Stress Test',
      'Payment Gateway Load',
      'User Authentication Flow',
      'Search Functionality Test',
      'File Upload Performance'
    ];

    return of(testNames.map((name, index) => ({
      id: index + 1,
      name,
      status: this.randomChoice(['running', 'completed', 'failed']) as 'running' | 'completed' | 'failed',
      duration: `${this.randomBetween(2, 15)}m ${this.randomBetween(10, 59)}s`,
      responseTime: this.randomBetween(150, 500),
      errorRate: this.randomBetween(0, 5),
      startTime: new Date(Date.now() - this.randomBetween(1, 120) * 60000)
    })));
  }

  // Utility methods
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
