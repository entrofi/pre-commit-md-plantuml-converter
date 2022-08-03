/**
 * Utility class which collects regular expressions to used to match different blocks of plantuml snippets in a markdown
 * file.
 */
class MdPumlMatchers {
  /**
     * Regular expression to match image links in a markdown. </br>
     * Note that this matcher starts with a new line match to ensure proper links.
     * Eg: the following is matched by this matcher.
     * <code>
     *
     *     ![](someimage)
     * </code>
     * @type {RegExp}
     */
  static imageLinkMatcher = /(\n*\!\[.*\]\(.*\))/;

  /**
     * Matches the sole filename (i.e. without extension) and the extension of the file in <filePath> and <extension>
     *     regex named groups in a markdown image link.
     * @type {RegExp}
     */
  static imageLinkNameAndExtension = /(?<=\!\[.*\]\()(?<filePath>.*)(?<extension>\.[0-9a-z]+)(?=\))/gm;

  /**
   *
   * @return {RegExp} see {@link imageLinkNameAndExtension}
   */
  static resetAndGetImageLinkNameAndExtension() {
    MdPumlMatchers.imageLinkNameAndExtension.lastIndex = 0;
    return MdPumlMatchers.imageLinkNameAndExtension;
  }

  /**
   * Matches file path, filename without extension and extension into dedicated groups
   * @type {RegExp}
   */
  static imageLinkNamePathExtesionGroups = /(?<=\!\[\]\()(?<filePath>(.*\/)*)(?<filenamePrefix>.*)(?<extension>\.[0-9a-z]+)(?=\))/gm;

  /**
   *
   * @return {RegExp} see {@link imageLinkNamePathExtesionGroups}
   */
  static resetAndGetImageLinkNamePathExtesionGroups() {
    MdPumlMatchers.imageLinkNamePathExtesionGroups.lastIndex = 0;
    return MdPumlMatchers.imageLinkNamePathExtesionGroups;
  }

  /**
     * Matches the sole filename (i.e. without extension) and the extension of the file in <filePath> and <extension>
     *     regex named groups. Note that it does not look up for filename validity.
     * @type {RegExp}
     */
  static imageNameAndExtension = /(?<filePath>.*)(?<extension>\.[0-9a-z]+){1}/gm;

  /**
   *
   * @return {RegExp} see {@link imageNameAndExtension}
   */
  static resetAndGetImageNameExtension() {
    MdPumlMatchers.imageNameAndExtension.lastIndex = 0;
    return MdPumlMatchers.imageNameAndExtension;
  }

  /**
   * Matches plantuml snippets in markdowns either in the form of a collapsible or plain with groups:
   * <ol>
   *     <li>detailsBeginning</li>
   *     <li>plantumlSnippet</li>
   *     <li>linkPlain: if there is any</li>
   *     <li>detailsEnd</li>
   *     <li>linkDetails: if there is any</li>
   * </ol>
   * @type {RegExp}
   */
  static markdownPlantumlSnippetMatcher = /((?<detailsBeginning>(<details>\s*<summary>)([\s\S]*?(?=<\/summary)(<\/summary>)))([\s\S]*?(?<!`{3}plantuml)))?(?<plantumlSnippet>(`{3}plantuml)[\s\S]*?(@startuml)[\s\S]*?(?=`{3})(`{3})){1}(([\s]*?(?=<\/details))(?<detailsEnd>(<\/details>)))?(\s)*(?<link>(\!\[.*\]\(.*\)))?/gm;

  /**
   *
   * @return {RegExp} see {@link markdownPlantumlSnippetMatcher}
   */
  static resetAndGetMarkdownPlantumlSnippetMatcher() {
    MdPumlMatchers.markdownPlantumlSnippetMatcher.lastIndex = 0;
    return MdPumlMatchers.markdownPlantumlSnippetMatcher;
  }
}

module.exports = MdPumlMatchers;
