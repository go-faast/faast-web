#!/bin/bash
set -e

die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Example usage: $0 v2.0.4"

echo doing the necessary git Config
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*

for branch in $(git branch -r|grep -v HEAD) ; do
    git checkout ${branch#origin/}
done

release=$1
currentBranch=$(git branch | grep \* | cut -d ' ' -f2)
git checkout master
git merge --ff-only $release
git push
if [ "$currentBranch" != "master" ]; then
  git checkout $currentBranch
fi
