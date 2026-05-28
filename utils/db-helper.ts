/**
 * PostgreSQL Database Helper Utility
 *
 * Pure TypeScript helper for connecting to PostgreSQL databases and executing queries.
 * Replaces MySQL implementation with native PostgreSQL support
 * using the pg library with connection pooling.
 *
 * Install:
 *   npm install pg
 *
 * Usage:
 *   import { PostgresHelper } from '../utils/postgres-helper';
 *
 *   const db = new PostgresHelper();
 *   try {
 *     const result = await db.executeQuery(
 *       'SELECT * FROM bills_db.bill WHERE id = $1',
 *       ['123']
 *     );
 *     console.log(result.data);
 *   } finally {
 *     await db.close();
 *   }
 */

import { Pool, PoolClient, QueryResult } from 'pg';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface DbQueryResult {
  success: boolean;
  data: any[];
  message: string;
}

export interface DbUpdateResult {
  success: boolean;
  affectedRows: number;
  message: string;
}

/**
 * Get database configuration from environment variables
 */
function getDbConfig(): DbConfig {
  // Prefer standard DB_* env vars, fall back to legacy lowercase keys.
  const host = process.env.DB_HOST || process.env.dburl || '';
  const port = Number(process.env.DB_PORT || process.env.dbport || 5432);
  const user = process.env.DB_USER || process.env.dbuserid || '';
  const password = process.env.DB_PASSWORD || process.env.dbpassword || '';
  const database = process.env.DB_NAME || process.env.dbname || '';

  if (!host || !user || !password || !database) {
    throw new Error(
      'Database configuration is incomplete. Ensure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME are set in the environment (.env) file.'
    );
  }

  return {
    host,
    port,
    user,
    password,
    database,
  };
}

/**
 * PostgreSQL Database Helper Class
 */
export class PostgresHelper {
  private pool: Pool | null;

  constructor() {
    this.pool = null;
  }

  /**
   * Get or create connection pool
   */
  private getPool(): Pool {
    if (!this.pool) {
      const config = getDbConfig();

      console.log(
        `[DB] Creating PostgreSQL connection pool for ${config.host}:${config.port}...`
      );

      this.pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Optional error listener
      this.pool.on('error', (err) => {
        console.error('[DB] Unexpected PostgreSQL pool error:', err);
      });
    }

    return this.pool;
  }

  /**
   * Execute SELECT query
   *
   * PostgreSQL uses:
   *   $1, $2, $3...
   * placeholders instead of ?
   */
  async executeQuery(
    query: string,
    params?: any[]
  ): Promise<DbQueryResult> {
    let client: PoolClient | null = null;

    try {
      console.log('[DB] Executing query...');

      const pool = this.getPool();
      client = await pool.connect();

      const result: QueryResult = await client.query(query, params);

      console.log(`[DB] Query returned ${result.rows.length} rows`);

      // Serialize data
      const serializedData = result.rows.map((row: any) => {
        const serializedRow: Record<string, any> = {};

        for (const [key, value] of Object.entries(row)) {
          if (value instanceof Date) {
            serializedRow[key] = this.formatDate(value);
          } else if (value !== null && value !== undefined) {
            serializedRow[key] = String(value);
          } else {
            serializedRow[key] = null;
          }
        }

        return serializedRow;
      });

      return {
        success: true,
        data: serializedData,
        message: `Query executed successfully, returned ${serializedData.length} rows`,
      };
    } catch (error) {
      console.error(`[DB] Query failed: ${error}`);

      return {
        success: false,
        data: [],
        message: `Database query failed: ${error}`,
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Execute INSERT/UPDATE/DELETE query
   */
  async executeUpdate(
    query: string,
    params?: any[]
  ): Promise<DbUpdateResult> {
    let client: PoolClient | null = null;

    try {
      console.log('[DB] Executing update...');

      const pool = this.getPool();
      client = await pool.connect();

      const result: QueryResult = await client.query(query, params);

      const affectedRows = result.rowCount || 0;

      console.log(
        `[DB] Update successful, affected rows: ${affectedRows}`
      );

      return {
        success: true,
        affectedRows,
        message: `Query executed successfully, affected ${affectedRows} rows`,
      };
    } catch (error) {
      console.error(`[DB] Update failed: ${error}`);

      return {
        success: false,
        affectedRows: 0,
        message: `Database update failed: ${error}`,
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Close connection pool
   */
  async close(): Promise<void> {
    if (!this.pool) {
      return;
    }

    try {
      await this.pool.end();
      console.log('[DB] PostgreSQL connection pool closed successfully');
    } catch (error) {
      console.warn(`[DB] Warning during pool close: ${error}`);
    } finally {
      this.pool = null;
    }
  }

  /**
   * Format Date object
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }
}
