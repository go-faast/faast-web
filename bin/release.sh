#!/bin/bash

# This script is used to release changes to prod, staging, or any other branch.
# Takes two args: <target-branch> [<release-tag>]
# If release-tag is not provided it defaults to the current tag of the following:
#   staging if target-branch == master
#   develop if target-branch == staging
#   HEAD if target-branch is anything else
#
# EXAMPLES
# Deploy specific version to staging:
# > release.sh staging v3.0.34
# Promote staging to prod:
# > release.sh master
# Promote develop to staging:
# > release.sh staging
# Release current branch to some feature branch:
# > release.sh feature-branch

set -e

PROD_BRANCH=master
STAGING_BRANCH=staging
DEVELOP_BRANCH=develop

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

if [ "$TARGET_BRANCH" == "$PROD_BRANCH" ]; then
  PROMOTE_REF="$STAGING_BRANCH"
  BRANCH_LABEL="PRODUCTION"
elif [ "$TARGET_BRANCH" == "$STAGING_BRANCH" ]; then
  PROMOTE_REF="$DEVELOP_BRANCH"
  BRANCH_LABEL="STAGING"
else
  PROMOTE_REF="HEAD"
  BRANCH_LABEL="branch $TARGET_BRANCH"
fi

RELEASE=${2:-$(git tag --points-at $PROMOTE_REF)}
RELEASE_EXISTS=$(git tag -l "$RELEASE")
if [ -z "$RELEASE_EXISTS" ]; then
  echo "Invalid release-tag $RELEASE"
  exit 1
fi
if [ -z "$RELEASE" ]; then
  echo "release-tag must be passed in as argument or $PROMOTE_REF must be tagged"
  exit 1
fi

read -p "Deploying $RELEASE to $BRANCH_LABEL. Hit enter to continue or ctrl-c to abort."

START_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git checkout $TARGET_BRANCH
git merge --ff-only $RELEASE
git push
if [ "$START_BRANCH" != "$TARGET_BRANCH" ]; then
  git checkout $START_BRANCH
fi
