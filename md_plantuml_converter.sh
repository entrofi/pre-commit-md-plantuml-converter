#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail


exitIfPlantJarNotFound () {
  if [[ ! -f "$1" ]]; then
    echo "plantuml.jar file cannot be found in your project directory"
    exit 1;
  fi
}

echo "Running pre-commit to check for staged files to convert to plantuml diagrams"

# plantuml.jar file should be placed at the project directory
plantJarFile="$(dirname $(git rev-parse --git-dir))/plantuml.jar"

exitIfPlantJarNotFound $plantJarFile

plantUmlFilesToGenerate="";
diagramFilesToAddToGitCommit="";
while read status plantUmlFile; do

  plantUmlFileWithoutExtension=${plantUmlFile%%.*}

  # clean up image file
  if [[ $status == 'D' ]]; then
    rm "${plantUmlFileWithoutExtension}.png"
  fi


  if [[ $status == 'A' ]] || [[ $status == 'M' ]]; then
    plantUmlFilesToGenerate="${plantUmlFilesToGenerate} ${plantUmlFile}"
    diagramFilesToAddToGitCommit="${diagramFilesToAddToGitCommit} ${plantUmlFileWithoutExtension%%.*}.png"
  fi

done <<< "$(git diff-index --cached HEAD --name-status | grep '\.puml$')"

echo "Generating plantuml diagrams for $plantUmlFilesToGenerate"

java -jar $plantJarFile -progress $plantUmlFilesToGenerate

git add $diagramFilesToAddToGitCommit