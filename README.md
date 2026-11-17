# 🏦 CodeGarage Bank

Application bancaire **pédagogique** pour s'entraîner à concevoir et mettre en œuvre une **stratégie de tests** :
tests unitaires, tests d'intégration et tests end-to-end avec Playwright.

> ⚠️ Cette application contient **volontairement des bugs**, répartis dans la base de données, l'API et le front-end.
> Votre mission : les trouver grâce à vos tests, les documenter, puis les corriger.

---

## Stack technique

| Couche          | Technologies |
|-----------------|--------------|
| Base de données | MySQL 8.4 (scripts SQL dans [`db/init`](db/init)) |
| API             | Node.js 22, TypeScript, Fastify, `mysql2` ([`api/`](api)) |
| Front-end       | React 18, TypeScript, Vite, React Router ([`web/`](web)) |
| Tests           | Vitest (+ `fastify.inject()` pour l'API), Testing Library, Playwright |
| Infrastructure  | Docker Compose |

## Démarrage rapide

Prérequis : Docker Desktop (ou Docker Engine + Compose) et Node.js 22.

```bash
# 1. Lancer toute l'application (base + API + front)
docker compose up -d --build

# 2. Ouvrir http://localhost:8080
```

| Service      | URL / port |
|--------------|------------|
| Front-end    | http://localhost:8080 |
| API          | http://localhost:3000/api/health |
| MySQL        | `localhost:3306` (utilisateur `bank` / mot de passe `bank`, base `bank`) |
| MySQL (test) | `localhost:3307` (profil `test`, voir plus bas) |

Remettre la base dans son état initial (supprime toutes les données) :

```bash
docker compose down -v && docker compose up -d --build
```

### Comptes de démonstration

Mot de passe pour tous : **`Password123`**

| Client          | Email                  | Comptes |
|-----------------|------------------------|---------|
| Alice Martin    | `alice@example.com`    | Compte courant (3 119,40 €), Livret A (5 000,00 €) |
| Bob Durand      | `bob@example.com`      | Compte courant (440,00 €) |
| Charlie Bernard | `charlie@example.com`  | Compte courant (50,00 €), un ancien compte clôturé |

## Développement sans Docker (optionnel)

La base MySQL doit tourner (`docker compose up -d db`), puis :

```bash
npm run install:all          # installe api/, web/ et e2e/

cd api && npm run dev        # API sur http://localhost:3000
cd web && npm run dev        # Front sur http://localhost:5173 (proxy /api -> :3000)
```

## Structure du projet

```
.
├── db/init/                 # Schéma SQL + jeu de données (exécutés au 1er démarrage de MySQL)
├── api/
│   ├── src/
│   │   ├── domain/          # Modèles + règles métier pures (frais, intérêts, IBAN, validation)
│   │   ├── repositories/    # Accès aux données : le SEUL endroit où se trouve du SQL
│   │   ├── services/        # Logique métier, repositories injectés par le constructeur
│   │   ├── routes/          # Routes Fastify (fines : lecture de la requête -> service -> réponse)
│   │   ├── db/              # Pool mysql2, interface Db, UnitOfWork (transactions SQL)
│   │   ├── http/            # Authentification JWT, gestion des erreurs
│   │   ├── container.ts     # Assemblage repositories -> services
│   │   ├── app.ts           # buildApp({ services? }) -> testable avec app.inject()
│   │   └── server.ts
│   └── tests/
│       ├── unit/            # Tests unitaires (Vitest) : domaine, services avec repositories simulés
│       └── integration/     # Tests d'intégration API + MySQL (Vitest + app.inject())
├── web/
│   └── src/
│       ├── utils/           # Fonctions pures (formatage…) -> tests unitaires
│       ├── pages/ components/ auth/ state/
│       └── **/*.test.tsx    # Tests de composants (Vitest + Testing Library)
├── e2e/                     # Tests end-to-end (Playwright)
├── docker-compose.yml
└── SPECIFICATIONS.md        # 📘 Règles métier : LA référence pour savoir ce qui est un bug
```

## Lancer les tests

Chaque niveau contient **un test d'exemple** : à vous d'écrire le reste.

### Architecture de l'API et testabilité

```
route Fastify  ──>  service  ──>  repository  ──>  MySQL
 (HTTP)            (règles)       (SQL)
```

- Les **services** reçoivent leurs repositories par le constructeur : en test unitaire, remplacez-les par des doublures
  (`vi.fn()`), sans base de données. Voir `api/tests/unit/accountService.test.ts`.
- Les opérations multi-tables passent par une **`UnitOfWork`** (`(work) => Promise`) qui fournit des repositories
  partageant une même transaction SQL. En test unitaire, une fausse implémentation suffit : `(work) => work(fakeRepos)`.
- Les **repositories** se testent en intégration, contre la base de test.
- `buildApp({ services })` permet aussi de tester les routes HTTP avec des services simulés, via `app.inject()`.

### Tests unitaires

```bash
npm run test:api     # api/tests/unit
npm run test:web     # web/src/**/*.test.ts(x)
```

### Tests d'intégration (API + vraie base MySQL)

Une base dédiée aux tests tourne sur le port **3307**. Ses données sont en mémoire : la redémarrer la remet dans l'état initial.

```bash
npm run db:test:up              # démarre la base de test
npm run test:api:integration    # lance api/tests/integration
npm run db:test:reset           # remet la base de test à zéro
```

### Tests end-to-end (Playwright)

```bash
docker compose up -d --build                 # l'application doit tourner
npm --prefix e2e run install:browsers        # une seule fois
npm run test:e2e
npm --prefix e2e run test:ui                 # mode interactif
```

> 💡 Les tests e2e modifient les données. Pensez à une stratégie pour garder des tests indépendants et rejouables
> (données uniques par test, remise à zéro de la base, création des données via l'API…).

---

## 🎯 Votre mission

1. **Lisez [`SPECIFICATIONS.md`](SPECIFICATIONS.md)** : c'est le comportement attendu.
2. **Définissez votre stratégie de tests** : qu'est-ce qui se teste le mieux en unitaire ? en intégration ? en e2e ?
   Justifiez vos choix (pyramide des tests, coût, rapidité, confiance).
3. **Écrivez les tests.** Un bug est « trouvé » quand un test automatisé échoue à cause de lui.
4. **Documentez chaque bug** dans un fichier `BUGS.md` (modèle ci-dessous).
5. **Corrigez les bugs** et vérifiez que vos tests passent au vert.

Des bugs se cachent dans **les trois couches** : base de données, API et front-end.
Certains sont visibles en cliquant dans l'application, d'autres ne se révèlent qu'avec des tests ciblés
(cas limites, concurrence, sécurité…).

### Modèle de rapport de bug

```markdown
## BUG-XX — Titre court et précis

- **Couche** : DB / API / Front
- **Règle enfreinte** : VIR-04
- **Gravité** : Bloquante / Majeure / Mineure — justification
- **Étapes de reproduction** :
  1. …
  2. …
- **Résultat attendu** : …
- **Résultat obtenu** : …
- **Test qui le détecte** : `api/tests/unit/fees.test.ts` › "arrondit les frais au centime supérieur"
- **Cause** : fichier, ligne, explication
- **Correctif** : description / lien vers le commit
```
