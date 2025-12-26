import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: ``
})
export default class LoginComponent {
  private servicesService = inject(ServicesService);
  private router = inject(Router);

  isSubmitting = signal(false);
  loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  getError(field: string): string {
    const errors = this.loginForm.get(field)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'Campo obligatorio';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return 'Mínimo 6 caracteres';
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.getRawValue();

    const success = await this.servicesService.login(email, password);
    this.isSubmitting.set(false);

    if (success) {
      this.router.navigate(['/']);
    } else {
      alert('Usuario no encontrado. Prueba con: Sincere@april.biz');
    }
  }
}
