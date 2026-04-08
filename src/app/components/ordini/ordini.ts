import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrdiniServices } from '../../services/ordini-services';
import { AuthServices } from '../../auth/auth-services';
import { MangaServices } from '../../services/manga-services';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.html',
  styleUrl: './ordini.css',
})
export class Ordini implements OnInit{
  
  ordini: any[] = [];
  isLoading: boolean = true;

  mangaCache: { [isbn: string]: any } = {};

  constructor(
    private ordiniService: OrdiniServices,
    private auth: AuthServices,
    private mangaService: MangaServices,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.caricaOrdini();
  }

  caricaOrdini(){
    const user = this.auth.currentUser();
    if(!user || !user.id){
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.ordiniService.findByAccountId(user.id).subscribe({
      next: (data) => {
        this.ordini = data;
        this.ordini.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        const isbns = new Set<string>();
        this.ordini.forEach(ordine => {
          ordine.righeOrdine?.forEach((riga: any) => {
            if(riga.manga && !this.mangaCache[riga.manga]){
              isbns.add(riga.manga);
            }
          });
        });

        this.caricaDettagliManga(Array.from(isbns));

        console.log('Ordini caricati', this.ordini);
      },
      error: (err) => {
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