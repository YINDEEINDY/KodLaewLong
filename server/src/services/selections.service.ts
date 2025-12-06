import { selectionsRepository, type ISelectionsRepository } from '../data/selections.repository.js';
import type { UserSelection } from '../db/schema.js';

export class SelectionsService {
  constructor(private repository: ISelectionsRepository = selectionsRepository) {}

  async getUserSelections(userId: string): Promise<string[]> {
    const selections = await this.repository.getByUserId(userId);
    return selections.map((s: UserSelection) => s.appId);
  }

  async saveUserSelections(userId: string, appIds: string[]): Promise<void> {
    // Validate appIds - should be non-empty strings
    const validAppIds = appIds.filter((id) => typeof id === 'string' && id.trim().length > 0);
    await this.repository.saveSelections(userId, validAppIds);
  }

  async addSelection(userId: string, appId: string): Promise<void> {
    if (!appId || typeof appId !== 'string' || appId.trim().length === 0) {
      throw new Error('Invalid app ID');
    }
    await this.repository.addSelection(userId, appId.trim());
  }

  async removeSelection(userId: string, appId: string): Promise<void> {
    if (!appId || typeof appId !== 'string' || appId.trim().length === 0) {
      throw new Error('Invalid app ID');
    }
    await this.repository.removeSelection(userId, appId.trim());
  }

  async clearSelections(userId: string): Promise<void> {
    await this.repository.clearSelections(userId);
  }
}

export const selectionsService = new SelectionsService();
