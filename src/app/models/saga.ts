import { Manga } from "./manga";

export interface Saga {
    id: number;
    nome: string;
    immagine: string | null;
    descrizione: string;
    manga: Manga[];
}
