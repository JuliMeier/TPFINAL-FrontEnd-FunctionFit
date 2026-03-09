import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-access-denied-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="p-8 text-center">
      <!-- Ícono -->
      <div class="w-20 h-20 rounded-full bg-red-500/20 
                  flex items-center justify-center 
                  mx-auto mb-6 border border-red-500/30">
        <mat-icon class="text-5xl text-red-400">lock</mat-icon>
      </div>
      
      <!-- Título -->
      <h2 class="text-2xl font-bold text-white mb-3">
        Acceso Denegado
      </h2>
      
      <!-- Mensaje -->
      <p class="text-slate-400 mb-8 text-base">
        {{ data.message }}
      </p>
      
      <!-- Botón -->
      <button mat-raised-button 
              (click)="close()"
              class="bg-yellow-400 text-slate-900 font-bold 
                     hover:bg-yellow-500 transition px-8 py-2.5">
        Entendido
      </button>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AccessDeniedDialog {
    constructor(
        public dialogRef: MatDialogRef<AccessDeniedDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) { }

    close(): void {
        this.dialogRef.close();
    }
}