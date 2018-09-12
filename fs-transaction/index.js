import fs from 'fs';
import path from 'path';
import log from '../shared/log';
import { createTempDir, rmrfSync, sha256 } from '../core/utils';

const OPERATIONS = {
  ADD(filePath, data) {
    return {
      type: 'ADD',
      filePath,

      async apply() {
        if (fs.existsSync(filePath)) throw new Error(`Can't ADD ${filePath}: already exists`);

        return fs.promises.writeFile(filePath, data);
      },
      async rollback() {
        return fs.promises.unlink(filePath);
      },
    };
  },

  UPDATE(filePath, data) {
    let _tmpFile;

    return {
      type: 'UPDATE',
      filePath,

      async apply(tmpDir) {
        if (!fs.existsSync(filePath)) throw new Error(`Can't UPDATE ${filePath}: doesn't exist`);

        _tmpFile = path.join(tmpDir, sha256(filePath));
        await fs.promises.rename(filePath, _tmpFile);

        return fs.promises.writeFile(filePath, data);
      },

      rollback() {
        return fs.promises.rename(_tmpFile, filePath);
      },
    };
  },

  REMOVE(filePath) {
    let _tmpFile;

    return {
      type: 'REMOVE',
      filePath,

      apply(tmpDir) {
        if (!fs.existsSync(filePath)) throw new Error(`Can't REMOVE ${filePath}: doesn't exist`);

        _tmpFile = path.join(tmpDir, sha256(filePath));

        return fs.promises.rename(filePath, _tmpFile);
      },

      rollback() {
        return fs.promises.rename(_tmpFile, filePath);
      },
    };
  },
};

export default function createFsTransaction() {
  const _operations = [];
  let _opCounter = 0;

  function _assertUniqFile(filePath) {
    if (_operations.find(item => item.filePath === filePath)) {
      throw new Error(`Operation with ${filePath} has already been scheduled`);
    }
  }

  async function _rollback() {
    log.warn(`Starting rollback of ${_opCounter} operations`);

    for (let i = 0; i < _opCounter; i += 1) {
      const operation = _operations[i];

      const err = await operation.rollback();

      if (err) {
        log.warn(`Rollback of ${operation.type} ${operation.filePath} failed:`, err);
      } else {
        log.warn(`Rollback of ${operation.type} ${operation.filePath} succeded`);
      }
    }

    log.warn('Finished rollback');
  }

  return {
    addFile(filePath, data) {
      _assertUniqFile(filePath);
      _operations.push(OPERATIONS.ADD(filePath, data));
    },

    updateFile(filePath, data) {
      _assertUniqFile(filePath);
      _operations.push(OPERATIONS.UPDATE(filePath, data));
    },

    removeFile(filePath) {
      _assertUniqFile(filePath);
      _operations.push(OPERATIONS.REMOVE(filePath));
    },

    async commit() {
      log.debug(`Commiting ${_operations.length} operations`);

      let tmpDir;
      try {
        tmpDir = await createTempDir();
        log.debug('Temp dir: ', tmpDir);

        for (const operation of _operations) {
          await operation.apply(tmpDir);
          _opCounter += 1;
        }
      } catch (err) {
        await _rollback(tmpDir);
        throw err;
      } finally {
        if (tmpDir) rmrfSync(tmpDir);
      }
    },
  };
}
