export interface Account {
    id: number,
    username: string,
    email: string,
    ruolo: string,
    id_carrello: number,
    anagrafica:{},
    password?: string;
}
