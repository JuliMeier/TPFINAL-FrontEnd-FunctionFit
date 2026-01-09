import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RegisterRequest {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  plan: string;
}

interface RegisterApiRequest {
  Nombre: string;
  Apellido: string;
  Telefono: string;
  Email: string;
  Contraseña: string;
  PlanId: number;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private API_URL = 'https://localhost:7150/api/Auth'; 
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
