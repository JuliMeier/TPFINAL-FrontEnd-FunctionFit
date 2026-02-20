import { Component, computed, inject, signal, effect } from '@angular/core';
import { AdminUserService } from '../../../services/adminUser.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { UserForm } from "../user-form/user-form";
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PLAN_CONFIG } from '../../../shared/interfaces';

@Component({
  selector: 'app-user-list',
  imports: [FormsModule, DatePipe, CommonModule, UserForm],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export default class UserList {
  private adminUserService = inject(AdminUserService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  searchTerm = signal('');

  users = signal<any[]>([]);
  planConfig = PLAN_CONFIG;

  showForm = signal(false);
  selectedUser: any = null;
  
  showConfirmDialog = false;
  pendingDeleteId: number | null = null;
  
  
  

  constructor() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const allUsers = await this.adminUserService.getAllUsers();
      this.users.set(allUsers);
    } catch (err: any) {
      this.toastr.error(err, 'Error al cargar usuarios');
    }
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();

    if (!allUsers || allUsers.length === 0) {
      return [];
    }
    return allUsers.filter(u =>
      (u.nombre?.toLowerCase() ?? '').includes(term) ||
      (u.email?.toLowerCase() ?? '').includes(term) ||
      (u.apellido?.toLowerCase() ?? '').includes(term)
    );
  });



  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }


  editUser(user: any) {
    this.selectedUser = user;
    this.showForm.set(true);
  }

  confirmDelete(id: number) {
  this.pendingDeleteId = id;
  this.showConfirmDialog = true;
}

cancelDelete() {
  this.showConfirmDialog = false;
  this.pendingDeleteId = null;
}

async deleteUser(id: number | null) {
  if (!id) return;
  try {
    const res = await this.adminUserService.deleteUser(id);
    this.toastr.success(res.message);
    await this.loadUsers();
  } catch (err: any) {
    this.toastr.error(err, 'Error al eliminar usuario');
  } finally {
    this.showConfirmDialog = false;
    this.pendingDeleteId = null;
  }
}

}




