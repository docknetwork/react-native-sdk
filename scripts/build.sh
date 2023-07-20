#!/bin/bash
# This script is used by the CI to run the build in each package

# Get the list of directories at the first level inside ./packages/
directories=$(find ./packages/* -maxdepth 0 -type d)

# Iterate over each directory and run the build command
for dir in $directories; do
 cd "$dir" || exit
   yarn build
 cd - || exit
done

