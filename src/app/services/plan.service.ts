import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Plan } from '../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient);
  private API_URL = environment.apiUrl

  getAllPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.API_URL}/plan`);
  }

  getPlanById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.API_URL}/plan/${id}`);
  }

  updatePlan(id: number, payload: Partial<Plan>): Observable<any> {
    return this.http.put(`${this.API_URL}/plan/${id}`, payload);
  }
}