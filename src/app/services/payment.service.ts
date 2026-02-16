import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { PaymentResponse } from '../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private http = inject(HttpClient);
    private API_URL = environment.apiUrl

    getPayments(): Observable<PaymentResponse[]> {
        return this.http.get<PaymentResponse[]>(`${this.API_URL}/Payment`);
    }

    createManualPayment(data: any): Observable<any> {

        return this.http.post(`${this.API_URL}/Payment/manual`, data);
    }

    confirmarPago(paymentId: string): Observable<any> {
        return this.http.get(`${this.API_URL}/Payment/confirm`, {
            params: { paymentId: paymentId }
        });
    }

    getActiveSubscription(userId: number): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/Payment/active/${userId}`);
    }

    createPreference(planId: number): Observable<{ initPoint: string }> {
        return this.http.post<{ initPoint: string }>(
            `${this.API_URL}/Payment/mercadopago`,
            { planId },
        );
    }

}

