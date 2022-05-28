# cp -rf ./src ../DockApp/node_modules/@docknetwork/react-native-sdk

# cp ./build/static/js/bundle.js ../DockApp/assets/app-html/bundle.js
# cp ./build/static/js/bundle.js ../DockApp/android/app/src/main/assets/app-html/bundle.js

# Workaround for bad build file
node ./packages/react-native/bundler/build.js
cp ./packages/react-native/public/bundle.js  ../dock-app/assets/app-html/
#cp -rf ./bundle.js ../DockApp/assets/app-html/bundle.js
#cp -rf ./bundle.js ../DockApp/android/app/src/main/assets/app-html/bundle.js


# cp ./bundle.js /Users/maycon/dev/dock/DockApp/packages/web-wallet/public
