#!/bin/bash
# This script is used by the CI to run the tests in each package

# Get the list of directories at the first level inside ./packages/
directories=$(find ./packages/ -maxdepth 1 -type d)

# Iterate over each directory and run the test command
for dir in $directories; do
  yarn test --testMatch "<rootDir>/$dir/**/!(*.e2e).test.[jt]s"
done

yarn test --testMatch "<rootDir>/integration-tests/!(*.e2e).test.[jt]s"
