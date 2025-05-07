import { createLogger } from './logger';
import { Redis } from 'ioredis';
import { GameState, Move, Player, GameError } from '../types/game';

const logger = createLogger('GameState');

// Redis configuration with proper type safety
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  tls?: Record<string, never>;
}

const REDIS_CONFIG: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

export class GameStateManager {
  private redis: Redis;
  private readonly GAME_STATE_PREFIX = 'game:';
  private readonly GAME_HISTORY_PREFIX = 'history:';
  private readonly GAME_EXPIRY = 60 * 60 * 24 * 7; // 7 days

  constructor(redis?: Redis) {
    this.redis = redis || new Redis(REDIS_CONFIG);
    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error });
    });
  }

  private handleError(operation: string, error: unknown): never {
    const gameError: GameError = {
      code: 'REDIS_ERROR',
      message: `Failed to ${operation}`,
      details: error instanceof Error ? error.message : String(error),
    };
    logger.error(`Failed to ${operation}`, { error: gameError });
    throw gameError;
  }

  async saveGameState(gameId: string, state: GameState): Promise<void> {
    try {
      const key = `${this.GAME_STATE_PREFIX}${gameId}`;
      await this.redis.set(key, JSON.stringify(state), 'EX', this.GAME_EXPIRY);
      logger.info('Game state saved', { gameId });
    } catch (error) {
      this.handleError('save game state', error);
    }
  }

  async getGameState(gameId: string): Promise<GameState | null> {
    try {
      const key = `${this.GAME_STATE_PREFIX}${gameId}`;
      const state = await this.redis.get(key);
      if (!state) {
        logger.warn('Game state not found', { gameId });
        return null;
      }
      return JSON.parse(state) as GameState;
    } catch (error) {
      this.handleError('get game state', error);
    }
  }

  async recordMove(gameId: string, move: Move, player: Player): Promise<void> {
    try {
      const historyKey = `${this.GAME_HISTORY_PREFIX}${gameId}`;
      const moveData = {
        move,
        player,
        timestamp: Date.now(),
      };
      await this.redis.rpush(historyKey, JSON.stringify(moveData));
      logger.info('Move recorded', { gameId, move, player });
    } catch (error) {
      this.handleError('record move', error);
    }
  }

  async getGameHistory(gameId: string): Promise<Array<{ move: Move; player: Player; timestamp: number }>> {
    try {
      const historyKey = `${this.GAME_HISTORY_PREFIX}${gameId}`;
      const history = await this.redis.lrange(historyKey, 0, -1);
      return history.map((item) => JSON.parse(item));
    } catch (error) {
      this.handleError('get game history', error);
    }
  }

  async deleteGameState(gameId: string): Promise<void> {
    try {
      const stateKey = `${this.GAME_STATE_PREFIX}${gameId}`;
      const historyKey = `${this.GAME_HISTORY_PREFIX}${gameId}`;
      await this.redis.del(stateKey, historyKey);
      logger.info('Game state deleted', { gameId });
    } catch (error) {
      this.handleError('delete game state', error);
    }
  }

  async isGameActive(gameId: string): Promise<boolean> {
    try {
      const state = await this.getGameState(gameId);
      return state !== null && !state.isComplete;
    } catch (error) {
      this.handleError('check game status', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      this.handleError('close Redis connection', error);
    }
  }
} 