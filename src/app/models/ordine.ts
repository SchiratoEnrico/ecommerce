import { Account } from "./account";
import { Pagamento } from "./pagamento";
import { RigaOrdine } from "./riga-ordine";
import { Spedizione } from "./spedizione";
import { StatoOrdine } from "./stato-ordine";

export interface Ordine {
    id: number;
    account: Account;
    pagamento: Pagamento;
    spedizione: Spedizione;
    anno: number;
    mese: number;
    giorno: number;
    stato: StatoOrdine;
    righeOrdine: RigaOrdine[];
}
