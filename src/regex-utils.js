/**
 *
 */
class RegexUtils {
  /**
     * Escapes regular expression special characters in a s tring
     * @param {string} string
     * @return {*}
     */
  static escapeRegExChars(string) {
    return string.replace(/[\\{}()|[\].*+?^$]/g, '\\$&');
  }
}

module.exports = RegexUtils;
