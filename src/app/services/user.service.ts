import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User, UserProfileResponse } from '../shared/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private API_URL = environment.apiUrl
  private usersSignal = signal<User[]>([]);
  public users = this.usersSignal.asReadonly();

  private http = inject(HttpClient);


  async loadUsers(): Promise<User[]> {
    try {
      const data = await firstValueFrom(this.http.get<User[]>(`${this.API_URL}/User`));
      this.usersSignal.set(data);
      return data;
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      return [];
    }
  }

  async getMe(): Promise<UserProfileResponse> {
    try {
      return await firstValueFrom(
        this.http.get<UserProfileResponse>(`${this.API_URL}/User/me`)
      );
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      throw error;
    }
  }
}
