import { Component, inject } from '@angular/core';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styles: ``
})
export default class HomeComponent {

  private servicesService = inject(ServicesService);

  constructor() {
    this.servicesService.setPageTitle('Home');
  }
}
