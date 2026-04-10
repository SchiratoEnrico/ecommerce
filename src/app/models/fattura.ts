import { RigaFattura } from "./riga-fattura";

export interface Fattura {

     id: number;
  numeroFattura: string;
  dataEmissione: string; 
  // Snapshot cliente
  clienteNome: string;
  clienteCognome: string;
  clienteEmail: string;
  clienteIndirizzo: string;
  clienteCitta: string;
  clienteCap: string;
  clienteProvincia: string;
  clienteStato: string;

  // Pagamento & spedizione
  tipoPagamento: string;
  tipoSpedizione: string;
  
  costoSpedizione: number;
  totale: number;
  note: string;
  statoFattura: string; 
  
  // Relazioni
  ordineId: number | null;
  righeFattura: RigaFattura[];

}
