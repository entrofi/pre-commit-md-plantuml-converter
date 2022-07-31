#!/usr/bin/env node
const PlantumlSnippetConverter = require('../src/plantuml-snippet-converter');
const doc = `
Usage:
  convert-plantuml.js <markdownWithPlantuml> <extension> [<imagePath>]  [<imagePrefix>]
Arguments:
  plantuUmlComment      The markdown comment string containing plantuml markup \`\`\`plantum \`\`\`
  extension             Image type extension e.g.: 'svg', 'png', 'jpg'
  imagePath             Save path for the generated images
  imagePrefix           A prefix to add to generated image filenames
Example:
  convert-plantuml.js "# Hello world" "png" "prefix_"
`;

const docopt = require('docopt').docopt;


const convertPumlMarkup = (mdPumlSnippet, extension, imagePrefix, imagePath) => {
  const mdPumlConverter = new PlantumlSnippetConverter(mdPumlSnippet, {extension, imagePath, imagePrefix});
  return mdPumlConverter.convert();
};

const main = async (config) => {
  const markdown = config['<markdownWithPlantuml>'];
  const extension = config['<extension>'];
  const prefix = config['<imagePrefix>'];
  const imagePath = config['<imagePath>'];
  const pumlMdSnippetMatch = /(<details>\n([\S\s]*?<summary>.*\n{2}))?(`{3}plantuml\n@startuml)([\S\s]*?)(@enduml\n`{3}){1}(([\S\s]*?)((<\/details>\n)))?(\n+\!\[\]\(.*\))?/gm;
  const reformattedMarkdown = markdown.replace(pumlMdSnippetMatch,
      (s) => convertPumlMarkup(s, extension, prefix, imagePath));
  return reformattedMarkdown;
};

main(docopt(doc)).then(console.log).catch(console.error);
