import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styles: ``,
})
export default class Register {
  registerForm: FormGroup;
  isLoading: boolean = false; 
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private registerService = inject(RegisterService);
  private router = inject(Router);

  planes = [
    { id: 1, nombre: 'Basic' },
    { id: 2, nombre: 'Premium' },
    { id: 3, nombre: 'Elite' }
  ]

  

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      plan: ['', [Validators.required]]
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
       this.router.navigate(['/login']);
     
    } catch (error: any) {
      this.errorMessage = error.message || 'Error inesperado';
    } finally {
      this.isLoading = false;
    }
  }
}
