import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private isLoading = signal(false);
    private minLoadingTime = 800; 
    private requestStartTime = 0;
    private pendingHideTimeout: any = null;

    getLoadingStatus() {
        return this.isLoading.asReadonly();
    }

    show() {
        this.requestStartTime = Date.now();
        this.isLoading.set(true);
    }

    hide() {
        const elapsed = Date.now() - this.requestStartTime;
        const remainingTime = Math.max(0, this.minLoadingTime - elapsed);

        if (this.pendingHideTimeout) {
            clearTimeout(this.pendingHideTimeout);
        }

        if (remainingTime > 0) {
            this.pendingHideTimeout = setTimeout(() => {
                this.isLoading.set(false);
                this.pendingHideTimeout = null;
            }, remainingTime);
        } else {
            this.isLoading.set(false);
        }
    }
}