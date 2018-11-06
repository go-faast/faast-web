#!/bin/bash
set -e

die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Example usage: $0 v2.0.4"

release=$1
currentBranch=$(git branch | grep \* | cut -d ' ' -f2)
git checkout master
git merge --ff-only $release
if [ "$currentBranch" != "master" ]; then
  git checkout $currentBranch
fi
