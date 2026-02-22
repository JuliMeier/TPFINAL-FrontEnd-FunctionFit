import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  const skipLoadingUrls = [
    '/assets/',
    '.json',
    '.png',
    '.jpg',
    '.svg',
    '.ico'
  ];
  
  if (skipLoadingUrls.some(url => req.url.includes(url))) {
    return next(req);
  }
  
  loadingService.show();
  
  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};