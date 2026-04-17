import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthServices } from '../../auth/auth-services';
import { MangaServices } from '../../services/manga-services';
import { FattureServices } from '../../services/fatture-services';
import { Fattura } from '../../models/fattura';
import { RigaFattura } from '../../models/riga-fattura';
import { Manga } from '../../models/manga';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatoOrdine } from '../../models/stato-ordine';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

interface OrdineView {
  fattura: Fattura;
  cancellabile: boolean;
  restituibile: boolean;
}

@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.html',
  styleUrl: './ordini.css',
})
export class Ordini implements OnInit{
  private fattureService = inject(FattureServices);
  private auth = inject(AuthServices);
  private mangaService = inject(MangaServices);

  constructor(
    private snack: MatSnackBar,
  ){}

  ordiniRecenti = signal<OrdineView[]>([]);
  ordiniPassati = signal<OrdineView[]>([]);
  isLoading = signal<boolean>(true);
  mangaCache = signal<Record<string, Manga>>({});
  //map = { [id: string] : any}{};

  ngOnInit(): void {
    this.caricaStoricoAcquisti();
  }

  caricaStoricoAcquisti(){
    const user = this.auth.currentUser();
    if(!user?.id){
      this.isLoading.set(false);
      return;
    }


    this.fattureService.findByAccountId(user.id)
    .pipe(switchMap((data: Fattura[]): Observable<OrdineView[]> => {
      if (data.length === 0) return of([]);

      const viste: Observable<OrdineView>[] = data.map((f: Fattura) =>
        this.fattureService.getNextAllowedStates(f.id).pipe(
          tap((stati: StatoOrdine[]) => console.log(`Stati per fattura ${f.id} con stato ${f.statoFattura}:`, stati)),
          map((stati: StatoOrdine[]): OrdineView => ({
            fattura: f,
            cancellabile: stati.some(s => s.statoOrdine === 'CANCELLATO'),
            restituibile: stati.some(s => s.statoOrdine === 'RICHIESTA_RESO')
          })),
          catchError((): Observable<OrdineView> =>
            of({ fattura: f, cancellabile: false, restituibile: false })
          )
        )
      );
      return forkJoin(viste);
    }))
    .subscribe({
      next: (data: OrdineView[]) => {

        // definisco funzione sorting
        const perDataDesc = (o1: OrdineView, o2: OrdineView): number =>
          new Date(o2.fattura.dataEmissione).getTime() - new Date(o1.fattura.dataEmissione).getTime();

        const recenti: OrdineView[] = [];
        const passati: OrdineView[] = [];

        // così itero una volta sola
        for (const o of data) {
          (o.fattura.statoFattura === "CONFERMATO" ? passati : recenti).push(o);
        }

        recenti.sort(perDataDesc);
        passati.sort(perDataDesc);

        this.ordiniRecenti.set(recenti);
        this.ordiniPassati.set(passati);
        this.isLoading.set(false);

        const isbns = new Set<string>();
        const cache = this.mangaCache();
        const raccogliIsbn = (oL: OrdineView[]): void => {
          oL
            //
            .filter((ord: OrdineView) => (ord.fattura.ordineId !== null))
            .forEach((ord: OrdineView) => {
              ord.fattura.righeFattura?.forEach(
                (riga: RigaFattura) => {
                  if (riga.isbn && !cache[riga.isbn]) {
                    isbns.add(riga.isbn);
                  }
            });
          });
        };

        raccogliIsbn(recenti);
        raccogliIsbn(passati);

        this.caricaDettagliManga(Array.from(isbns));
      },
      error: (err: any) => {
        console.error('Errore', err);
        this.isLoading.set(false);
      }
    });
  }

  caricaDettagliManga(isbns: string[]){
    if(isbns.length === 0){
      this.isLoading.set(false);
      return;
    }

  this.mangaService
  .listAllByIsbns(isbns)
  .subscribe({
    next: (risultati: (Manga | null)[]) => {
      this.mangaCache.update((current: { [isbn: string]: Manga }) => {
        const updated: { [isbn: string]: Manga } = { ...current };
        risultati.forEach((manga: Manga | null, index: number) => {
          if (manga) {
            updated[isbns[index]] = manga;
          }
        });
        return updated;
      });
      this.isLoading.set(false);
    },
    error: (err: any) => {
      this.showMsg(err.error?.msg ?? 'Errore caricamento ISBN', true);
      this.isLoading.set(false);
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

  cancellaOrdine(idFattura: number) {
    const id = this.auth.currentUser()!.id;
    console.log('richiesta eliminazione fattura con id: ' + idFattura + ' account: ' + id )
    this.fattureService.annullaPagata(idFattura, id).subscribe({
      next: () => {
        this.caricaStoricoAcquisti()
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.showMsg(err.error?.msg ?? 'Errore caricamento ISBN', true);
        this.isLoading.set(false);
      }
    });
  }

  richiediReso(idFattura: number) {
    const id = this.auth.currentUser()!.id;
    console.log('richiesta reso fattura con id: ' + idFattura + ' account: ' + id )
    this.fattureService.iniziaReso(idFattura, id).subscribe({
      next: () => {
        this.caricaStoricoAcquisti()
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.showMsg(err.error?.msg ?? 'Errore caricamento ISBN', true);
        this.isLoading.set(false);
      }
    });
  }


}