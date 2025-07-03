import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout';

interface Schedule {
  id: string;
  name: string;
  testName: string;
  project: string;
  nextRun: Date;
  frequency: 'One-time' | 'Daily' | 'Weekly' | 'Monthly';
  status: 'active' | 'paused' | 'completed';
  lastResult?: 'success' | 'failed';
  createdAt: Date;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './schedules.html',
  styleUrls: ['./schedules.css']
})
export class SchedulesComponent implements OnInit {
  // Stats
  upcomingTests = 5;
  activeSchedules = 12;
  completedToday = 8;
  failedSchedules = 2;

  // View state
  currentView: 'list' | 'calendar' = 'list';
  showCreateModal = false;
  selectedDate: Date | null = null;

  // Data
  allSchedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];

  // Filters
  searchQuery = '';
  statusFilter = '';
  projectFilter = '';

  // Calendar
  currentMonth = new Date();
  calendarDays: CalendarDay[] = [];
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Form
  createScheduleForm: FormGroup;
  selectedFrequency = 'one-time';
  selectedDays: string[] = [];
  weekDays = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' }
  ];

  constructor(private formBuilder: FormBuilder) {
    this.createScheduleForm = this.formBuilder.group({
      scheduleName: ['', Validators.required],
      testId: ['', Validators.required],
      project: ['', Validators.required],
      frequency: ['one-time', Validators.required],
      startDateTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSchedules();
    this.generateCalendar();
  }

  loadSchedules(): void {
    // Mock data - replace with API call
    this.allSchedules = [
      {
        id: '1',
        name: 'Daily API Health Check',
        testName: 'API Performance Test',
        project: 'ecommerce',
        nextRun: new Date('2025-07-04T09:00:00'),
        frequency: 'Daily',
        status: 'active',
        lastResult: 'success',
        createdAt: new Date('2025-07-01')
      },
      {
        id: '2',
        name: 'Weekly Stress Test',
        testName: 'Database Stress Test',
        project: 'auth',
        nextRun: new Date('2025-07-07T14:00:00'),
        frequency: 'Weekly',
        status: 'active',
        lastResult: 'success',
        createdAt: new Date('2025-06-30')
      },
      {
        id: '3',
        name: 'Monthly Load Test',
        testName: 'Frontend Load Test',
        project: 'dashboard',
        nextRun: new Date('2025-07-15T10:30:00'),
        frequency: 'Monthly',
        status: 'paused',
        lastResult: 'failed',
        createdAt: new Date('2025-06-15')
      },
      {
        id: '4',
        name: 'Payment Gateway Test',
        testName: 'Payment API Test',
        project: 'payment',
        nextRun: new Date('2025-07-05T16:00:00'),
        frequency: 'One-time',
        status: 'active',
        createdAt: new Date('2025-07-03')
      }
    ];
    this.applyFilters();
  }

  // View switching
  switchView(view: 'list' | 'calendar'): void {
    this.currentView = view;
    if (view === 'calendar') {
      this.generateCalendar();
    }
  }

  // Filtering
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allSchedules];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.name.toLowerCase().includes(query) ||
        schedule.testName.toLowerCase().includes(query) ||
        schedule.project.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(schedule => schedule.status === this.statusFilter);
    }

    if (this.projectFilter) {
      filtered = filtered.filter(schedule => schedule.project === this.projectFilter);
    }

    this.filteredSchedules = filtered;
  }

  // Calendar methods
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  getSchedulesForDate(date: Date): Schedule[] {
    return this.allSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.nextRun);
      return scheduleDate.toDateString() === date.toDateString();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Form methods
  onFrequencyChange(): void {
    this.selectedFrequency = this.createScheduleForm.get('frequency')?.value;
  }

  onDayChange(event: any): void {
    const day = event.target.value;
    if (event.target.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }
  }

  createSchedule(): void {
    if (this.createScheduleForm.valid) {
      const formData = this.createScheduleForm.value;
      console.log('Creating schedule:', formData);
      console.log('Selected days:', this.selectedDays);
      
      // API call would go here
      alert('Schedule created successfully!');
      this.showCreateModal = false;
      this.createScheduleForm.reset();
      this.selectedDays = [];
      this.loadSchedules();
    }
  }

  closeModal(event: Event): void {
    if (event.target === event.currentTarget) {
      this.showCreateModal = false;
    }
  }

  // Action methods
  editSchedule(id: string): void {
    console.log('Editing schedule:', id);
    // Navigate to edit or open edit modal
  }

  pauseSchedule(id: string): void {
    console.log('Pausing schedule:', id);
    const schedule = this.allSchedules.find(s => s.id === id);
    if (schedule) {
      schedule.status = 'paused';
      this.applyFilters();
    }
  }

  resumeSchedule(id: string): void {
    console.log('Resuming schedule:', id);
    const schedule = this.allSchedules.find(s => s.id === id);
    if (schedule) {
      schedule.status = 'active';
      this.applyFilters();
    }
  }

  deleteSchedule(id: string): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      console.log('Deleting schedule:', id);
      this.allSchedules = this.allSchedules.filter(s => s.id !== id);
      this.applyFilters();
    }
  }
  isDateSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }
}
