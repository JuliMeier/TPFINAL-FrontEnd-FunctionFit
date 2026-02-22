import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { LoadingBar } from '../loading-bar/loading-bar';

@Component({
  selector: 'app-layout',
  imports: [Header, Sidebar, RouterOutlet, LoadingBar],
  templateUrl: './layout.html',
  styles: ``
})
export default class LayoutComponent {
  layoutName = 'FunctionFit';
}
