const path = require('path');
const fs = require('fs');

module.exports = (request, options) => {
  // Handle @docknetwork/credential-sdk special exports
  if (request.startsWith('@docknetwork/credential-sdk/')) {
    const modulePath = request.replace('@docknetwork/credential-sdk/', '');
    
    // Check different possible paths
    const possiblePaths = [
      path.join(options.basedir, 'node_modules/@docknetwork/credential-sdk/dist/esm', modulePath + '.js'),
      path.join(options.basedir, 'node_modules/@docknetwork/credential-sdk/dist/esm', modulePath, 'index.js'),
      path.join(options.basedir, 'node_modules/@docknetwork/credential-sdk/dist/esm', modulePath),
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }
  }
  
  // Default resolver
  return options.defaultResolver(request, options);
};