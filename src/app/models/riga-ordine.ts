import { Manga } from "./manga";

export interface RigaOrdine {
  id: number;
  idOrdine: number;
  manga: Manga;
  numeroCopie: number;
}
