#!/bin/bash

RELEASE=$(git tag -l | grep $(git describe --tags))

if [ -z "$RELEASE" ]; then
  echo no release tag, just passing by
fi

echo $RELEASE

echo doing the necessary git Config
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*

for branch in $(git branch -r|grep -v HEAD) ; do
    git checkout ${branch#origin/}
done

echo npm run release
npm run release $RELEASE

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
