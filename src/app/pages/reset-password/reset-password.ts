import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
  AbstractControl
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styles: ``
})

export default class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  token = signal<string | null>(null);
  loading = signal(false);
  errorMessage = signal('')


  form = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ])
  }, { validators: this.passwordsMatchValidator.bind(this) });

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  ngOnInit() {
    // Captura el token de la URL automáticamente
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    
    if (!this.token()) {
      // Redirigir si no hay token
      this.toastr.error('El enlace de recuperación es inválido o ha expirado.', 'Error');
      this.router.navigate(['/login']);
    }
  }

  async onReset() {
    if (this.form.invalid) return;

    const password = this.form.value.password;
    if (!password) return;

    const data = {
      token: this.token(),
      newPassword: password
    };
    
    try {
      await this.authService.resetPassword(data);
      this.toastr.success('Tu contraseña ha sido actualizada correctamente.', '¡Éxito!');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      console.error('Error al resetear contraseña:', error);
      
      
      const msg = error.error?.message || 'No se pudo actualizar la contraseña. El token podría estar vencido.';
      this.errorMessage.set(msg);
      this.toastr.error(msg, 'Error');
    } 
    finally {
      this.loading.set(false);
    }
  }
}