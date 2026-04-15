import { Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { MangaServices } from '../../services/manga-services';
import { AuthServices } from '../../auth/auth-services';
import { ActivatedRoute, Router } from '@angular/router';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';
import { forkJoin } from 'rxjs';
import { SagheServices } from '../../services/saghe-services';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  advice = signal<any[]>([]);
  bestSellers = signal<any[]>([]);
  newArrives = signal<any[]>([]);
  risultatiRicerca = signal<any[]>([]);
  searchQuery = signal<string>('');
  searchGenre = signal<string>('');
  searchAuthor = signal<string>('');
  sagheDataSource = new MatTableDataSource<any>();
  @ViewChild('saghePaginator') saghePaginator!: MatPaginator;

  constructor(
    private mangaService: MangaServices,
    private sagheService: SagheServices,
    private auth: AuthServices,
    private router: Router,
    private carrelloService: GestioneCarrelloServices,
    private route: ActivatedRoute,
  ) {}

  isLogged = computed(() => !!this.auth.currentUser());

  goToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.caricaDatiHome(); // Carica arrivi, best sellers e carosello
    this.caricaConsigliati(); // Carica i consigliati per l'utente
    this.caricaSaghe(); 
    this.route.queryParams.subscribe(params => {
      if (params['sagaId']) {
        this.mangaService.listManga({ sagaId: +params['sagaId'] }).subscribe({
          next: (data) => {
            this.risultatiRicerca.set(data);
            setTimeout(() => {
              document.getElementById('risultati')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  // Metodo per i dati "fissi" della pagina
  caricaDatiHome() {
    this.mangaService.getLatestArrives().subscribe({
      next: (arrives) => {
        this.newArrives.set(arrives);
        console.log('Ultimi Arrivi caricati:', arrives);

        this.mangaService.getBestSellers().subscribe({
          next: (best) => {
            if (best && best.length > 0) {
              this.bestSellers.set(best);
            } else {
              this.bestSellers.set(arrives); 
            }
            console.log('Best Sellers caricati:', best);
          },
          error: (err) => {
            console.error('Errore nel caricamento Best Sellers', err);
            this.bestSellers.set(arrives);
          }
        });

        setTimeout(() => {
          const bootstrap = (window as any).bootstrap;
          const carouselElement = document.querySelector('#carouselBanner');
          if(carouselElement && bootstrap) {
            const carousel = new bootstrap.Carousel(carouselElement, {
              interval: 5000,
              wrap: true
            });
            carousel.cycle();
          }
        }, 100);

      },
      error: (err) => console.error('Errore nel caricamento Ultimi Arrivi', err)
    });
  }

  // NUOVO METODO: Gestisce ESCLUSIVAMENTE i consigliati
  caricaConsigliati() {
    const user = this.auth.currentUser();
    if (user) {
      this.mangaService.getAdvices(user.id).subscribe({
        next: (data) => {
          this.advice.set(data);
          console.log('Consigliati caricati/aggiornati:', data);
        },
        error: (err) => {
          this.advice.set([]);
          console.error('Errore nel caricamento Consigliati', err);
        }
      });
    } else {
      this.advice.set([]); 
    }
  }

  addToCart(manga: any) {
    if (!this.isLogged()) {
      this.goToLogin();
      return;
    }
    
    this.carrelloService.addRow(manga).subscribe({
      next: () => {
        this.carrelloService.aggiornaDatiCarrello();
        
        // Invece di ricaricare tutta la home, ricarichiamo SOLO i consigliati!
        this.caricaConsigliati(); 
      },
      error: (err) => {
        console.error('Errore nell\'aggiunta al carrello', err);
        console.warn('Messaggio dal backend:', err.error); 
        
        if (err.status === 401) {
          console.warn('Utente non autenticato, reindirizzamento al login');
          this.goToLogin();
        }
      }
    });
  }
 
  cerca() {
    const query = this.searchQuery().trim();
    if (!query) { this.risultatiRicerca.set([]); return; }

    const titolo$ = this.mangaService.listManga({ titolo: query });
    const autore$ = this.mangaService.listManga({ autoreNome: query });
    const genere$ = this.mangaService.listManga({ sagaNome: query });

    forkJoin([titolo$, autore$, genere$]).subscribe({
      next: ([perTitolo, perAutore, perGenere]) => {
        // Unisce i risultati ed elimina i duplicati tramite id
        const tutti = [...perTitolo, ...perAutore, ...perGenere];
        const unici = tutti.filter(
          (manga, index, self) => index === self.findIndex(m => m.isbn === manga.isbn)
        );
        this.risultatiRicerca.set(unici);
      },
      error: (err) => console.error(err)
    });
    }

  // Aggiorna anche onSearchKeydown se vuoi che Enter funzioni su tutti i campi
  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.cerca();
  }

  caricaSaghe() {
    this.sagheService.listSaghe().subscribe({
      next: (data: any[]) => {
        this.sagheDataSource.data = data;
        // Collega il paginator dopo che i dati sono caricati
        setTimeout(() => {
          this.sagheDataSource.paginator = this.saghePaginator;
        });
      },
      error: (err: any) => console.error('Errore nel caricamento saghe', err)
    });
  }

  goToSaga(saga: any) {
  this.router.navigate(['/home'], { queryParams: { sagaId: saga.id } });
}


 
  
}