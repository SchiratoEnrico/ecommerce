import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Manga } from '../../../models/manga';
import { MangaFilters, MangaServices } from '../../../services/manga-services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { Saga } from '../../../models/saga';
import { Autore } from '../../../models/autore';
import { Genere } from '../../../models/genere';
import { CasaEditrice } from '../../../models/casa-editrice';
import { SagheServices } from '../../../services/saghe-services';
import { CaseEditriciServices } from '../../../services/case-editrici-services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MangaDialog } from '../dialogs/manga-dialog/manga-dialog';
import { error } from 'console';
import { AutoriServices } from '../../../services/autori-services';
import { GeneriServices } from '../../../services/generi-services';
import { ImageServices } from '../../../services/image-services';
import { GestioneCarrelloServices } from '../../../services/gestione-carrello-services';

@Component({
  selector: 'app-gestione-manga',
  standalone: false,
  templateUrl: './gestione-manga.html',
  styleUrl: './gestione-manga.css',
})
export class GestioneManga implements OnInit, AfterViewInit, OnDestroy {
  //@ViewChild(MatPaginator) paginator!: MatPaginator;
  //@ViewChild(MatSort) sort!: MatSort;
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();
  // -> ha $ in fondo ma è solo community convention (popularised by ReactiveX/RxJS)
  // indica che variabile è Observable o Subject
  private filterChanges = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['immagine', 'titolo', 'prezzo', 'dataPubblicazione', 'numeroCopie', 'azioni'];
  dataSource = new MatTableDataSource<Manga>();
  form!: FormGroup;
  loading = false;
  loadingOptions = false;
  MangaInModifica: Manga | null = null;

  saghe: Saga[] = [];
  autori: Autore[] = [];
  generi: Genere[] = [];
  caseEditrici: CasaEditrice[] = [];

  // NW attualmente filter saranno da riunire direttamente a id
  filters: MangaFilters = {
    titolo: '',
    sagaId: null,
    casaEditriceId: null,
    autoreId: null,
    generiId: [],
  };

  constructor(
    private mangaServices: MangaServices,
    private sagheServices: SagheServices,
    private autoriServices: AutoriServices,
    private generiServices: GeneriServices,
    private caseEditriciServices: CaseEditriciServices,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private imageService: ImageServices,
    private carrelloService: GestioneCarrelloServices
  ) {}

