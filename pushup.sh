#!/usr/bin/env bash

set -x

push_target_beta=rotblauer.catonmap:/www/beta.catonmap.net
push_target_pro=rotblauer.catonmap:/www/catonmap.net/
push_target="$push_target_beta"

if [[ "$1" == "beta" ]]; then
  echo "Pushing to BETA endpoint"
elif [[ "$1" == "pro" ]]; then
  echo "Pushing to PRO endpoint"
  push_target="$push_target_pro"
else
	echo "unknown arg"
  exit 1
fi

git tag -a v$(date +%s) -m "[${1}] pushup"
rsync -avz -L --progress -h --exclude=".git" . "$push_target"
git push origin
git push origin --tags

