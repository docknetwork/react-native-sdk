#!/bin/bash

# Get the list of directories at the first level inside ./packages/
directories=$(find ./packages/ -maxdepth 1 -type d)

# Iterate over each directory and run the test command
for dir in $directories; do
  yarn test --testMatch "<rootDir>/$dir/**/!(*.e2e).test.[jt]s"
done