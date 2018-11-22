#!/bin/bash

RELEASE=$(git tag -l | grep $(git describe --tags))
echo $RELEASE
if [ -n "$RELEASE"]; then
  echo npm run release
  npm run release

  echo npm run release done, now triggering build on faast-swap

  curl -sL -u $BUILDUSER=:$BUILDPASSWORD -X POST \
    -H 'Content-Type: application/json' \
   https://api.bitbucket.org/2.0/repositories/bitaccess/faast-swap/pipelines/ \
    -d '
    {
      "target": {
        "ref_type": "branch",
        "type": "pipeline_ref_target",
        "ref_name": "upgrade"
      }
    }'
else
  echo no release tag, just passing by
fi
