const nodePlantuml = require('node-plantuml');
const fs = require('fs');
const crypto = require('crypto');
const CollapsibleSnippet = require('./collapsible-snippet');
const MdPumlMatchers = require('./md-puml-matchers');

/**
 *
 */
class PlantumlSnippetConverter {
  #dottedExt;
  /**
   *
   * @param {string} mdPlantumlSnippet plant uml snippet to parse
   * @param {string} extension extension of the file image. Currently only png, svg, and esp are supported
   * @param {string} imagePath default relative directory to save the generated image into
   * @param {string} imagePrefix prefix to use on generated image file names.
   */
  constructor(mdPlantumlSnippet, {extension= 'png', imagePath= '', imagePrefix}) {
    this.mdPlantumSnippet = mdPlantumlSnippet;
    this.options = {extension, imagePath, imagePrefix};
    this.#dottedExt = `.${this.options.extension}`;
  }

  /**
   *
   * @return {string} markdown output to replace with plantuml snippet
   */
  convert() {
    const generatedImagePath = this.generateImage();
    let markdownOutput = this.mdPlantumSnippet;
    markdownOutput = CollapsibleSnippet.makeCollapsible(markdownOutput);
    markdownOutput = this.#updateImageLink(markdownOutput, generatedImagePath);
    return markdownOutput;
  }

  /**
   * Generates an image using the plantuml markup provided in {@link this.#mdPlantumlSnippet} and writes
   * it to the file system
   * @return {string} file save path of the generated image
   */
  generateImage() {
    const pumlMarkupMatcher = /(?<=`{3}plantuml\n)([\S\s]*?)(@enduml){1}(?=\n`{3})/;
    const plantumlMarkup = this.mdPlantumSnippet.match(pumlMarkupMatcher)[0];

    const generated = nodePlantuml.generate(plantumlMarkup, {format: this.options.extension});
    return this.#writeImageFile(generated, plantumlMarkup);
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
   * @return {string} path of the file saved
   */
  #writeImageFile(generatedOutput, plantumlMarkup) {
    const outputFilename = this.#fetchOrCreateImageName(plantumlMarkup);
    const imageDir = this.options.imagePath ? `${this.options.imagePath}/`: '';
    PlantumlSnippetConverter.#generateImageDir(imageDir);
    const outputFilePath = `${imageDir}${outputFilename}`;
    generatedOutput.out.pipe(fs.createWriteStream(outputFilePath));
    return outputFilePath;
  }

  /**
   *
   * @param {string} mdPumlSnippet
   * @param {string} imagePath new image path to replace an existing one or insert fresh
   * @return {string} mdPumlSnippet with image link at the end
   */
  #updateImageLink(mdPumlSnippet, imagePath) {
    let outputmd;

    const imageLink = (path) => `\n\n![](${path})`;

    const hasImageLink = MdPumlMatchers.imageLinkMatcher.test(mdPumlSnippet);
    if (hasImageLink) {
      const newImagePath = this.#refreshImageName(mdPumlSnippet, imagePath);
      outputmd = mdPumlSnippet.trimEnd().replace(MdPumlMatchers.imageLinkMatcher, imageLink(newImagePath.trim()));
    } else {
      outputmd = mdPumlSnippet.trimEnd() + imageLink(imagePath);
    }

    return outputmd;
  }

  /**
   *
   * @param {string} mdPumlSnippet
   * @param {string} imagePath
   * @return {string}
   */
  #refreshImageName(mdPumlSnippet, imagePath) {
    let newImagePath = imagePath;
    const extractedPath = PlantumlSnippetConverter.extractPathFromRefLink(mdPumlSnippet);

    let filenameMatchWithGroups;
    filenameMatchWithGroups = MdPumlMatchers.imageNameAndExtension.exec(newImagePath);
    filenameMatchWithGroups = filenameMatchWithGroups == null ?
        MdPumlMatchers.imageNameAndExtension.exec(newImagePath) :
        filenameMatchWithGroups;

    if (extractedPath && filenameMatchWithGroups?.groups.extension !== this.#dottedExt) {
      newImagePath = `${filenameMatchWithGroups?.groups.filename}.${this.#dottedExt}`;
    }
    return newImagePath;
  }


  // eslint-disable-next-line valid-jsdoc,require-jsdoc
  static #generateImageDir(dir) {
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
  }

  /**
   *
   * @param {string} plantumlMarkup pure plantuml markup string i.e. not a markdown snippet
   * @return {string|undefined}
   */
  #fetchOrCreateImageName(plantumlMarkup) {
    const oldImagePath = PlantumlSnippetConverter.extractPathFromRefLink(this.mdPlantumSnippet);
    let imageRef = oldImagePath;

    if (!oldImagePath || oldImagePath.match(/\.[0-9a-z]+$/i)[0] !== `.${this.options.extension}`) {
      const filenameHash = crypto.createHash('md5').update(plantumlMarkup).digest('hex');
      imageRef = `${this.options.imagePrefix ? this.options.imagePrefix : ''}${filenameHash}.${this.options.extension}`;
    }
    return imageRef;
  }

  /**
   * Extracts the file path reference from an markdown plantuml snippet which is followed by an image link
   * @param {string} mdPumlSnippetWithImageLink markdown plantuml snippet with image link or none. The following are
   * valid:<br/>
   * ```
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
   *      '
   * ```
   *  or, <br/>
   * <pre><code>
   *     ```plantuml
   *     @startuml
   *     :2. Hello world*!!!!*;
   *     :This is defined on
   *     several **lines**;
   *     @enduml
   *      ```
   *     ![](output_1658728903544.png)
   * </code></pre>
   *
   * @return {string | undefined}
   */
  static extractPathFromRefLink(mdPumlSnippetWithImageLink) {
    const filenameRegex = /(?<=!\[\]\()(?<filePath>.*)(?=\))/gm;
    const matchedResult = filenameRegex.exec(mdPumlSnippetWithImageLink);
    return matchedResult?.groups?.filePath;
  }
}

module.exports = PlantumlSnippetConverter;
