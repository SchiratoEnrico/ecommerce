import { Component, computed, OnInit, signal } from '@angular/core';
import { MangaServices } from '../../services/manga-services';
import { AuthServices } from '../../auth/auth-services';
import { Router } from '@angular/router';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';

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

  constructor(
    private mangaService: MangaServices,
    private auth: AuthServices,
    private router: Router,
    private carrelloService: GestioneCarrelloServices
  ) {}

  isLogged = computed(() => !!this.auth.currentUser());

  goToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.caricaDatiHome(); // Carica arrivi, best sellers e carosello
    this.caricaConsigliati(); // Carica i consigliati per l'utente
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
}