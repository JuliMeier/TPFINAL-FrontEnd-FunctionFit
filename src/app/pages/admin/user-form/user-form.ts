import { Component, EventEmitter, HostListener, inject,  Input,  OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminUserService } from '../../../services/adminUser.service';
import { CreateUserByAdminRequest } from '../../../shared/interfaces';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm implements OnInit {
  private fb = inject(FormBuilder);
  private adminUserService = inject(AdminUserService);
  private toastr = inject(ToastrService);

  
  @Input() userToEdit: any = null;
  @Output() onClose = new EventEmitter<void>();

  // para que cierre con ESC
  @HostListener('document:keydown.escape')
  handleEscape() {
    this.onClose.emit();
  }


  userForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
    email: ['', [Validators.required, Validators.email]],
    roleId: ['', [Validators.required]],
    contraseña: ['', [Validators.required]],
  });

  constructor() {
   
  }


  ngOnInit(): void {

     if (this.userToEdit) {
    // Si el backend devuelve role como objeto, extraemos el id

    console.log('Editando usuario:', this.userToEdit);
    const patchData = {
      ...this.userToEdit,
      roleId: this.userToEdit.roleId || this.userToEdit.role?.id || ''
    };

    this.userForm.patchValue(patchData);

    // al editar no pedimos contraseña obligatoria
    this.userForm.get('contraseña')?.clearValidators();
    this.userForm.get('contraseña')?.updateValueAndValidity();
  }

  }


  async onSubmit() {
    if (this.userForm.invalid) return;

    const payload: CreateUserByAdminRequest = this.userForm.value as unknown as CreateUserByAdminRequest;

    console.log(this.userForm.getRawValue())


    try {
     if (this.userToEdit) {
        //  Lógica de actualización
        const response = await this.adminUserService.updateUser(this.userToEdit.id, payload);
        this.toastr.success(response.message || 'Usuario actualizado correctamente');
      } else {
        //  Lógica de creación
        const response = await this.adminUserService.createUser(payload);
        this.toastr.success(response.message || 'Usuario creado correctamente');
      }
      this.userForm.reset();   // limpiar formulario
      this.onClose.emit();     // cerrar formulario

    } catch (error:any) {
      this.toastr.error(error, 'Error'); // mostrar error del backend
    }
  }

  
}   
