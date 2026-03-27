import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { OrdiniServices } from '../../../services/ordini-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { Ordine } from '../../../models/ordine.model';
import { OrdiniDialog } from '../dialogs/ordini-dialog/ordini-dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RigaOrdine } from '../../../models/riga-ordine.model';
import { RigaOrdineServices } from '../../../services/riga-ordine-services';
import { RigaOrdineDialog } from '../dialogs/riga-ordine-dialog/riga-ordine-dialog';


@Component({
  selector: 'app-gestione-ordini',
  standalone: false,
  templateUrl: './gestione-ordini.html',
  styleUrl: './gestione-ordini.css',
})
export class GestioneOrdini implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

   displayedColumns: string[] = ['account', 'data', 'stato', 'tipoPagamento', 'tipoSpedizione', 'righeOrdine'];
  dataSource = new MatTableDataSource<Ordine>();
  righeOrdine: { [idOrdine: number]: RigaOrdine[] } = {};
filters = {
    username: '',
    tipoPagamento: '',
    tipoSpedizione: '',
    data: '',
    statoOrdine: '',
    isbnInput: ''
  };
  
  loading = false;
  expandedOrdine: Ordine | null = null;

  constructor(
    private ordineServices: OrdiniServices,
     private rigaOrdineServices: RigaOrdineServices,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // parametri di filtro 
    const params: any = {};
    if (this.filters.username) params.username = this.filters.username;
    if (this.filters.tipoPagamento) params.tipoPagamento = this.filters.tipoPagamento;
    if (this.filters.tipoSpedizione) params.tipoSpedizione = this.filters.tipoSpedizione;
    if (this.filters.data) params.data = this.filters.data;
    if (this.filters.statoOrdine) params.statoOrdine = this.filters.statoOrdine;
    if (this.filters.isbnInput) params.isbns = [this.filters.isbnInput];

    this.ordineServices.list(params).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.showMsg('Errore caricamento dati', true);
        this.loading = false;
      }
    });
  }

  toggleExpand(ordine: Ordine, event: Event) {
    event.stopPropagation();
    if (this.expandedOrdine === ordine) {
      this.expandedOrdine = null;
    } else {
      this.expandedOrdine = ordine;
      this.loadRighe(ordine);
    }
  }

  loadRighe(ordine: Ordine) {
    this.rigaOrdineServices.list(ordine.id).subscribe({
      next: (righe) => this.righeOrdine[ordine.id] = righe,
      error: () => this.showMsg('Errore caricamento righe', true)
    });
  }
  openRigaDialog(riga: RigaOrdine | null, ordine: Ordine) {
    const dialogRef = this.dialog.open(RigaOrdineDialog, {
      width: '400px',
      data: { riga, idOrdine: ordine.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'delete') {
        this.rigaOrdineServices.delete(result.id).subscribe({
          next: (res: any) => { this.showMsg(res.msg, false); this.loadRighe(ordine); },
          error: (err) => this.showMsg(err.error?.msg, true)
        });
      }

      if (result.action === 'save') {
        const call = riga
          ? this.rigaOrdineServices.update({ id: riga.id, ...result })
          : this.rigaOrdineServices.create(result);

        call.subscribe({
          next: (res: any) => { this.showMsg(res.msg, false); this.loadRighe(ordine); },
          error: (err) => this.showMsg(err.error?.msg, true)
        });
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(OrdiniDialog, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.ordineServices.create(result).subscribe({
        next: (res: any) => {
          this.showMsg(res.msg, false);
          this.loadData();
        },
        error: (err) => {
          this.showMsg(err.error?.msg, true);
        }
      });
    });
  }

  edit(ordine: Ordine) {
    const dialogRef = this.dialog.open(OrdiniDialog, {
      width: '500px',
      data: ordine
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'delete') {
        this.ordineServices.delete(result.id).subscribe({
          next: (res: any) => this.showMsg(res.msg, false),
          error: (err) => this.showMsg(err.error?.msg, true),
          complete: () => this.loadData()
        });
      }

      if (result.action === 'save') {
        this.ordineServices.update({
          id: ordine.id,
          ...result
        }).subscribe({
          next: (res: any) => {
            this.showMsg(res.msg, false);
            this.loadData();
          },
          error: (err) => {
            this.showMsg(err.error?.msg, true);
          },
          complete: () => this.loadData()
        });
      }
    });

//    window.scrollTo({ top: 0, behavior: 'smooth' });

  }

  onFilterChange() {
    this.loadData();
  }

  resetFilters() {
    this.filters = {
      username: '',
      tipoPagamento: '',
      tipoSpedizione: '',
      data: '',
      statoOrdine: '',
      isbnInput: ''
    };
    this.loadData();
  }

  showMsg(msg: string, isError: boolean) {
    this.snack.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
  /*
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
*/

}
