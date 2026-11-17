import bcrypt from 'bcryptjs';
import { generateIban } from '../domain/iban';
import { PublicUser, toPublicUser, User } from '../domain/models';
import { normalizeEmail, requireName, validatePassword } from '../domain/validation';
import { HttpError } from '../errors';
import { signToken } from '../http/auth';
import { AccountRepository, UserRepository } from '../repositories';

export interface SignupInput {
  email: unknown;
  password: unknown;
  firstName: unknown;
  lastName: unknown;
}

export interface AuthResult {
  token: string;
  user: PublicUser | User;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly accounts: AccountRepository,
  ) {}

  async signup(input: SignupInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const password = validatePassword(input.password);
    const firstName = requireName(input.firstName, 'prénom');
    const lastName = requireName(input.lastName, 'nom');

    if (await this.users.findByEmail(email)) {
      throw new HttpError(409, 'Un compte existe déjà avec cet email');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await this.users.create({ email, passwordHash, firstName, lastName });
    await this.accounts.create({ userId, iban: generateIban(), type: 'checking', name: 'Compte courant' });

    const user = await this.users.findById(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable après sa création');
    }
    return { token: signToken(userId), user };
  }

  async login(rawEmail: unknown, rawPassword: unknown): Promise<AuthResult> {
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    const password = typeof rawPassword === 'string' ? rawPassword : '';

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new HttpError(401, 'Aucun compte associé à cet email');
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Mot de passe incorrect');
    }
    return { token: signToken(user.id), user: toPublicUser(user) };
  }
}
