import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
export interface LoadTestConfigRequest{
  fileName: string;
  targetUrl: string;
  numUsers: number;
  rampUpPeriod: number; //in seconds
  testDuration: number; //in seconds
  scheduledExecutionTime?: string;
  crudType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
}

export interface LoadTestConfig{
  id? : string;
  fileName: string;
  targetURL: string;
  numUsers: number;
  rampupperiod: number; //in seconds
  testDuration: number; //in seconds
  scheduledExecutionTime?: string;
  crudType: string;
  createdAt?: string;
  status?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CreateTestService {
  private baseURL= `${environment.apiUrl}/load-tests`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Create a new load test configuration

  createLoadTestConfig(request: LoadTestConfigRequest): Observable<LoadTestConfig> {
    return this.http.post<LoadTestConfig>(`${this.baseURL}/config`, request, this.httpOptions);
  }

  getAllScheduledTests(): Observable<LoadTestConfig[]> {
    return this.http.get<LoadTestConfig[]>(`${this.baseURL}/scheduled-tests`);
  }
  
  convertFormToApiRequest(formData: any, selectedFile?: File): LoadTestConfigRequest {
    return {
      fileName: selectedFile ? selectedFile.name : formData.testName || 'default-test',
      targetUrl: formData.targetUrl,           // Fixed field name
      numUsers: parseInt(formData.virtualUsers) || 10,
      rampUpPeriod: parseInt(formData.rampUpTime) || 30,  // Fixed field name
      testDuration: (parseInt(formData.duration) || 5) * 60,
      scheduledExecutionTime: formData.scheduleTime ? new Date(formData.scheduleTime).toISOString() : undefined,
      crudType: this.mapTestTypeToCrudType(formData.testType)
    };
  }

  private mapTestTypeToCrudType(testType: string): 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' {
    switch (testType) {
      case 'load':
        return 'READ';
      case 'stress':
        return 'CREATE';
      case 'spike':
        return 'UPDATE';
      case 'volume':
        return 'DELETE';
      default:
        return 'READ';
    }
  }
}
