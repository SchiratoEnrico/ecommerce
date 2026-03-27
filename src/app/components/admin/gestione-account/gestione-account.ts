import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Account } from '../../../models/account';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AccountServices } from '../../../services/account-services';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountDialog } from '../dialogs/account-dialog/account-dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-gestione-account',
  standalone: false,
  templateUrl: './gestione-account.html',
  styleUrl: './gestione-account.css',
})
export class GestioneAccount {
  displayedColumns = ['id', 'username', 'email', 'ruolo'];
  dataSource = new MatTableDataSource<Account>([]);

  filters = { username: '', email: '' , ruolo: ''};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private accountService: AccountServices,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaAccounts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  caricaAccounts(): void {
    this.accountService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.showSnack('Errore nel caricamento degli accounts', true)
      }
    });
  }

  onFilterChange(): void {

  }

  resetFilters(): void {
    this.filters = { username: '', email: '', ruolo: '' };
    this.dataSource.filter = '';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(AccountDialog, { data: null });
    ref.afterClosed().subscribe(result => {
      if (!result || result.action !== 'save') return;
      this.accountService.create(result).subscribe({
        next: (res: any) => {
          this.showSnack(res.msg, false);
          this.caricaAccounts();
        },
        error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
      });
    });
  }

  edit(account: Account): void {
    const ref = this.dialog.open(AccountDialog, { data: { ...account } });
    ref.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'save') {
        this.accountService.update({ id: account.id, ...result }).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.caricaAccounts();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }

      if (result.action === 'delete') {
        this.accountService.delete(result.id).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.caricaAccounts();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }
    });
  }

  private showSnack(msg: string, isError: boolean): void {
    this.snackBar.open(msg, '✕', {
      duration: 4000,
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }
}
