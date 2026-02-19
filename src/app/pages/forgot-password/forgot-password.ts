import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
})
export default class ForgotPassword {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService); 

  loading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);

    try {
      const email = this.form.value.email;
      if (!email) return;

      await this.authService.forgotPassword(email);
      
      
      this.toastr.success(
        'Si el correo existe, recibirás instrucciones pronto.', 
        'Correo Enviado',
        { timeOut: 5000 }
      );
      
      this.form.reset();
    } catch (error: any) {
      
      const errorMsg = error.error?.message || 'Error de conexión. Intenta nuevamente.';
      this.toastr.error(errorMsg, 'Error');
    } finally {
      this.loading.set(false);
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
