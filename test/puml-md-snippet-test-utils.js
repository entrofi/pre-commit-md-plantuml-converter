const CollapsibleSnippet = require('../src/collapsible-snippet');

const plainSnippet = `\`\`\`plantuml\n@startuml\n\nstart\n\nif (3. Graphviz installed?) then (yes)\n  :process all\\ndiagrams;\nelse (no)\n  :process only\n  __sequence__ and __activity__ diagrams;\nendif\n\nstop\n\n@enduml\n\`\`\``;
const imageLinkHardCode = '![](./gen_docs/assets/puml/test_3333638a3649518f7ab5edab88b22c16.png)';

const getPlainSnippetWithLink = (plainSnippet, imageLink) => {
  return `${plainSnippet}${imageLink ? '\n' + imageLink : ''}`;
};

const getSnippetWithDetails = (plainSnippet, imageLink) => {
  const snippetWithLink = getPlainSnippetWithLink(plainSnippet, imageLink);
  return CollapsibleSnippet.makeCollapsible(snippetWithLink);
};

module.exports = {
  plainSnippet,
  imageLinkHardCode,
  getPlainSnippetWithLink,
  getSnippetWithDetails,
};
