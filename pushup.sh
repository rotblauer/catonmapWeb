#!/usr/bin/env bash

if [[ "$1" == "beta" ]]; then
  git tag -a v$(date +%s) -m "[${1}] pushup"
	rsync -avz -L --progress -h --exclude=".git" . sfcom:/www/beta.catonmap.net
elif [[ "$1" == "pro" ]]; then
  git tag -a v$(date +%s) -m "[${1}] pushup"
	rsync -avz -L --progress -h --exclude=".git" . sfcom:/www/catonmap.net/
else
	echo "unknown arg"
fi

