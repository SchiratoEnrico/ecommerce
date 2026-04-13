import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mangaImg',
  standalone: false,
})
export class MangaImgPipe implements PipeTransform {
  
  transform(value: string | undefined | null): string {
    // Se non c'è valore, restituiamo l'immagine di default
    if (!value || value.trim() === '') {
      return 'http://localhost:9090/uploads/default.jpg';
    }

    // Se il backend ci manda già l'URL completo
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Nel caso in cui arrivasse solo il nome del file (es. "cover.png")
    return `http://localhost:9090/uploads/${value}`;
  }

}
