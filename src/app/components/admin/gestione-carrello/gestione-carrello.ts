import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { GestioneCarrelloServices } from '../../../services/gestione-carrello-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestione-carrello',
  standalone: false,
  templateUrl: './gestione-carrello.html',
  styleUrl: './gestione-carrello.css',
})
export class GestioneCarrello implements OnInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['numeroElenco', 'id', 'idAccount', 'numeroElementi', 'azioni'];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private gestioneCarrelloService: GestioneCarrelloServices,
    private snackBar: MatSnackBar,
    private router: Router
  ){}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){
    this.gestioneCarrelloService.listAll().subscribe({
      next: (data: any[]) => {
        this.dataSource.data = data;
      },
      error: () => {
        this.showMsg('Errore caricamento dati', true);
      }
    });
  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
  }

  details(carrello: any){
    this.router.navigate(['/admin/dettaglio-carrello'], { state: { carrelloData: carrello } });
  }

  showMsg(msg: string, isError: boolean){
    this.snackBar.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}