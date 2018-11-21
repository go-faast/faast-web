#!/bin/bash

RELEASE=$(git tag -l | grep $(git describe --tags))
if [ -n "$RELEASE"]; then
  npm run release
fi

#
