# CodeGarage Bank — Spécifications fonctionnelles

Ce document est **la référence** du comportement attendu de l'application.
Tout écart entre ce document et le comportement réel de l'application est un **bug**.

> Les règles sont numérotées (ex. `CPT-03`) pour que vous puissiez y faire référence dans vos tests et vos rapports de bugs.

---

## 1. Inscription et authentification

| Réf.     | Règle |
|----------|-------|
| AUTH-01  | Un visiteur peut s'inscrire avec : prénom, nom, email, mot de passe et confirmation du mot de passe. |
| AUTH-02  | L'email doit être valide. Il est enregistré en minuscules, sans espaces autour. |
| AUTH-03  | Un email ne peut être associé qu'à **un seul** client, y compris si deux inscriptions arrivent en même temps. |
| AUTH-04  | Le mot de passe doit contenir **au moins 8 caractères**, dont au moins une lettre et au moins un chiffre. |
| AUTH-05  | Le formulaire d'inscription refuse l'envoi si la confirmation est différente du mot de passe. |
| AUTH-06  | À l'inscription, un **compte courant** nommé « Compte courant » est automatiquement ouvert. |
| AUTH-07  | Aucune réponse de l'API ne doit jamais contenir de donnée sensible (mot de passe, hash du mot de passe…). |
| AUTH-08  | En cas d'échec de connexion, le message est **toujours le même** (« Email ou mot de passe incorrect »), que l'email existe ou non, afin de ne pas révéler quels emails sont clients. |
| AUTH-09  | Une session dure 2 heures. |
| AUTH-10  | La déconnexion supprime la session du navigateur : après déconnexion puis rechargement de la page, l'utilisateur n'est plus connecté. |
| AUTH-11  | Toutes les pages autres que `/login` et `/signup` sont réservées aux utilisateurs connectés. Un visiteur non connecté est redirigé vers `/login`. |

## 2. Comptes bancaires

