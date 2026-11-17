-- =============================================================
--  CodeGarage Bank - Schéma de la base de données
--  Exécuté automatiquement au premier démarrage du conteneur MySQL
--  (fichiers de /docker-entrypoint-initdb.d exécutés par ordre alphabétique)
-- =============================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS bank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bank;

-- -------------------------------------------------------------
--  Utilisateurs (clients de la banque)
-- -------------------------------------------------------------
CREATE TABLE users (
  id                    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email                 VARCHAR(255)  NOT NULL,
  password_hash         VARCHAR(255)  NOT NULL,
  first_name            VARCHAR(100)  NOT NULL,
  last_name             VARCHAR(100)  NOT NULL,
  daily_transfer_limit  DECIMAL(12,2) NOT NULL DEFAULT 1000.00,
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
--  Comptes bancaires
--  type : 'checking' = compte courant, 'savings' = livret d'épargne
-- -------------------------------------------------------------
CREATE TABLE accounts (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED  NOT NULL,
  iban             VARCHAR(34)   NOT NULL,
  type             ENUM('checking', 'savings') NOT NULL,
  name             VARCHAR(100)  NOT NULL,
  balance          FLOAT         NOT NULL DEFAULT 0,
  overdraft_limit  DECIMAL(12,2) NOT NULL DEFAULT 200.00,
  status           ENUM('active', 'closed') NOT NULL DEFAULT 'active',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at        DATETIME      NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_accounts_iban (iban),
  INDEX idx_accounts_user (user_id),
  CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
--  Opérations (une ligne par mouvement sur un compte)
--  Un virement produit 2 lignes : 'transfer_out' sur le compte émetteur,
--  'transfer_in' sur le compte destinataire (+ une ligne 'fee' si frais).
--  amount est toujours positif, le sens est donné par type.
-- -------------------------------------------------------------
CREATE TABLE transactions (
  id                       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id               INT UNSIGNED    NOT NULL,
  type                     ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'fee') NOT NULL,
  amount                   DECIMAL(12,2)   NOT NULL,
  label                    VARCHAR(140)    NULL,
  counterparty_account_id  INT UNSIGNED    NULL,
  created_at               DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_transactions_account_date (account_id, created_at),
  CONSTRAINT chk_transactions_amount CHECK (amount >= 0),
  CONSTRAINT fk_transactions_account
    FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_counterparty
    FOREIGN KEY (counterparty_account_id) REFERENCES accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
--  Synthèse mensuelle des opérations par compte
-- -------------------------------------------------------------
CREATE VIEW v_monthly_summary AS
SELECT
  account_id,
  MAX(YEAR(created_at)) AS year,
  MONTH(created_at)     AS month,
  SUM(CASE WHEN type IN ('deposit', 'transfer_in') THEN amount ELSE 0 END)              AS total_in,
  SUM(CASE WHEN type IN ('withdrawal', 'transfer_out', 'fee') THEN amount ELSE 0 END)   AS total_out,
  COUNT(*)              AS operations
FROM transactions
GROUP BY account_id, MONTH(created_at);
