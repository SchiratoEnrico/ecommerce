import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Saga } from '../../../models/saga';
import { SagaFilters, SagheServices } from '../../../services/saghe-services';
import { SagaDialog } from '../dialogs/saga-dialog/saga-dialog';
import { catchError, debounceTime, of, Subject, switchMap, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ImageServices } from '../../../services/image-services';
import { AutoriServices } from '../../../services/autori-services';
import { CaseEditriciServices } from '../../../services/case-editrici-services';
import { Autore } from '../../../models/autore';
import { CasaEditrice } from '../../../models/casa-editrice';
import { Genere } from '../../../models/genere';
import { GeneriServices } from '../../../services/generi-services';
import { AuthServices } from '../../../auth/auth-services';

@Component({
  selector: 'app-gestione-saghe',
  standalone: false,
  templateUrl: './gestione-saghe.html',
  styleUrl: './gestione-saghe.css',
})
export class GestioneSaghe implements OnInit, AfterViewInit, OnDestroy {

  private destroyRef    = inject(DestroyRef);
  private destroy$      = new Subject<void>();
  private filterChanges = new Subject<void>();
  private cdr           = inject(ChangeDetectorRef);

  autori: Autore[]  = [];
  case: CasaEditrice[]  = [];
  sagas:   Saga[]  = [];
  generi:   Genere[]  = [];
  loading: boolean = false;
  
  filters: SagaFilters = {
    sagaId:         null,
    casaEditriceId: null,
    autoreId:       null,
    generiId:       []
  };

  constructor(
    private sagheServices: SagheServices,
    private snack:         MatSnackBar,
    private dialog:        MatDialog,
    private router:        Router,
    private autoriS:      AutoriServices,
    private caseS:        CaseEditriciServices,
    private generiS:        GeneriServices,
    private imageService: ImageServices,
    public auth: AuthServices
  ) {}

  ngOnInit(): void {
    this.filterChanges
      .pipe(debounceTime(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadData();
          this.loadAutori();
          this.loadCase();
          this.loadGeneri();
        },
        error: (err) => this.showMsg('Errore caricamento dati', true)
      });
  }
  
  private loadAutori(): void {
    this.autoriS.list().subscribe({
      next: (data) => this.autori = data,
      error: () => this.showMsg('Errore caricamento autori', true)
    });
  }
 
  private loadCase(): void {
    this.caseS.listCaseEditrici().subscribe({
      next: (data) => this.case = data,
      error: () => this.showMsg('Errore caricamento case editrici', true)
    });
  }

  private loadGeneri(): void {
    this.generiS.list().subscribe({
      next: (data) => this.generi = data,
      error: () => this.showMsg('Errore caricamento generi', true)
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadData();
      this.loadAutori();
      this.loadCase();
      this.loadGeneri();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;

    const activeFilters: SagaFilters = {
      sagaId:         this.filters.sagaId         ?? undefined,
      casaEditriceId: this.filters.casaEditriceId ?? undefined,
      autoreId:       this.filters.autoreId       ?? undefined,
      generiId:       this.filters.generiId?.length ? this.filters.generiId : undefined
    };

    this.sagheServices.listSaghe(activeFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.sagas   = data;
          this.loading = false;
          this.cdr.markForCheck();
          
        },
        error: () => {
          this.showMsg('Errore caricamento dati', true);
          this.loading = false;  
          this.cdr.markForCheck();
        }
      });
  }

    goToManga(saga: Saga, event: MouseEvent): void {
    event.stopPropagation(); // altrimenti aptre dialog
    this.router.navigate(['/admin/manga'], {
      queryParams: { sagaId: saga.id }
    });
  }

  onFilterChange(): void {
    this.filterChanges.next();
  }

  resetFilters(): void {
    this.filters = {
      sagaId: null, casaEditriceId: null, autoreId: null, generiId: []
    };
    // BUG FIX (loading bar stays on reset):
    // resetFilters() called loadData() which set loading=true, then the HTTP call
    // completed and set loading=false — but the subscribe was being killed by
    // takeUntil(this.destroy$) completing prematurely in some edge cases,
    // leaving loading stuck at true.
    // The actual cause: takeUntil(this.destroy$) used the SAME Subject for all
    // subscriptions. If destroy$.next() was called (e.g. on route change mid-request)
    // ALL in-flight requests were cancelled and loading was never reset.
    // Solution: each loadData() call creates its own cancellable inner subject,
    // so only the previous request is cancelled when a new one starts (like switchMap).
    this.loadData();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SagaDialog, { width: '400px', data: null });
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result || result.action !== 'save') return;
        this.sagheServices.create(result)
          .pipe(switchMap(resp => {
            if (result.selectedFile && resp.data?.id) {
              return this.imageService.upload(result.selectedFile, undefined, resp.data.id);
            }
            return of(resp);
          }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next:  (res: any) => { this.showMsg(res.msg, false); this.loadData(); },
            error: (err)      => this.showMsg(err.error?.msg ?? 'Errore creazione', true)
          });
      });
  }

  openEditDialog(saga: Saga): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const dialogRef = this.dialog.open(SagaDialog, { width: '400px', data: saga });
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result) return;

        if (result.action === 'delete') {
          console.log("Will delete saga with id: ", result.id);
          this.sagheServices.delete(result.id)
            .pipe(
              switchMap((res: any) => {
                if (result.immagine) {
                  // prendi filename da url
                  const filename = result.immagine.split('/').pop();
                  console.log("Will delete img with filename: ", filename);
                  return this.imageService.deleteImage(filename).pipe(
                    catchError(err => {
                      // manga già eliminato => solo warning
                      console.warn('Immagine non eliminata:', err);
                      return of(res);
                    })
                  );
                }
                return of(res);
              }),
              takeUntil(this.destroy$))
            .subscribe({
              next:  (res: any) => { this.showMsg(res.msg, false); this.loadData(); },
              error: (err)      => this.showMsg(err.error?.msg ?? 'Errore eliminazione', true)
            });
        }

        if (result.action === 'save') {
          this.sagheServices.update({ id: saga.id, ...result })
            .pipe(
              switchMap(resp => {
                if (result.selectedFile) {
                  return this.imageService.upload(result.selectedFile, undefined, saga.id);
                }
                return of(resp);
               }),
              takeUntil(this.destroy$))
            .subscribe({
              next:  (res: any) => { this.showMsg(res.msg, false); this.loadData(); },
              error: (err)      => this.showMsg(err.error?.msg ?? 'Errore aggiornamento', true)
            });
        }
      });
  }

  showMsg(msg: string, isError: boolean): void {
    setTimeout(() => {
      this.snack.open(msg ?? 'Operazione completata', 'OK', {
        duration: 2000,
        panelClass: isError ? 'snack-error' : 'snack-success'
      });
    });
  }
}