import { PostgresHelper } from '../utils/db-helper';

const db = new PostgresHelper();

export class OnboardingData {

  static async getUserByEmail(email: string) {

    const query = `
      SELECT *
      FROM users
      WHERE email = $1
    `;
    return await db.executeQuery(
      query,
      [email]
    );
  }

  static async deleteUser(userId: string) {

    const query = `
      DELETE FROM users
      WHERE id = $1
    `;

    return await db.executeUpdate(
      query,
      [userId]
    );
  }
}