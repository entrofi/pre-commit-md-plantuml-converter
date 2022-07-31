const MdPumlMatchers = require('./md-puml-matchers');

/**
 * Utility class to generate collapsible markdown blocks with image link at the end
 */
class CollapsibleSnippet {
  static #TPL_SNIPPET_PLACE_HOLDER = '@plantumlsnippet';

  static #TPL_IMAGE_LINK_PLACE_HOLDER = '@imageLink';

  static #COLLAPSE_TPL = `
<details>
  <summary>Click to expand the puml definition!</summary>

${CollapsibleSnippet.#TPL_SNIPPET_PLACE_HOLDER}

</details>

${CollapsibleSnippet.#TPL_IMAGE_LINK_PLACE_HOLDER}
`;

  // eslint-disable-next-line require-jsdoc
  static #splitAt(str, index) {
    return [str.slice(0, index), str.slice(index)];
  }


  /**
   * Makes an plantuml snippet with an image link at the end collapsible and moves the
   * image link to the end.
   * @param {string} plantumlMdSnippet
   * @return {string}
   */
  static makeCollapsible(plantumlMdSnippet) {
    const imageLinkMatcher = MdPumlMatchers.imageLinkMatcher;
    let collapsible = plantumlMdSnippet;
    if (plantumlMdSnippet.search(/(<details>)/) < 0) {
      collapsible = CollapsibleSnippet.#COLLAPSE_TPL;
      let imageLinkIndex;
      const [pumlSnippet, imageLnk] = (imageLinkIndex = plantumlMdSnippet.search(imageLinkMatcher)) > 0 ?
                CollapsibleSnippet.#splitAt(plantumlMdSnippet, imageLinkIndex) :
                [plantumlMdSnippet, ''];
      collapsible = collapsible.replace(CollapsibleSnippet.#TPL_SNIPPET_PLACE_HOLDER, pumlSnippet.trim());
      collapsible = collapsible.replace(CollapsibleSnippet.#TPL_IMAGE_LINK_PLACE_HOLDER, imageLnk.trim());
    }
    return collapsible;
  }
}

module.exports = CollapsibleSnippet;
