-- =============================================================
--  CodeGarage Bank - Jeu de données de démonstration
--  Tous les utilisateurs ont le mot de passe : Password123
-- =============================================================

SET NAMES utf8mb4;
USE bank;

INSERT INTO users (id, email, password_hash, first_name, last_name, daily_transfer_limit, created_at) VALUES
  (1, 'alice@example.com',   '$2a$10$qEFW54uYezzPRB6S6X546uNmiQr5F3iZoyYmoy09.18/Y.uM6zZOW', 'Alice',   'Martin',  1000.00, NOW() - INTERVAL 400 DAY),
  (2, 'bob@example.com',     '$2a$10$qEFW54uYezzPRB6S6X546uNmiQr5F3iZoyYmoy09.18/Y.uM6zZOW', 'Bob',     'Durand',  1000.00, NOW() - INTERVAL 400 DAY),
  (3, 'charlie@example.com', '$2a$10$qEFW54uYezzPRB6S6X546uNmiQr5F3iZoyYmoy09.18/Y.uM6zZOW', 'Charlie', 'Bernard',  500.00, NOW() - INTERVAL 450 DAY);

INSERT INTO accounts (id, user_id, iban, type, name, balance, status, created_at, closed_at) VALUES
  (1, 1, 'FR7612345000011428616124159', 'checking', 'Compte courant', 3119.40, 'active', NOW() - INTERVAL 400 DAY, NULL),
  (2, 1, 'FR7612345000013012206052855', 'savings',  'Livret A',       5000.00, 'active', NOW() - INTERVAL 400 DAY, NULL),
  (3, 2, 'FR7612345000012424375194578', 'checking', 'Compte courant',  440.00, 'active', NOW() - INTERVAL 400 DAY, NULL),
  (4, 3, 'FR7612345000015318426257183', 'checking', 'Compte courant',   50.00, 'active', NOW() - INTERVAL 30 DAY,  NULL),
  (5, 3, 'FR7612345000011161220567431', 'checking', 'Ancien compte',     0.00, 'closed', NOW() - INTERVAL 450 DAY, NOW() - INTERVAL 31 DAY);

INSERT INTO transactions (account_id, type, amount, label, counterparty_account_id, created_at) VALUES
  -- Alice - compte courant (solde attendu : 3119.40)
  (1, 'deposit',      2000.00, 'Dépôt initial',            NULL, NOW() - INTERVAL 1 YEAR),
  (1, 'transfer_out',  500.00, 'Épargne',                  2,    NOW() - INTERVAL 1 YEAR + INTERVAL 1 HOUR),
  (1, 'deposit',      1800.00, 'Salaire',                  NULL, NOW() - INTERVAL 40 DAY),
  (1, 'withdrawal',     60.00, 'Retrait DAB',              NULL, NOW() - INTERVAL 20 DAY),
  (1, 'transfer_out',  120.00, 'Remboursement restaurant', 3,    NOW() - INTERVAL 3 DAY),
  (1, 'fee',             0.60, 'Frais de virement',        NULL, NOW() - INTERVAL 3 DAY),

  -- Alice - livret A (solde attendu : 5000.00)
  (2, 'transfer_in',   500.00, 'Épargne',                  1,    NOW() - INTERVAL 1 YEAR + INTERVAL 1 HOUR),
  (2, 'deposit',      4500.00, 'Héritage',                 NULL, NOW() - INTERVAL 200 DAY),

  -- Bob - compte courant (solde attendu : 440.00)
  (3, 'deposit',       300.00, 'Dépôt initial',            NULL, NOW() - INTERVAL 60 DAY),
  (3, 'transfer_in',   100.00, 'Cadeau d''anniversaire',   5,    NOW() - INTERVAL 45 DAY),
  (3, 'transfer_in',   120.00, 'Remboursement restaurant', 1,    NOW() - INTERVAL 3 DAY),
  (3, 'withdrawal',     80.00, 'Retrait DAB',              NULL, NOW() - INTERVAL 1 DAY),

  -- Charlie - compte courant (solde attendu : 50.00)
  (4, 'deposit',        50.00, 'Dépôt initial',            NULL, NOW() - INTERVAL 10 DAY),

  -- Charlie - ancien compte, clôturé (solde attendu : 0.00)
  (5, 'deposit',       100.00, 'Dépôt initial',            NULL, NOW() - INTERVAL 400 DAY),
  (5, 'transfer_out',  100.00, 'Cadeau d''anniversaire',   3,    NOW() - INTERVAL 45 DAY);
