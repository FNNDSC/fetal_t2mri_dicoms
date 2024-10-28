#!/bin/bash
# Purpose: upload a directory of DICOMs to Orthanc.

url="http://localhost:8042/instances"

find -L dicoms -type f -name '*.dcm' \
  | parallel --bar -j 4 "curl -sSfX POST -u orthanc:orthanc http://localhost:8042/instances -H Expect: -H 'Content-Type: application/dicom' -T {} -o /dev/null"
