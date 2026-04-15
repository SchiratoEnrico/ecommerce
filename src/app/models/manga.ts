import { Autore } from "./autore";
import { CasaEditrice } from "./casa-editrice";
import { Genere } from "./genere";
import { Saga } from "./saga";

export interface Manga {
    isbn: string;
	titolo: string;
	dataPubblicazione: string;
	prezzo: number;
	immagine: string;
	numeroCopie: number;
	saga: Saga;
	sagaVol: number;
	casaEditrice: CasaEditrice | null;
	generi: Genere[] | null;
	autori: Autore[] | null;
}
