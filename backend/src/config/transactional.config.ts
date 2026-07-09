import { AsyncLocalStorage } from 'node:async_hooks';
import { EntityManager, DataSource } from 'typeorm';

export class DataSourceHolder {
  private static instance: DataSource;

  static set(dataSource: DataSource) {
    this.instance = dataSource;
  }

  static get(): DataSource {
    if (!this.instance) {
      throw new Error(
        'DataSourceHolder is not set. Make sure TransactionalModule has been imported in TypeOrmModule.forRoot().',
      );
    }
    return this.instance;
  }
}

export class TransactionContext {
  private static readonly storage = new AsyncLocalStorage<EntityManager>();

  static run<T>(
    manager: EntityManager,
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.storage.run(manager, callback);
  }

  static getEntityManager(): EntityManager | undefined {
    return this.storage.getStore();
  }
}

export function Transactional(): MethodDecorator {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const existingManager = TransactionContext.getEntityManager();
      if (existingManager) {
        return originalMethod.apply(this, args);
      }

      const dataSource = DataSourceHolder.get();
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await TransactionContext.run(queryRunner.manager, () =>
          originalMethod.apply(this, args),
        );
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}
