#!/usr/bin/env bash

set -o errexit
set -o nounset
set -eu -o pipefail

for i in "$@"; do
  case $i in
    -e=*|--extension=*)
      EXTENSION="${i#*=}"
      shift # past argument=value
      ;;
    -d=*|--image-dir=*)
      IMAGE_DIR="${i#*=}"
      shift # past argument=value
      ;;
    -p=*|--prefix=*)
      PREFIX="${i#*=}"
      shift # past argument=value
      ;;
    -*|--*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      ;;
  esac
done

echo "FILE EXTENSION  = ${EXTENSION}"
echo "IMAGE DIR       = ${IMAGE_DIR}"
echo "PREFIX          = ${PREFIX}"
echo "FILES"
echo "$@"
for filename in "$@"; do
  echo "Current directory $(pwd)"
  echo "Processing ${filename}"
  fileContent=$(cat $filename)
  if [ -z "${PREFIX}" ]; then
      PREFIX="${filename}_"
  fi
  convert-plantuml "${fileContent}" "${EXTENSION}" "${IMAGE_DIR}" ${PREFIX} > "${filename}"
done
