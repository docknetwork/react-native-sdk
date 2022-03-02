import StorageInterface from '@docknetwork/wallet/storage/storage-interface';

const localStorage = global.localStorage;

function generateDocumentId() {
  return `doc${Math.floor(Math.random() * 10000)}`;
}

/* An example file system storage interface implementation. This is not secure and shouldn't be used in production */
class MemoryStorageInterface extends StorageInterface {
  constructor(directory) {
    super();

    this.directory = directory;

    try {
      this.documents = JSON.parse(localStorage.getItem(directory));

      if (!this.documents) {
        this.documents = {};
      }
    } catch (err) {
      console.error(err);
      this.documents = {};
    }
  }

  updateLocalStorage() {
    localStorage.setItem(this.directory, JSON.stringify(this.documents));
  }

  async get({id}) {
    const content = this.documents[id];
    return {
      id,
      content,
    };
  }

  async update(options) {
    return this.insert(options);
  }

  async delete({document}) {
    delete this.documents[document.id];
    this.updateLocalStorage();
  }

  async insert({document}) {
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

  async find({has = undefined, equals = undefined} = {}) {
    const documents = Object.keys(this.documents || {})
      .map(docId => {
        const content = this.documents[docId];

        let matchesQuery = false;
        if (!has && !equals) {
          // Return all documents
          matchesQuery = true;
        } else if (equals && equals['content.id']) {
          // Basic "query" support for tests
          matchesQuery = content.id === equals['content.id'];
        }

        if (matchesQuery) {
          return {
            id: docId,
            content,
          };
        }

        return null;
      })
      .filter(value => !!value);
    return {documents};
  }
}

export default MemoryStorageInterface;
