import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { CreateGymClassRequest, GymClass } from '../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class GymClassService {
  private http = inject(HttpClient);
  private API_URL = environment.apiUrl;

  getAllGymClasses(): Observable<GymClass[]> {
    return this.http.get<GymClass[]>(`${this.API_URL}/gymclass`);
  }

  getGymClassById(id: number): Observable<GymClass> {
    return this.http.get<GymClass>(`${this.API_URL}/gymclass/${id}`);
  }

  createGymClass(payload: CreateGymClassRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/gymclass`, payload);
  }

  editGymClass(id: number, payload: Partial<CreateGymClassRequest>): Observable<any> {
    return this.http.put(`${this.API_URL}/gymclass/${id}`, payload);
  }

  deleteGymClass(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/gymclass/${id}`);
  }
}
