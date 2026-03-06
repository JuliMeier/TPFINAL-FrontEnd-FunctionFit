import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {

  prices = signal([
    {
      title: 'Básico',
      price: 25,
      highlighted: false,
      features: ['Acceso a equipamiento básico', 'Horario limitado', '5 clases grupales por mes']
    },
    {
      title: 'Premium',
      price: 50,
      highlighted: true,
      features: ['Acceso completo al gimnasio', 'Horario 24/7', '10 clases grupales por mes', '1 sesión con entrenador personal mensual']
    },
    {
      title: 'Elite',
      price: 75,
      highlighted: false,
      features: ['15 clases grupales por mes', '4 sesiones con entrenador personal mensual', 'Plan nutricional personalizado']
    }
  ]);

  features = signal([
    {
      title: 'Entrenadores Expertos',
      description: 'Nuestros entrenadores certificados te guiarán en cada paso de tu viaje fitness.',
      icon: 'users' // Identificador o podrías pegar el SVG path aquí
    },
    {
      title: 'Equipamiento Moderno',
      description: 'Contamos con las últimas máquinas y equipos para maximizar tus resultados.',
      icon: 'dumbbell'
    },
    {
      title: 'Comunidad de Apoyo',
      description: 'Forma parte de una comunidad que te motiva a alcanzar tus metas.',
      icon: 'community'
    }
  ]);
}
