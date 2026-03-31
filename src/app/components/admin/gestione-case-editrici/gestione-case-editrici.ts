import { Component, OnInit, ViewChild } from '@angular/core';
import { CaseEditriciServices } from '../../../services/case-editrici-services';
import { MatTableDataSource } from '@angular/material/table';
import { CasaEditrice } from '../../../models/casa-editrice';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CasaEditriceDialog } from '../dialogs/casa-editrice-dialog/casa-editrice-dialog';

@Component({
  selector: 'app-gestione-case-editrici',
  standalone: false,
  templateUrl: './gestione-case-editrici.html',
  styleUrl: './gestione-case-editrici.css',
})
export class GestioneCaseEditrici implements OnInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // sorting lato front side
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nome', 'email', 'descrizione', 'indirizzo'];
  dataSource = new MatTableDataSource<CasaEditrice>();
  //private dialog: MatDialog;
  filters = {
    nome: '',
    descrizione: '',
    email: '',
    indirizzo: ''
  };

  constructor(
    private caseEditriciServices: CaseEditriciServices,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  form!: FormGroup;
  loading = false;
  casaEditriceInModifica: CasaEditrice | null = null;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      descrizione: ['', [Validators.required]],
      indirizzo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      isbns: [[], [Validators.required]]
    });
  }

  loadData() {
    // ricarico con fitri da backend
    this.loading = true;
    this.caseEditriciServices.listCaseEditrici(this.filters).subscribe({
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

  ngAfterViewInit() {
    // controlla numero righe tab
    this.dataSource.paginator = this.paginator;

    // controlla sorting NW frontend side
    this.dataSource.sort = this.sort;
    this.loadData();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CasaEditriceDialog, {
      width: '400px',
      data: null
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
    
      this.caseEditriciServices.create(result).subscribe({
        next: (res: any) => {
          this.showMsg(res.msg, false);
          this.reset();
          this.loadData();
        },
        error: (err) => {
          this.showMsg(err.error?.msg, true);
        }
      });
    });
  }  

  edit(casaEditrice: CasaEditrice) {
    const dialogRef = this.dialog.open(CasaEditriceDialog, {
      width: '400px',
      data: casaEditrice
    });
  dialogRef.afterClosed().subscribe(result => {
    
    if (!result) return;
    
    if (result.action === 'delete') {
      this.caseEditriciServices.delete(result.id).subscribe({
        next: (res: any) => this.showMsg(res.msg, false),
        error: (err) => this.showMsg(err.error?.msg, true),
        complete: () => this.loadData()
      });
    }

    if (result.action === 'save') {
      this.caseEditriciServices.update({
        id: casaEditrice.id,
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

  window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  reset() {
    this.form.reset();
    this.casaEditriceInModifica = null;
  }

  onFilterChange() {
    this.loadData();
  }

  resetFilters() {
    this.filters = {
      nome: '',
      descrizione: '',
      email: '',
      indirizzo: ''
    };
    this.loadData();
  }

  showMsg(msg: string, isError: boolean) {
    this.snack.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}