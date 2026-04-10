import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dettaglio-carrello',
  standalone: false,
  templateUrl: './dettaglio-carrello.html',
  styleUrl: './dettaglio-carrello.css',
})
export class DettaglioCarrello implements OnInit {
  datiCarrello: any;

  constructor(
    private router: Router,
    private location: Location
  ){}

  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.datiCarrello = history.state.carrelloData;
    if(!this.datiCarrello){
      this.router.navigate(['/admin/gestione-carrello']);
    }
    else{
      console.log('Dati carrello:', this.datiCarrello);
    }
  }
}