import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userSelections, type UserSelection, type NewUserSelection } from '../db/schema.js';

export interface ISelectionsRepository {
  getByUserId(userId: string): Promise<UserSelection[]>;
  saveSelections(userId: string, appIds: string[]): Promise<void>;
  addSelection(userId: string, appId: string): Promise<void>;
  removeSelection(userId: string, appId: string): Promise<void>;
  clearSelections(userId: string): Promise<void>;
}

export class DrizzleSelectionsRepository implements ISelectionsRepository {
  async getByUserId(userId: string): Promise<UserSelection[]> {
    return await db
      .select()
      .from(userSelections)
      .where(eq(userSelections.userId, userId));
  }

  async saveSelections(userId: string, appIds: string[]): Promise<void> {
    // Clear existing selections for user
    await db.delete(userSelections).where(eq(userSelections.userId, userId));

    // Insert new selections
    if (appIds.length > 0) {
      const newSelections: NewUserSelection[] = appIds.map((appId) => ({
        userId,
        appId,
      }));
      await db.insert(userSelections).values(newSelections);
    }
  }

  async addSelection(userId: string, appId: string): Promise<void> {
    await db
      .insert(userSelections)
      .values({ userId, appId })
      .onConflictDoNothing();
  }

  async removeSelection(userId: string, appId: string): Promise<void> {
    await db
      .delete(userSelections)
      .where(
        and(
          eq(userSelections.userId, userId),
          eq(userSelections.appId, appId)
        )
      );
  }

  async clearSelections(userId: string): Promise<void> {
    await db.delete(userSelections).where(eq(userSelections.userId, userId));
  }
}

export const selectionsRepository = new DrizzleSelectionsRepository();
