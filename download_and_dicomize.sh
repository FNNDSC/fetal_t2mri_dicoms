#!/usr/bin/env bash

image=ghcr.io/tomaroberts/nii2dcm:v0.1.5@sha256:9ad53b5362a9c217fdecbf15972689754996a30b4396298fda9b8b47580fc3a0

set -o pipefail
set -ex

mkdir data dicoms
cd data
parallel --bar -j4 wget -q < ../urls.txt
cd - > /dev/null 2>&1

podman run --rm --userns=keep-id:uid=10101,gid=10101 -u 10101:10101 \
  -v "$(realpath data)":/in:ro -v "$(realpath dicoms)":/out:rw \
  --entrypoint /bin/bash "$image" -c \
  'cd /in; for nii in *.nii; do out="/out/${nii%.nii}"; mkdir "$out" && nii2dcm -d MR -- "$nii" "$out"; done'

mkdir dicoms/empty
podman run --rm --userns=keep-id:uid=10101,gid=10101 -u 10101:10101 \
  -v "$(realpath create_empty_dicoms.py)":/create_empty_dicoms.py:ro \
  -v "$(realpath dicoms/empty)":/out:rw -w /out \
  --entrypoint /usr/local/bin/python "$image" /create_empty_dicoms.py
