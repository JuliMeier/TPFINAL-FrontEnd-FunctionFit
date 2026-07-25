import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private API_URL = environment.apiUrl + '/Auth';
    private http = inject(HttpClient);
    
    async forgotPassword(email: string) {
        return firstValueFrom(
        this.http.post(`${this.API_URL}/forgot-password`, { email })
  );

    }

    async resetPassword(data: { token: string | null; newPassword: string }) {
        return firstValueFrom(
        this.http.post(`${this.API_URL}/reset-password`, data)
  );
}

    getUserId(): number {
        try {
            const currentUserJson = localStorage.getItem('currentUser');
            
            if (!currentUserJson) {
                return 0;
            }
            
            const currentUser = JSON.parse(currentUserJson);
            const userId = currentUser.id;
            
            if (!userId) {
                return 0;
            }
            
            return Number(userId);
        } catch (error) {
            console.error('Error al obtener ID del usuario:', error);
            return 0;
        }
    }
}