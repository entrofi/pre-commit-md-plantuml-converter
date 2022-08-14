const nodePlantuml = require('@entrofi/node-plantuml');
const fs = require('fs');
const crypto = require('crypto');
const CollapsibleSnippet = require('./collapsible-snippet');
const MdPumlMatchers = require('./md-puml-matchers');
const RegExUtils = require('./regex-utils');
const colors = require('colors');

/**
 * Image name data holder.
 * @param {string} filenamePrefix sole filename without the extension
 * @param {string}  imageDir directory of the image
 * @param {string}  relativeToRoot path relative to repository root
 * @param {string}  relativeToWorkDir path relative to current working directory
 * @param {string}  extension file extension
 * @param {string}  imageFilename filename with extension without the path
 * @constructor
 */
function ImageNameData(filenamePrefix, imageDir, relativeToRoot, relativeToWorkDir, extension,
    imageFilename) {
  this.filenamePrefix = filenamePrefix;
  this.relativeToRoot = relativeToRoot;
  this.relativeToWorkDir = relativeToWorkDir;
  this.imageDir = imageDir;
  this.extension = extension;
  this.imageFileName = imageFilename;
}

/**
 *
 */
class PlantumlSnippetConverter {
  /**
   *
   * @param {string} mdPlantumlSnippet plant uml snippet to parse
   * @param {string} extension   extension of the file image. Currently only png, svg, and esp are supported
   * @param {string} workingDir  current working dir for the markdown file
   * @param {string} imagePath   default relative directory to save the generated image into
   * @param {string} imagePrefix prefix to use on generated image file names.
   */
  constructor(mdPlantumlSnippet, {extension= 'png', workingDir= '.', imagePath= '', imagePrefix}) {
    this.mdPlantumSnippet = mdPlantumlSnippet;
    this.options = {extension, imagePath: imagePath.replace(/^.\//, ''), imagePrefix, workingDir};
  }

  /**
   *
   * @return {string} markdown output to replace with plantuml snippet
   */
  convert() {
    let markdownOutput = this.mdPlantumSnippet;
    try {
      const generatedImageNameData = this.generateImage();

      markdownOutput = CollapsibleSnippet.makeCollapsible(markdownOutput);
      markdownOutput = PlantumlSnippetConverter.#updateImageLink(markdownOutput, generatedImageNameData);
    } catch (e) {
      console.error(`The snippet below is captured but can not be processed. Skipping:\n  ${colors.red(this.mdPlantumSnippet)}`, e.message);
    }
    return markdownOutput;
  }

  /**
   * Generates an image using the plantuml markup provided in {@link this.#mdPlantumlSnippet} and writes
   * it to the file system
   * @return {ImageNameData} file information for the saved image
   */
  generateImage() {
    const pumlMarkupMatcher = /(?<=`{3}plantuml)(\s*?)(?<plantuml>(@startuml)([\S\s]*?)(@enduml){1})(?!`{3})/m;
    const match = pumlMarkupMatcher.exec(this.mdPlantumSnippet);
    if (match !== null) {
      const plantumlMarkup = match.groups.plantuml;
      const generated = nodePlantuml.generate(plantumlMarkup, {format: this.options.extension});
      return this.#writeImageFile(generated, plantumlMarkup);
    }
    return undefined;
  }

  /**
   * Uses passed int plantuml data to create an image file and save it to the
   * {@link PlantumlSnippetConverter#options.#imagePath}
   * @param {{in: *, out: *}|{out: *}|{out: *}} generatedOutput file stream
   * @param {string} plantumlMarkup valid plantuml markup
   * <pre><code>
   *  @startuml
   * if (color?) is (<color:red>red) then
   * :print red;
   * else
   * :print not red;
   * @enduml
   * </code></pre>
   * @return {ImageNameData} path of the file saved
   */
  #writeImageFile(generatedOutput, plantumlMarkup) {
    const outputFileNameData = this.#fetchOrCreateImageName(plantumlMarkup);
    PlantumlSnippetConverter.#generateImageDir(outputFileNameData.imageDir);
    generatedOutput.out.pipe(fs.createWriteStream(outputFileNameData.relativeToRoot));
    return outputFileNameData;
  }

  /**
   *
   * @param {string} plantumlMarkup pure plantuml markup string i.e. not a markdown snippet
   * @return {ImageNameData|undefined}
   */
  #fetchOrCreateImageName(plantumlMarkup) {
    const oldImageData = PlantumlSnippetConverter.extractPathFromRefLink(this.mdPlantumSnippet);

    let imageRef = oldImageData;

    if (!oldImageData || oldImageData.extension !== `${this.options.extension}`) {
      imageRef = this.#createImageNameFor(plantumlMarkup);
    }
    return imageRef;
  }

