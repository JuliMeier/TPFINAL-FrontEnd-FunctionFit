import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CreateGymClassRequest, EnrollmentResponse, GymClass, Historical, Payment, User } from '../shared/interfaces';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private API_URL = environment.apiUrl
  private http = inject(HttpClient);

  _currentUser = signal<User | null>(null);

  // Helper to expose current user safely
  getCurrentUser(): User | null {
    return this._currentUser();
  }
  private _isAuthenticated = signal(false);

  constructor() {
    const saved = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    if (saved && token) {
      try {
        const user = JSON.parse(saved);
        if (['Socio', 'Administrador', 'SuperAdministrador'].includes(user.role)) {
          this._currentUser.set(user);
          this._isAuthenticated.set(true);

        } else {
          this.logout();
        }
      } catch (e) {
        console.warn('Invalid user in localStorage');
        this.logout();
      }
    }
  }

  isAuthenticated() {
    return this._isAuthenticated();
  }

  async login(email: string, password: string): Promise<boolean> {
    const url = `${this.API_URL}/Auth/login`;
    const body = { email, password };

    try {
      const res = await firstValueFrom(
        this.http.post<{
          token: string;
          email: string;
          role: 'Socio' | 'Administrador' | 'SuperAdministrador';
          userId: number;
          nombre: string;
          apellido: string;
          telefono: string;
          planId?: number | null;
          name?: string;
        }>(url, body)
      );

      const user: User = {
        id: res.userId.toString(),
        nombre: res.name || res.nombre || 'Usuario',
        apellido: res.apellido || '',
        telefono: res.telefono || '',
        email: res.email,
        role: res.role,
        planId: res.planId ?? null,
        name: res.name
      };

      localStorage.setItem('authToken', res.token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      this._currentUser.set(user);
      this._isAuthenticated.set(true);


      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  async getGymClasses(): Promise<GymClass[]> {
    const url = `${this.API_URL}/GymClass`;
    const response = await firstValueFrom(
      this.http.get<GymClass[]>(url)
    );
    return response;
  }

  async reserveClass(classId: number): Promise<EnrollmentResponse> {
    const user = this._currentUser();
    if (!user) throw new Error('Usuario no autenticado');
    const url = `${this.API_URL}/Enrollment/enroll`;
    const body = { userId: Number(user.id), gymClassId: classId };
    return firstValueFrom(this.http.post<EnrollmentResponse>(url, body));
  }

  async cancelReservation(classId: number): Promise<EnrollmentResponse> {
    const user = this._currentUser();
    if (!user) throw new Error('Usuario no autenticado');
    const url = `${this.API_URL}/Enrollment/unenroll`;
    const body = { userId: Number(user.id), gymClassId: classId };
    return firstValueFrom(
      this.http.request<EnrollmentResponse>('delete', url, { body })
    );
  }

  async getCurrentUserWithClasses() {
    return await firstValueFrom(
      this.http.get<{
        name: string;
        enrolledClasses: { id: number; nombre: string; dia: number; hora: string }[];
      }>(`${this.API_URL}/User/me`)
    );
  }

  async getUserHistory(): Promise<Historical[]> {
    const user = this._currentUser();
    if (!user) throw new Error('Usuario no autenticado');
    const url = `${this.API_URL}/Historical/user/${user.id}`;
    return await firstValueFrom(this.http.get<Historical[]>(url));
  }

  async getPaymentHistory(): Promise<Payment[]> {
    const url = `${this.API_URL}/payment/me`;
    return await firstValueFrom(
      this.http.get<Payment[]>(url)
    );
  }

  async createMercadoPagoPayment(
    request: { Monto: number; Email?: string }
  ): Promise<{ initPoint: string; preferenceId: string }> {
    return await firstValueFrom(
      this.http.post<{ initPoint: string; preferenceId: string }>(
        `${this.API_URL}/payment/mercadopago`,
        request
      )
    );
  }

  async notifyMercadoPago(paymentId: string): Promise<void> {
    if (!paymentId) throw new Error('paymentId es requerido');
    const url = `${this.API_URL}/payment/mercadopago/webhook`;
    await firstValueFrom(this.http.post(url, { id: paymentId }));
  }

  async verifyPaymentStatus(): Promise<void> {
    const url = `${this.API_URL}/payment/mercadopago/verify`;
    await firstValueFrom(this.http.post(url, {}));
  }

  async createGymClass(request: CreateGymClassRequest): Promise<GymClass> {
    const url = `${this.API_URL}/GymClass`;
    return firstValueFrom(
      this.http.post<GymClass>(url, request)
    );
  }
}
