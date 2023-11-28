// Utilisateur.ts
export interface IUtilisateur {
    _id: string;
    nom: string;
    portefeuille: IPortefeuille[];
}

export interface IPortefeuille {
    _id?: string;
    cryptomonnaie_id: string;
    quantite: number;
    adresses: string[];
}