  /**
   * Uses plain plantuml markup to generate filename related information e.g. filename prefix, extension, path, savepath
   * See {@link ImageNameData}
   * @param {string} plantumlMarkup plantuml markup string
   * @return {ImageNameData}
   */
  #createImageNameFor(plantumlMarkup) {
    const filenameHash = crypto.createHash('md5').update(plantumlMarkup).digest('hex');
    const filenamePrefix = `${this.options.imagePrefix ? this.options.imagePrefix : ''}${filenameHash}`;
    const imageFilename = `${this.options.imagePrefix ? this.options.imagePrefix : ''}${filenameHash}.${this.options.extension}`;
    const imageNameData = new ImageNameData();
    imageNameData.filenamePrefix = filenamePrefix;
    imageNameData.extension = this.options.extension;
    imageNameData.imageFileName = imageFilename;
    imageNameData.imageDir = PlantumlSnippetConverter
        .mergePathSegments(this.options.workingDir, this.options.imagePath);
    imageNameData.relativeToRoot = PlantumlSnippetConverter
        .mergePathSegments(this.options.workingDir, this.options.imagePath, imageFilename);
    imageNameData.relativeToWorkDir = PlantumlSnippetConverter
        .mergePathSegments( './', this.options.imagePath, imageFilename);
    return imageNameData;
  }

  /**
   *
   * @param {string} mdPumlSnippet
   * @param {ImageNameData} imageNameData new image path data to replace an existing one or insert fresh
   * @return {string} mdPumlSnippet with image link at the end
   */
  static #updateImageLink(mdPumlSnippet, imageNameData) {
    let outputMd;

    const imageLink = (path, isNew) => `\n\n![](${path})${isNew ? '\n\n' : ''}`;

    const hasImageLink = MdPumlMatchers.imageLinkMatcher.test(mdPumlSnippet);
    if (hasImageLink) {
      outputMd = mdPumlSnippet.trimEnd()
          .replace(MdPumlMatchers.imageLinkMatcher, imageLink(imageNameData.relativeToWorkDir.trim(), false));
    } else {
      outputMd = mdPumlSnippet.trimEnd() + imageLink(imageNameData.relativeToWorkDir.trim(), true);
    }

    return outputMd;
  }

  /**
   * Extracts the file path reference from an markdown plantuml snippet which is followed by an image link
   * <p>The following are valid inputs:</p>
   * ~~~
   *      <details>
   *        <summary>Click to expand the puml definition!</summary>
   *
   *      ```plantuml
   *      @startuml
   *
   *      start
   *
   *      if (3. Graphviz installed?) then (yes)
   *        :process all\ndiagrams;
   *      else (no)
   *        :process only
   *        __sequence__ and __activity__ diagrams;
   *      endif
   *      stop
   *
   *      @enduml
   *      ```
   *
   *      </details>
   *
   *      ![](3333638a3649518f7ab5edab88b22c16.jpg)
   *
   * ~~~
   *  or, <br/>
   * <pre><code>
   * ~~~
   *     ```plantuml
   *     @startuml
   *     :2. Hello world*!!!!*;
   *     :This is defined on
   *     several **lines**;
   *     @enduml
   *      ```
   *     ![](output_165872890353333344.png)
   * ~~~
   * </code></pre>
   *
   * @param {string} mdPumlSnippetWithImageLink markdown plantuml snippet with image link or none.
   * @return {ImageNameData | undefined}
   */
  static extractPathFromRefLink(mdPumlSnippetWithImageLink) {
    const matcher = MdPumlMatchers.resetAndGetImageLinkNamePathExtesionGroups();
    const matchResult = matcher.exec(mdPumlSnippetWithImageLink);
    let imageNameData;
    if (matchResult?.groups) {
      imageNameData = new ImageNameData();
      const dottedExtensionMatch = matchResult?.groups?.extension;
      imageNameData.extension = dottedExtensionMatch.replace(/^./, '');
      imageNameData.filenamePrefix = matchResult?.groups?.filenamePrefix;
      imageNameData.imageFileName = `${imageNameData.filenamePrefix}${dottedExtensionMatch}`;
      imageNameData.imageDir = matchResult.groups?.filePath;
      imageNameData.relativeToRoot = this.mergePathSegments(imageNameData.imageDir, imageNameData.imageFileName);
      imageNameData.relativeToWorkDir = imageNameData.relativeToRoot;
    }

    return imageNameData;
  }

  /**
   *
   * @param {string} pioneer
   * @param {...string} followers
   * @return {string} combined path string
   */
  static mergePathSegments(pioneer, ...followers) {
    const mergedFollowers = followers.reduce(
        (merged, current) => PlantumlSnippetConverter.mergeTwoPathSegments(merged, current),
    );
    return PlantumlSnippetConverter.mergeTwoPathSegments(pioneer, mergedFollowers);
  }

  /**
   *
   * @param {string} pioneer
   * @param {string} follower
   * @return {string | *} combined path string
   */
  static mergeTwoPathSegments(pioneer, follower) {
    const dirSeperator = '/';
    let merged;
    if (pioneer) {
      const endSeperatorStrip = new RegExp(`${RegExUtils.escapeRegExChars(dirSeperator)}$`);
      const startSeperatorStrip = new RegExp(`\^\.?${RegExUtils.escapeRegExChars(dirSeperator)}`);
      merged = pioneer;
      merged = follower ?
          `${pioneer.replace(endSeperatorStrip, '')}${dirSeperator}${follower.replace(startSeperatorStrip, '')}` :
          merged;
    } else {
      merged = follower;
    }
    return merged;
  }
  // eslint-disable-next-line valid-jsdoc,require-jsdoc
  static #generateImageDir(dir) {
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
  }
}

module.exports = {
  PlantumlSnippetConverter,
  ImageNameData,
};
