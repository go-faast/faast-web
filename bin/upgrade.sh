#!/bin/bash
set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "master" ]; then
  echo not on master, passing by
  exit 0
fi

RELEASE=$(git tag -l | grep $(git describe --tags))

if [ -z "$RELEASE" ]; then
  echo no release tag, just passing by
  exit 0
fi

echo release $RELEASE

echo triggering build on faast-swap

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
