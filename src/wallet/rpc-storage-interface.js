import StorageInterface from '@docknetwork/wallet/storage/storage-interface';
import {StorageRpc} from '../client/storage-rpc';
import {v4 as uuid} from 'uuid';
import { LoggerRpc } from '../client/logger-rpc';
import { getLogger } from '../logger';

function generateDocumentId() {
  return `doc:${uuid()}`;
}

/** An example file system storage interface implementation. This is not secure and shouldn't be used in production */
class RpcStorageInterface extends StorageInterface {
  constructor(directory) {
    super();
    this.directory = directory;
    this.documents = {};
    this.loadStorage(directory);
  }
  
  async loadStorage(directory) {
    try {
      const data = await StorageRpc.getItem(directory);
      // getLogger().log('retrieve data from rpc storage', data);
      
      this.documents = JSON.parse(data);

      if (!this.documents) {
        this.documents = {};
      }
    } catch(err) {
      getLogger().log('error to retrieve data from rpc storage', err.toString());
      this.documents = {};
    }
  }

  updateLocalStorage() {
    StorageRpc.setItem(this.directory, JSON.stringify(this.documents));
  }

  async get({ id }) {
    const content = this.documents[id];
    return {
      id,
      content,
    };
  }

  async update(options) {
    return this.insert(options);
  }

  async delete({ document }) {
    delete this.documents[document.id];
    this.updateLocalStorage();
  }

  async insert({ document }) {
    const docId = document.id || generateDocumentId();

    this.documents[docId] = document.content;

    this.updateLocalStorage();

    return {
      id: docId,
      ...document,
    };
  }

  async count(query) {
    const result = await this.find(query);
    return result.length;
  }

  async find({ has = undefined, equals = undefined } = {}) {
    getLogger().log('Execute find', {
      equals,
      documents: this.documents,
    });

    const documents = Object.keys(this.documents || {}).map((docId) => {
      const content = this.documents[docId];

      let matchesQuery = false;
      if (!has && !equals) { // Return all documents
        matchesQuery = true;
      } else if (equals && equals['content.id']) { // Basic "query" support for tests
        matchesQuery = content.id === equals['content.id'];
      } else if (equals && equals['content.type']) { // Basic "query" support for tests
        matchesQuery = content.type === equals['content.type'];
      }

      if (matchesQuery) {
        return {
          id: docId,
          content,
        };
      }
      
      return null;
    }).filter((value) => !!value);
    return { documents };
  }
}

export default RpcStorageInterface;
