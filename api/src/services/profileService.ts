import { PublicUser, toPublicUser } from '../domain/models';
import { HttpError } from '../errors';
import { AccountRepository, UserRepository } from '../repositories';

export class ProfileService {
  constructor(
    private readonly users: UserRepository,
    private readonly accounts: AccountRepository,
  ) {}

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Utilisateur introuvable');
    }
    return toPublicUser(user);
  }

  async deleteProfile(userId: number): Promise<void> {
    if ((await this.accounts.countActiveByUser(userId)) > 0) {
      throw new HttpError(409, 'Vous devez clôturer tous vos comptes avant de supprimer votre profil');
    }
    await this.users.delete(userId);
  }
}
