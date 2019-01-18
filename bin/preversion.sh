#/bin/bash

set -e

GIT_CHANGES=$(git status --porcelain)
if [ "$GIT_CHANGES" ]; then
  echo "Working directory is not clean. Stash or commit your changes and try again."
  exit 1
fi

CURRENT_TAG=$(git tag --points-at HEAD)
if [ "$CURRENT_TAG" ]; then
  echo "HEAD has already been tagged as version $CURRENT_TAG"
  exit 1
fi

npm run test
