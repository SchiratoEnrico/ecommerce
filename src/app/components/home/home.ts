import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  advice = signal<any[]>([]);
  bestSellers = signal<any[]>([]);
  newArrives = signal<any[]>([]);
}