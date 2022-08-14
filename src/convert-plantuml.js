#!/usr/bin/env node
const {Command} = require('commander');
const fs = require('fs');
const PlantumlSnippetConverter = require('../src/plantuml-snippet-converter').PlantumlSnippetConverter;
const MdPumlMatchers = require('./md-puml-matchers');


const convertPumlMarkup = (mdPumlSnippet, extension, markdownFilePath, imagePrefix, imagePath) => {
  const mdPumlConverter = new PlantumlSnippetConverter(mdPumlSnippet,
      {extension, workingDir: markdownFilePath, imagePath, imagePrefix});
  return mdPumlConverter.convert();
};

const mdPumlConverterCommand = new Command();

mdPumlConverterCommand
    .command('run')
    .argument('<markdownFile>', 'The markdown file which contains plantuml markups\n' +
        'in the following form ```plantuml \n ....```')
    .requiredOption('-e, --extension <extension>', 'Image type extension e.g.: \'svg\', \'png\' (default), \'jpg\'')
    .requiredOption('-f, --markdown-file-path <markdownFilePath>', 'Relative path of the current markdown file')
    .option('-i, --image-path [imagePath]', 'Save path for the generated images')
    .option('-p, --image-prefix [imagePrefix]', 'A prefix to add to generated image filenames')
    .option('-o, --output-file [outputFile]', 'output file to write converted markdown. Default is empty' )
    .action(function(markdownFile) {
      const readFile = () => {
        return fs.readFileSync(markdownFile, 'utf-8')
            .toString();
      };
      const markdown = readFile();
      const options = this.opts();
      const extension = options.extension;
      const prefix = options.imagePath;
      const imagePath = options.imagePrefix;
      const markdownFilePath = options.markdownFilePath;
      const pumlMdSnippetMatch = MdPumlMatchers.resetAndGetMarkdownPlantumlSnippetMatcher();
      const processedOutput = markdown.replace(pumlMdSnippetMatch,
          (s) => convertPumlMarkup(s, extension, markdownFilePath, prefix, imagePath));
      const outputFile = options.outputFile ? options.outputFile : markdownFile;
      fs.writeFileSync(outputFile, processedOutput);
    });


mdPumlConverterCommand.parse();