  ngOnInit(): void {
    // questo per caricare i filtri impostati quando redirect da altre pagine
    const sagaIdParam = this.route.snapshot.queryParamMap.get('sagaId');
    if (sagaIdParam) {
      this.filters.sagaId = Number(sagaIdParam);
    }

    const autoreIdParam = this.route.snapshot.queryParamMap.get('autoreId');
    if (autoreIdParam) {
      this.filters.autoreId = Number(autoreIdParam);
    }
    const generiParams = this.route.snapshot.queryParamMap.getAll('generiId');
    if (generiParams && generiParams.length > 0) {
      // Convertiamo l'array di stringhe in un array di numeri
      this.filters.generiId = generiParams.map((id) => Number(id));
    }

    // carica risultato con filtri
    this.filterChanges
      // pperchè settato a 400?
      .pipe(debounceTime(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData());
  }

  ngAfterViewInit(): void {
    //this.dataSource.paginator = this.paginator;
    //this.dataSource.sort = this.sort;
    // devo caricare opzioni per filtri e dati:
    setTimeout(() => {
      this.loadOptions();
      this.loadData();
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    // clean up del comp
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadOptions(): void {
    // qui carico liste di valori default
    this.loadingOptions = true;
    // forkjoin perchè così arriva tutto insieme
    forkJoin({
      saghe: this.sagheServices.listSaghe(),
      autori: this.autoriServices.list(),
      generi: this.generiServices.list(),
      caseEditrici: this.caseEditriciServices.listCaseEditrici(),
    })
      .pipe(takeUntil(this.destroy$))
      // per chiudere i vari subscribe fatti quando componente destroyed
      .subscribe({
        next: ({ saghe, autori, generi, caseEditrici }) => {
          this.saghe = saghe;
          this.autori = autori;
          this.generi = generi;
          this.caseEditrici = caseEditrici;
          this.loadingOptions = false;
          // dice ad Angular di 'ricaricare' i dati
          this.cdr.markForCheck();
        },
        error: () => {
          this.loadingOptions = false;
          this.showMsg('Errore caricamento opzioni', true);
          this.cdr.markForCheck();
        },
      });
  }

  loadData(): void {
    console.log('loading Manga' + this.dataSource.data);
    this.loading = true;

    const activeFilters: MangaFilters = {
      titolo: this.filters.titolo || undefined,
      sagaId: this.filters.sagaId ?? undefined,
      casaEditriceId: this.filters.casaEditriceId ?? undefined,
      autoreId: this.filters.autoreId ?? undefined,
      generiId: this.filters.generiId ?? undefined,
    };

    this.mangaServices.listManga(activeFilters).subscribe({
      next: (data) => {
        //this.showMsg('Dati caricati' + data, false);
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.showMsg('Errore caricamento dati', true);
        this.loading = false;
      },
    });
  }

  showMsg(msg: string = '', isError: boolean): void {
    this.snack.open(msg, 'OK', {
      duration: 2000,
      panelClass: isError ? 'snack-error' : 'snack-success',
    });
  }

  onFilterChange(): void {
    this.filterChanges.next();
  }

  resetFilters() {
    this.filters = {
      titolo: '',
      sagaId: null,
      casaEditriceId: null,
      autoreId: null,
      generiId: [],
    };
    this.loadData();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MangaDialog, {
      width: '500px',
      data: {
        manga: null, // null = create(=> @if(manga) false)
        saghe: this.saghe,
        autori: this.autori,
        generi: this.generi,
        caseEditrici: this.caseEditrici,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result || result.action !== 'save') return;
        this.mangaServices
          .create(result)
          .pipe(
            switchMap(resp => {
              if (result.selectedFile) {
                return this.imageService.upload(result.selectedFile, result.isbn);
              }
              return of(resp);
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (res: any) => {
              this.showMsg(res.msg, false);
              this.loadData();
            },
            error: (err) => this.showMsg(err.error?.msg ?? 'Errore di creazione', true),
          });
      });
  }

  openEditDialog(manga: Manga): void {
    console.log(manga);
    this.mangaServices.findMangaByIsbn(manga.isbn)
      .subscribe({
        next: (fullManga) => {
          const dialogRef = this.dialog.open(MangaDialog, {
            width: '500px',
            data: {
              manga: fullManga,
              saghe: this.saghe,
              autori: this.autori,
              generi: this.generi,
              caseEditrici: this.caseEditrici,
            },
            });
          dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (result) => {
                if (!result) return;
              
                if (result.action === 'delete') {
                  this.mangaServices
                    .delete(result.isbn)
                    .pipe(
                      switchMap((res: any) => {
                        if (result.immagine) {
                          // extract filename from full path/url if needed
                          const filename = result.immagine.split('/').pop();
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
                      takeUntilDestroyed(this.destroyRef)
                    )
                    .subscribe({
                      next: (res: any) => {
                        this.showMsg(res.msg, false);
                        this.loadData();
                        this.loadOptions();
                      },
                      error: (err) => {
                        this.showMsg(err.error?.msg ?? 'Errore eliminazione', true);
                      },
                    });
                }
              
                
                if (result.action === 'save') {
                  this.mangaServices
                    .update(result)
                    .pipe(
                      switchMap(resp => {
                          console.log("result.selectedFile: ", result.selectedFile);
                          if (result.selectedFile) {
                            console.log("will call upload imageservices");

                            return this.imageService.upload(result.selectedFile, result.isbn);
                          }
                          return of(resp);
                        }),
                      takeUntil(this.destroy$))
                    .subscribe({
                      next: (resp) => {
                        this.showMsg(resp.msg, false);
                        this.loadData();
                      },
                      error: (err) => {
                        this.showMsg(err.error?.msg ?? 'Errore Upate', true);
                      },
                    });
                }
              },
              error: (err) => {
                this.showMsg(err.error?.msg ?? 'Errore Upate', true);
              },
            });
        },
        error: (err) => {
                  this.showMsg(err.error?.msg ?? 'Errore caricamento manga by id', true);
                }
      });

   
  }

  addToCart(manga: Manga): void {
    this.carrelloService.addRow(manga).subscribe({
      next: () => {
        this.carrelloService.aggiornaDatiCarrello();
        this.showMsg('Aggiunto al carrello', false);
      },
      error: (err) => {
        this.showMsg(err.error?.msg ?? 'Errore aggiunta al carrello', true);
      }
    });
  }
}
