import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/loading.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [MatProgressBarModule],
  template: `
    @if (isLoading()) {
      <div class="loading-bar-container">
        <mat-progress-bar mode="indeterminate" color="accent" />
      </div>
    }
  `,
  styles: [`
    .loading-bar-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      z-index: 9999;
    }
    ::ng-deep .mat-mdc-progress-bar {
      .mdc-linear-progress__bar-inner {
        border-color: #facc15 !important;
      }
      .mdc-linear-progress__buffer-bar {
        background: rgba(250, 204, 21, 0.2) !important;
      }
    }
  `]
})
export class LoadingBar {
  private loadingService = inject(LoadingService);
  isLoading = this.loadingService.getLoadingStatus();
}