//Transation.ts
export interface ITransaction {
    _id: string;
    utilisateur_id: string;
    cryptomonnaie_id: string;
    quantite: number;
    date: string;
    type: string;
    prix_unitaire: number;
    total: number;
}

