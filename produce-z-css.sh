#!/usr/bin/env bash

for i in $(seq 1 20); do
  # above
  for j in $(seq $((i+1)) 20); do
    echo ".leaflet-container.z$i path.zoomMin-$j { display: none; }"
  done

  # below

  for j in $(seq 0 $((i-1))); do
    echo ".leaflet-container.z$i path.zoomMax-$j { display: none; }"
  done
done
