import dock from '@docknetwork/sdk';

module.exports = async () => {
  if (dock.isConnected) {
    try {
      console.log('Disconnecting from Dock node');
      await dock.disconnect();
    } catch (err) {
      console.error('Error disconnecting from Dock node', err);
    }
  }
};
