import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ServicesService } from '../../services/services.service';
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``
})
export default class Login {
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private location = inject(Location);
  private toastr = inject(ToastrService); 

  isSubmitting = signal(false);
  loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }


  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.getRawValue();

    const success = await this.servicesService.login(email, password);
    this.isSubmitting.set(false);

    if (success) {
      this.router.navigate(['/role-home']);
    } else {
      this.toastr.error('Credenciales inválidas');
    }
  }
}