| Réf.    | Règle |
|---------|-------|
| CPT-01  | Deux types de comptes : **compte courant** (`checking`) et **livret d'épargne** (`savings`). |
| CPT-02  | Un client peut avoir au maximum **5 comptes actifs** simultanément. |
| CPT-03  | Chaque compte possède un IBAN français unique et valide. |
| CPT-04  | Découvert autorisé : **200 €** pour un compte courant, **0 €** pour un livret (un livret ne peut jamais être négatif). |
| CPT-05  | Un compte ne peut être clôturé que si son solde est **exactement 0,00 €**. |
| CPT-06  | Un compte clôturé ne peut plus ni émettre ni **recevoir** d'opération. Il reste visible (grisé) avec son historique. |
| CPT-07  | Un client ne peut voir **que ses propres comptes** et leurs opérations. |
| CPT-08  | Les soldes sont exacts au centime, quel que soit le montant (jusqu'à 999 999 999,99 €). Le solde d'un compte est toujours égal à la somme de ses opérations. |

## 3. Dépôts et retraits

| Réf.    | Règle |
|---------|-------|
| OPE-01  | Tout montant est **strictement positif** et comporte au plus 2 décimales. Un montant nul est refusé. |
| OPE-02  | Un dépôt est limité à 10 000 € par opération. |
| OPE-03  | Un retrait est refusé s'il ferait passer le solde sous le découvert autorisé. |
| OPE-04  | Dans l'interface, les montants peuvent être saisis au format français (`12,50`) ou anglais (`12.50`) : les deux signifient douze euros cinquante. |

## 4. Virements

| Réf.    | Règle |
|---------|-------|
| VIR-01  | Un virement part d'un compte **actif** appartenant au client connecté, vers un compte **actif** identifié par son IBAN (le client lui-même ou un autre client). |
| VIR-02  | Le compte destinataire doit être **différent** du compte source. |
| VIR-03  | Un livret ne peut alimenter **que les comptes de son propriétaire**. |
| VIR-04  | Frais : les virements entre comptes d'un même client sont gratuits. Les virements vers un autre client coûtent **0,5 % du montant, arrondi au centime supérieur, plafonné à 5 €**. Les frais sont débités du compte source, en plus du montant, sous forme d'une opération « Frais ». |
| VIR-05  | Un virement est refusé si le solde du compte source, **après déduction du montant et des frais**, passerait sous le découvert autorisé. |
| VIR-06  | Plafond : la somme des virements vers d'autres clients sur les **24 dernières heures glissantes**, **virement en cours inclus**, ne peut pas dépasser le plafond du client (1 000 € par défaut). Les virements entre ses propres comptes ne comptent pas. |
| VIR-07  | Un virement est **atomique** : soit tout est enregistré (débit, crédit, frais), soit rien. Même si plusieurs virements sont envoyés **simultanément**, aucun solde ne peut devenir incohérent ni dépasser le découvert autorisé, et aucune opération ne peut être perdue. |
| VIR-08  | Dans l'interface, un clic sur « Envoyer le virement » produit **un seul** virement, même en cas de double clic. |
| VIR-09  | Après un virement, tous les soldes affichés dans l'application (tableau de bord, liste des comptes du formulaire…) sont à jour, sans recharger la page. |

## 5. Historique des opérations

| Réf.    | Règle |
|---------|-------|
| HIS-01  | L'historique d'un compte est paginé par **20 opérations**. La page 1 contient les 20 premières opérations selon le tri choisi ; aucune opération n'apparaît sur deux pages ni n'est omise. |
| HIS-02  | Tri possible par date ou par montant, croissant ou décroissant. Par défaut : les plus récentes d'abord. Tout autre critère de tri est refusé (400). |
| HIS-03  | La recherche filtre les opérations de la page par libellé et surligne le texte trouvé. |
| HIS-04  | Les libellés sont du **texte brut** : ils ne doivent jamais être interprétés comme du HTML. |
| HIS-05  | Les dates sont affichées au format `JJ/MM/AAAA HH:mm`, dans le fuseau horaire du navigateur. |
| HIS-06  | L'historique d'un client ne peut pas être modifié par les actions d'un autre client (y compris la suppression de son profil). |

## 6. Synthèse mensuelle

| Réf.    | Règle |
|---------|-------|
| SYN-01  | La page d'un compte affiche, pour chacun des 12 derniers mois ayant des opérations, le total des entrées, le total des sorties et le nombre d'opérations. |
| SYN-02  | Un mois est identifié par son **mois et son année** : novembre 2025 et novembre 2026 sont deux lignes distinctes. |

## 7. Livret d'épargne

| Réf.    | Règle |
|---------|-------|
| LIV-01  | Taux annuel : **3 %**. Les intérêts sont capitalisés **chaque mois** (taux mensuel = 3 % / 12). |
| LIV-02  | La page d'un livret affiche les intérêts estimés sur **12 mois** à solde constant, arrondis au centime. Exemple : 1 000 € → 30,42 €. |

## 8. Affichage

| Réf.    | Règle |
|---------|-------|
| AFF-01  | Les montants sont affichés au format français avec 2 décimales et le symbole € : `1 234,56 €`. Un montant négatif est affiché avec son signe : `-150,00 €`. |
| AFF-02  | Le solde total du tableau de bord est la somme des soldes des comptes actifs. |

## 9. Profil

| Réf.    | Règle |
|---------|-------|
| PRO-01  | Un client peut supprimer son profil uniquement si tous ses comptes sont clôturés. |
| PRO-02  | La suppression efface les données du client, mais **ne doit rien supprimer dans l'historique des autres clients** : leurs opérations restent présentes (la contrepartie est simplement anonymisée). |

---

## Annexe — API REST

Toutes les routes sont préfixées par `/api`. Les routes marquées 🔒 exigent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Description |
|---------|-------|-------------|
| GET     | `/health` | État de l'API |
| POST    | `/auth/signup` | Inscription `{ firstName, lastName, email, password }` → `{ token, user }` |
| POST    | `/auth/login` | Connexion `{ email, password }` → `{ token, user }` |
| GET 🔒  | `/me` | Profil du client connecté |
| DELETE 🔒 | `/me` | Suppression du profil |
| GET 🔒  | `/accounts` | Liste des comptes du client |
| POST 🔒 | `/accounts` | Ouverture `{ type: 'checking' \| 'savings', name }` |
| GET 🔒  | `/accounts/:id` | Détail d'un compte (+ `projectedInterest12Months` pour un livret) |
| DELETE 🔒 | `/accounts/:id` | Clôture d'un compte |
| POST 🔒 | `/accounts/:id/deposit` | Dépôt `{ amount, label? }` |
| POST 🔒 | `/accounts/:id/withdraw` | Retrait `{ amount, label? }` |
| GET 🔒  | `/accounts/:id/transactions?page=1&limit=20&sort=created_at\|amount&order=asc\|desc` | Historique paginé `{ page, limit, total, hasMore, items }` |
| GET 🔒  | `/accounts/:id/summary` | Synthèse mensuelle |
| POST 🔒 | `/transfers` | Virement `{ fromAccountId, toIban, amount, label? }` → `{ amount, fee, fromAccountId, toIban, balanceAfter }` |

Codes d'erreur : `400` donnée invalide, `401` non authentifié, `403` interdit, `404` introuvable, `409` conflit d'état, `422` règle métier non respectée (solde, plafond…). Le corps d'une erreur est `{ "error": "message" }`.
