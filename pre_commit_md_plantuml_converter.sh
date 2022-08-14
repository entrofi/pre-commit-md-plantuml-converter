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

function debugScriptArgs {
  if ! [[ -z "${DEBUG_VARS:-}" ]]; then
    echo "==================================SCRIPT ARGS=================================="
    echo "IMAGE EXTENSION = ${EXTENSION}"
    echo "IMAGE DIR       = ${IMAGE_DIR}"
    echo "PREFIX          = ${PREFIX}"
    echo "FILES           = $(echo "$@")"
  fi
}

function debugFileVars {
  if ! [[ -z "${DEBUG_VARS:-}" ]]; then
      local -r currentFile="$1"
      local -r prefixForImg="$2"
      echo "============================================================================="
      echo "Processing ${currentFile}"
      echo "Current file              = ${filename}"
      echo "Current file path         = ${FILE_PATH}"
      echo "Current file base name    = ${FILE_BASE_NAME}"
      echo "Current file extension    = ${FILE_EXT}"
      echo "Current calculated prefix = ${prefixForImg}"
      echo "Image dir                 = ${IMAGE_DIR}"
      echo "Provided PREFIX           = ${PREFIX}"
  fi
}

function prepareFileDetails {
  local -r currentFile="$1"
  local -r pickedFilePath="${currentFile%/*}"
  FILE_PATH="${currentFile%/*}"
  FILE_BASE_NAME="${currentFile##*/}"
  FILE_NAME_PREFIX="${FILE_BASE_NAME%.*}"
  FILE_EXT="${FILE_BASE_NAME##*.}"

  [[ $currentFile == "${pickedFilePath}" ]] && FILE_PATH="" || FILE_PATH="${pickedFilePath:-}"
}

function getImagePrefix {
  local -r candidatePrefix="$1"
  local imagePrefixPrefix=""
  [[ -z "${PREFIX}" ]] && imagePrefixPrefix="${candidatePrefix}_" || imagePrefixPrefix="${PREFIX}"
  echo "${imagePrefixPrefix}"
}


debugScriptArgs "$@"

for filename in "$@"; do
  prepareFileDetails "${filename}"
  prefixForImages=$(getImagePrefix "${FILE_NAME_PREFIX}")
  debugFileVars "${filename}" "${prefixForImages}"
  convert-plantuml run "${filename}" -e "${EXTENSION}" -f "${FILE_PATH:-"."}" -i "${IMAGE_DIR}" -p ${prefixForImages}
done
