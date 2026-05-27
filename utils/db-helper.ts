/**
 * PostgreSQL Database Helper
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { loadEnvironment } from '../config/env-config';

// Load env variables
loadEnvironment();

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

export class PostgresHelper {
  private static pool: Pool;

  constructor() {
    if (!PostgresHelper.pool) {
      PostgresHelper.pool = new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      });

      console.log('[DB] PostgreSQL pool created');
    }
  }

  /**
   * Execute SELECT query
   */
  async executeQuery(
    query: string,
    params?: any[]
  ): Promise<DbQueryResult> {
    let client: PoolClient | null = null;

    try {
      client = await PostgresHelper.pool.connect();

      const result: QueryResult = await client.query(
        query,
        params
      );

      return {
        success: true,
        data: result.rows,
        message: `Returned ${result.rows.length} rows`,
      };
    } catch (error) {
      console.error('[DB] Query Error:', error);

      return {
        success: false,
        data: [],
        message: `Query failed: ${error}`,
      };
    } finally {
      client?.release();
    }
  }

  /**
   * Execute INSERT/UPDATE/DELETE
   */
  async executeUpdate(
    query: string,
    params?: any[]
  ): Promise<DbUpdateResult> {
    let client: PoolClient | null = null;

    try {
      client = await PostgresHelper.pool.connect();

      const result: QueryResult = await client.query(
        query,
        params
      );

      return {
        success: true,
        affectedRows: result.rowCount || 0,
        message: `Affected rows: ${result.rowCount}`,
      };
    } catch (error) {
      console.error('[DB] Update Error:', error);

      return {
        success: false,
        affectedRows: 0,
        message: `Update failed: ${error}`,
      };
    } finally {
      client?.release();
    }
  }

  /**
   * Close DB Pool
   */
  async close(): Promise<void> {

    if (PostgresHelper.pool) {
  
      await PostgresHelper.pool.end();
  
      PostgresHelper.pool = null;
  
      console.log('[DB] PostgreSQL pool closed');
    }
  }
}