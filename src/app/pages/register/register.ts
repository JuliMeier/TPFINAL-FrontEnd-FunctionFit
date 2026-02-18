import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styles: ``,
})
export default class Register {
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private registerService = inject(RegisterService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return control ? control.hasError(errorName) && control.touched : false;
  }

  async onSubmit(): Promise<void> {
    if (!this.registerForm.valid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      const response = await this.registerService.register(this.registerForm.value);
      console.log('Registro exitoso:', response.message);
      this.toastr.success('¡Registro exitoso! Iniciá sesión para continuar.', '¡Bienvenido!');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (error: any) {
      this.toastr.error(error.message || 'Error inesperado', 'Error');
      this.errorMessage = error.message || 'Error inesperado';
    } finally {
      this.isLoading = false;
    }
  }
}