import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GestioneCarrelloServices } from '../../../services/gestione-carrello-services';

@Component({
  selector: 'app-dettaglio-carrello',
  standalone: false,
  templateUrl: './dettaglio-carrello.html',
  styleUrl: './dettaglio-carrello.css',
})
export class DettaglioCarrello implements OnInit {
  datiCarrello: any;
  righe: any[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private carrelloService: GestioneCarrelloServices,
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
      const accountId = this.datiCarrello.account?.id;
      if(accountId){
        this.carrelloService.findByAccountId(accountId).subscribe({
          next: (data) => {
            this.righe = data.righe ?? [];
            console.log('Righe carrello:', this.righe);
          },
          error: (err) => console.error('Errore caricamento righe:', err)
        });
      }
    }
  }
}