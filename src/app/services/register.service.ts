import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RegisterApiRequest, RegisterRequest, RegisterResponse } from '../shared/interfaces';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private API_URL = environment.apiUrl + '/Auth';
  private http = inject(HttpClient);

  async register(data: RegisterRequest): Promise<RegisterResponse> {

    const body: RegisterApiRequest = {
      Nombre: data.name,
      Apellido: data.lastName,
      Telefono: data.phoneNumber,
      Email: data.email,
      Contraseña: data.password,
      PlanId: Number(data.plan)
    };
    
    try {
      const response = await firstValueFrom(
        this.http.post<RegisterResponse>(`${this.API_URL}/register`, body)
      );
      console.log('Mensaje del servidor:', response.message);
      return response;
    } catch (error: any) {
      
  console.error('Register error:', error);

 
  const serverErrorMessage = error.error?.message || 
                             (error.error?.errors ? JSON.stringify(error.error.errors) : null) ||
                             'Error en el registro. Intenta nuevamente.';

  
  throw serverErrorMessage;
    }
  }

 
  
}
