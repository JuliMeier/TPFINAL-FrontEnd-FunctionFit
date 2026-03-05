import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, CreateUserByAdminRequest, EnrollmentResponse, UpdateUserByAdminRequest } from '../shared/interfaces';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private API_URL = environment.apiUrl + '/admin/user';
  private ENROLLMENT_URL = environment.apiUrl + '/Enrollment';
  private http = inject(HttpClient);

  async createUser(data: CreateUserByAdminRequest): Promise<ApiResponse> {
    try {
      return await firstValueFrom(
        this.http.post<ApiResponse>(`${this.API_URL}`, data)
      );
    } catch (error: any) {
      throw error.error?.message || 'Error al crear usuario';
    }
  }

  async updateUser(id: number, data: UpdateUserByAdminRequest): Promise<ApiResponse> {
    try {
      return await firstValueFrom(
        this.http.put<ApiResponse>(`${this.API_URL}/${id}`, data)
      );
    } catch (error: any) {
      throw error.error?.message || 'Error al actualizar usuario';
    }
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    try {
      return await firstValueFrom(
        this.http.delete<ApiResponse>(`${this.API_URL}/${id}`)
      );
    } catch (error: any) {
      throw error.error?.message || 'Error al eliminar usuario';
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>(`${this.API_URL}`)
      );
    } catch (error: any) {
      throw error.error?.message || 'Error al obtener usuarios';
    }
  }

  async getActivitySummary(): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.API_URL}/activity-summary`)
    );
  }

  async getUserProfile(userId: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${this.API_URL}/profile/${userId}`)
      );
    } catch (error: any) {
      throw error.error?.message || 'Error al obtener perfil del usuario';
    }
  }

  // ✅ NUEVO: Dar de baja a usuario de una clase
  async unenrollUser(userId: number, gymClassId: number): Promise<EnrollmentResponse> {
    try {
      return await firstValueFrom(
        this.http.request<EnrollmentResponse>('delete',
          `${this.ENROLLMENT_URL}/unenroll`,
          { body: { userId, gymClassId } }
        )
      );
    } catch (error: any) {
      throw error.error?.message || 'Error al dar de baja de la clase';
    }
  }
}