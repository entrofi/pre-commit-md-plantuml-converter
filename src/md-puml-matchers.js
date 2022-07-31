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
     * Matches the sole filename (i.e. without extension) and the extension of the file in <filePath> and <extension>
     *     regex named groups. Note that it does not look up for filename validity.
     * @type {RegExp}
     */
  static imageNameAndExtension = /(?<filePath>.*)(?<extension>\.[0-9a-z]+){1}/gm;
}

module.exports = MdPumlMatchers;
