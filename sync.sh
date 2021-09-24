cp -rf ./src ../DockApp/node_modules/@docknetwork/react-native-sdk

# cp ./build/static/js/bundle.js ../DockApp/assets/app-html/bundle.js
# cp ./build/static/js/bundle.js ../DockApp/android/app/src/main/assets/app-html/bundle.js

# Workaround for bad build file
curl http://localhost:3000/static/js/bundle.js > bundle.js
cp -rf ./bundle.js ../DockApp/assets/app-html/bundle.js
cp -rf ./bundle.js ../DockApp/android/app/src/main/assets/app-html/bundle.js


# cp ./bundle.js /Users/maycon/dev/dock/DockApp/packages/web-wallet/public
