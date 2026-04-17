import { Pipe, PipeTransform } from '@angular/core';

interface StatoBadge {
  cssClass: string;
  label: string;
}

@Pipe({
  name: 'statoBadge',
  standalone: false,
})
export class StatoBadgeClassPipe implements PipeTransform {
  // mapping stato fattura -> classe badge
  private readonly map: Record<string, StatoBadge> = {
    CONFERMATO: {cssClass: 'stato-chip stato-chip--confermato', label: 'Confermato'},
    CONSEGNATO: {cssClass: 'stato-chip stato-chip--consegnato', label: 'Consegnato'},
    CREATO: {cssClass: 'stato-chip stato-chip--creato', label: 'Creato'},
    PAGATO: {cssClass: 'stato-chip stato-chip--pagato', label: 'Pagato'},
    RICHIESTA_RESO: {cssClass: 'stato-chip stato-chip--richiesta_reso', label: 'Reso richiesto'},
    LAVORAZIONE: {cssClass: 'stato-chip stato-chip--lavorazione', label: 'In lavorazione'} ,
    SPEDITO: {cssClass: 'stato-chip stato-chip--spedito', label: 'Spedito'},
    RIMBORSATO: {cssClass: 'stato-chip stato-chip--rimborsato', label: 'Rimborsato'},
    RESTITUITO: {cssClass: 'stato-chip stato-chip--restituito', label: 'Restituito'},
    RIFIUTATO: {cssClass: 'stato-chip stato-chip--rifiutato', label: 'Reso rifiutato'},
    ANNULLATA: {cssClass: 'stato-chip stato-chip--annullata', label: 'Ordine cancellato'},
    CANCELLATO: {cssClass: 'stato-chip stato-chip--annullata', label: 'Ordine cancellato'},
  }

  private readonly fallback: StatoBadge = { cssClass: 'stato-chip stato-chip--annullata', label: 'Sconosciuto' };

  transform(stato: string): StatoBadge {
    return this.map[stato] ?? this.fallback;
  }
}
