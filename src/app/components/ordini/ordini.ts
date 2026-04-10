import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrdiniServices } from '../../services/ordini-services';
import { AuthServices } from '../../auth/auth-services';
import { MangaServices } from '../../services/manga-services';
import { catchError, forkJoin, of } from 'rxjs';
import { FattureServices } from '../../services/fatture-services';

@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.html',
  styleUrl: './ordini.css',
})
export class Ordini implements OnInit{
  ordiniRecenti: any[] = [];
  ordiniPassati: any[] = [];
  isLoading: boolean = true;
  mangaCache: { [isbn: string]: any } = {};

  constructor(
    private fattureService: FattureServices,
    private auth: AuthServices,
    private mangaService: MangaServices,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.caricaStoricoAcquisti();
  }

  caricaStoricoAcquisti(){
    const user = this.auth.currentUser();
    if(!user?.id){
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.fattureService.findByAccountId(user.id).subscribe({
      next: (data: any[]) => {
        const oggi = new Date();
        const limite30Giorni = 30*24*60*60*1000;

        // USA f.dataEmissione
        this.ordiniRecenti = data.filter(f => (oggi.getTime() - new Date(f.dataEmissione).getTime()) < limite30Giorni);
        this.ordiniPassati = data.filter(f => (oggi.getTime() - new Date(f.dataEmissione).getTime()) >= limite30Giorni);

        // ORDINAMENTO per dataEmissione
        this.ordiniRecenti.sort((a,b) => new Date(b.dataEmissione).getTime() - new Date(a.dataEmissione).getTime());
        this.ordiniPassati.sort((a,b) => new Date(b.dataEmissione).getTime() - new Date(a.dataEmissione).getTime());

        this.isLoading = false;
        this.cdr.detectChanges();

        const isbns = new Set<string>();
        
        // USA f.righeFattura e assumo che dentro RigaFatturaDTO la variabile per l'ISBN si chiami 'isbn' o 'manga'
        this.ordiniRecenti.forEach(fattura => {
          fattura.righeFattura?.forEach((riga: any) => {
            const isbnManga = riga.isbn || riga.manga; // fallback in base a come si chiama in RigaFatturaDTO
            if(isbnManga && !this.mangaCache[isbnManga]){
              isbns.add(isbnManga);
            }
          });
        });
        this.ordiniPassati.forEach(fattura => {
          fattura.righeFattura?.forEach((riga: any) => {
             const isbnManga = riga.isbn || riga.manga;
             if(isbnManga && !this.mangaCache[isbnManga]){
               isbns.add(isbnManga);
             }
          });
        });

        this.caricaDettagliManga(Array.from(isbns));
      },
      error: (err: any) => {
        console.error('Errore', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  caricaDettagliManga(isbns: string[]){
    if(isbns.length === 0){
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const chiamateHttp = isbns.map(isbn => 
      this.mangaService.findMangaByIsbn(isbn).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(chiamateHttp).subscribe(risultati => {
      risultati.forEach((manga, index) => {
        if (manga) {
          const isbnCorrispondente = isbns[index];
          this.mangaCache[isbnCorrispondente] = manga;
        }
      });
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }
}