#!/usr/bin/env node
const PlantumlSnippetConverter = require('../src/plantuml-snippet-converter').PlantumlSnippetConverter;
const MdPumlMatchers = require('./md-puml-matchers');
const doc = `
Usage:
  convert-plantuml.js <markdownWithPlantuml> <extension> <markdownFilePath> [<imagePath>]  [<imagePrefix>]
Arguments:
  plantuUmlComment      The markdown comment string containing plantuml markup \`\`\`plantum \`\`\`
  extension             Image type extension e.g.: 'svg', 'png', 'jpg'
  markdownFilePath      Relative path of the current markdown file
  imagePath             Save path for the generated images
  imagePrefix           A prefix to add to generated image filenames
Example:
  convert-plantuml.js "# Hello world" "png" "prefix_"
`;

const docopt = require('docopt').docopt;


const convertPumlMarkup = (mdPumlSnippet, extension, markdownFilePath, imagePrefix, imagePath) => {
  const mdPumlConverter = new PlantumlSnippetConverter(mdPumlSnippet,
      {extension, workingDir: markdownFilePath, imagePath, imagePrefix});
  return mdPumlConverter.convert();
};

const main = async (config) => {
  const markdown = config['<markdownWithPlantuml>'];
  const extension = config['<extension>'];
  const prefix = config['<imagePrefix>'];
  const imagePath = config['<imagePath>'];
  const markdownFilePath = config['<markdownFilePath>'];
  const pumlMdSnippetMatch = MdPumlMatchers.resetAndGetMarkdownPlantumlSnippetMatcher();
  const reformattedMarkdown = markdown.replace(pumlMdSnippetMatch,
      (s) => convertPumlMarkup(s, extension, markdownFilePath, prefix, imagePath));
  return reformattedMarkdown;
};

main(docopt(doc)).then(console.log).catch(console.error);
