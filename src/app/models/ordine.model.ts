import { Account } from "./account.model";
import { Pagamenti } from "./pagamenti.model";
import { RigaOrdine } from "./riga-ordine.model";
import { Spedizioni } from "./spedizioni.model";
import { StatoOrdine } from "./stato-ordine.model";

export class Ordine {
    id: number;
    account: Account;
    pagamento: Pagamenti;
    spedizione: Spedizioni;
    data: string;
    stato: StatoOrdine;
    righeOrdine: RigaOrdine[];
}
