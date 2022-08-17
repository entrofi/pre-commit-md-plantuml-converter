#!/usr/bin/env node
const {Command} = require('commander');
const fs = require('fs');
const PlantumlSnippetConverter = require('../src/plantuml-snippet-converter').PlantumlSnippetConverter;
const MdPumlMatchers = require('./md-puml-matchers');

/**
 *
 * @param {string} markdown  markdown text to process
 * @param {string} extension file extension
 * @param {string} prefix prefix for the generated image file name
 * @param {string} imagePath the relative path to save images to
 * @param {string} markdownFilePath path of the markdown file containing {@link markdown}
 * @param {string } outputFile
 * @constructor
 */
function ConversionParams(markdown,
    extension,
    prefix,
    imagePath,
    markdownFilePath,
    outputFile,
) {
  this.markdown = markdown;
  this.extension = extension;
  this.prefix = prefix;
  this.imagePath = imagePath;
  this.markdownFilePath = markdownFilePath;
  this.outputFile = outputFile;
}

const processMarkdown = (conversionParams) => {
  const pumlMdSnippetMatch = MdPumlMatchers.resetAndGetMarkdownPlantumlSnippetMatcher();
  return conversionParams.markdown.replace(pumlMdSnippetMatch,
      (s) =>
        convertPumlMarkup(s,
            conversionParams.extension,
            conversionParams.markdownFilePath,
            conversionParams.prefix,
            conversionParams.imagePath),
  );
};

const readFile = (markdownFile) => {
  return fs.readFileSync(markdownFile, 'utf-8')
      .toString();
};

const convertPumlMarkup = (mdPumlSnippet, extension, markdownFilePath, imagePrefix, imagePath) => {
  const mdPumlConverter = new PlantumlSnippetConverter(mdPumlSnippet,
      {extension, workingDir: markdownFilePath, imagePath, imagePrefix});
  return mdPumlConverter.convert();
};


const initCommandAndParse = () => {
  const mdPumlConverterCommand = new Command();
  let parsedConversionParams;
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
        const markdown = readFile(markdownFile);
        const options = this.opts();
        const extension = options.extension;
        const prefix = options.imagePrefix;
        const imagePath = options.imagePath;
        const markdownFilePath = options.markdownFilePath;
        const outputFile = options.outputFile ? options.outputFile : markdownFile;
        parsedConversionParams = new ConversionParams(
            markdown,
            extension,
            prefix,
            imagePath,
            markdownFilePath,
            outputFile,
        );
      });
  mdPumlConverterCommand.parse();
  return parsedConversionParams;
};

const main = async () => {
  const parsedConversionParams = initCommandAndParse();
  const processedOutput = processMarkdown(parsedConversionParams);
  await fs.writeFile(parsedConversionParams.outputFile, processedOutput, (error) => {
    if (error) {
      console.error(error);
    }
  });
};

main().then(process.stdout).catch(process.stderr);


