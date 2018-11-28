#!/usr/bin/env bash

rsync -avz -L --progress -h --exclude=".git" . sfcom:/www/catonmap.net/
