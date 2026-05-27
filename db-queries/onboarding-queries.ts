import { PostgresHelper } from '../utils/db-helper';

const db = new PostgresHelper();

export class UserRepository {

  static async getUserByEmail(email: string) {

    const query = `
      SELECT *
      FROM users
      WHERE email = $email
    `;

    return await db.executeQuery(
      query,
      [email]
    );
  }

  static async deleteUser(userId: string) {

    const query = `
      DELETE FROM users
      WHERE id = $userId
    `;

    return await db.executeUpdate(
      query,
      [userId]
    );
  }
}