#!/usr/bin/env bash

git tag -a v$(date +%s) -m "[${1}] pushup"

if [[ "$1" == "beta" ]]; then
	rsync -avz -L --progress -h --exclude=".git" . sfcom:/www/beta.catonmap.net
elif [[ "$1" == "pro" ]]; then
	rsync -avz -L --progress -h --exclude=".git" . sfcom:/www/catonmap.net/
else
	echo "unknown arg"
fi

