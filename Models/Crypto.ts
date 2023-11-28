//Crypto.ts
export interface ICrypto {
    _id: string;
    nom: string;
    symbole: string;
    date_creation: string;
    actif: boolean;
    valeur_actuelle: number;
    nom_complet: string;
    nombre_jours: number;
}