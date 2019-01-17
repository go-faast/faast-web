#!/bin/bash
set -e

REQUIRE_CLEAN=0

GIT_CHANGES=$(git status --porcelain)
if [ $REQUIRE_CLEAN -eq 1 ] && [ "$GIT_CHANGES" ]; then
  echo "Working directory is not clean. Stash or commit your changes and try again."
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <target-branch> [<release-tag>]"
  echo "  target-branch - branch to deploy to"
  echo "  release-tag - (optional) git tag to deploy, defaults to tag on HEAD"
  exit 1
fi

TARGET_BRANCH=$1
RELEASE=${2:-$(git tag --points-at HEAD)}
if [ -z "$RELEASE" ]; then
  echo "HEAD must be tagged or release-tag must be passed in as argument"
  exit 1
fi

if [ "$TARGET_BRANCH" == "master" ]; then
  BRANCH_LABEL="PRODUCTION"
elif [ "$TARGET_BRANCH" == "staging" ]; then
  BRANCH_LABEL="STAGING"
else
  BRANCH_LABEL="branch $TARGET_BRANCH"
fi

read -p "Deploying $RELEASE to $BRANCH_LABEL. Hit enter to continue or ctrl-c to abort."

START_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git checkout $TARGET_BRANCH
git merge --ff-only $RELEASE
git push
if [ "$START_BRANCH" != "$TARGET_BRANCH" ]; then
  git checkout $TARGET_BRANCH
fi
