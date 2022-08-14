const MdPumlMatchers = require('../src/md-puml-matchers');
const PumlMdTestUtil = require('./puml-md-snippet-test-utils');


describe( 'MdPumlMatchers test', () => {
  test('Should match path, filename and extension in groups', () => {
    const samplePath = '/abce/dire.ctory/at somewhere b/';
    const samplePathWithDot = `.${samplePath}`;
    const filename = 'filename';
    const extension = '.png';

    const fullNameLink = `![](${samplePath}${filename}${extension})`;
    const fullNameWithDotLink = `![](${samplePathWithDot}${filename}${extension})`;

    let imageLinkNamePathExtesionGroups = MdPumlMatchers.resetAndGetImageLinkNamePathExtesionGroups();
    const fullNameMatch = imageLinkNamePathExtesionGroups.exec(fullNameLink);
    expect(fullNameMatch.groups).toBeTruthy();
    expect(fullNameMatch.groups.filePath).toBe(samplePath);
    expect(fullNameMatch.groups.filenamePrefix).toBe(filename);
    expect(fullNameMatch.groups.extension).toBe(extension);

    imageLinkNamePathExtesionGroups = MdPumlMatchers.resetAndGetImageLinkNamePathExtesionGroups();
    const fullNameWithDotMatch = imageLinkNamePathExtesionGroups.exec(fullNameWithDotLink);
    expect(fullNameWithDotMatch.groups).toBeTruthy();
    expect(fullNameWithDotMatch.groups.filePath).toBe(samplePathWithDot);
    expect(fullNameWithDotMatch.groups.filenamePrefix).toBe(filename);
    expect(fullNameWithDotMatch.groups.extension).toBe(extension);
  });

  test('markdownPlantumlSnippetMatcher should match plain plantuml snippet with link', () => {
    const snippetWithLink = PumlMdTestUtil.getPlainSnippetWithLink(
        PumlMdTestUtil.plainSnippet,
        PumlMdTestUtil.imageLinkHardCode);
    const match = MdPumlMatchers.resetAndGetMarkdownPlantumlSnippetMatcher().exec(snippetWithLink);
    expect(match).toBeTruthy();
    expect(match[0]).toBe(snippetWithLink.trim());
    expect(match.groups.link).toBe(PumlMdTestUtil.imageLinkHardCode);
    expect(match.groups.plantumlSnippet).toBe(PumlMdTestUtil.plainSnippet);
  });

  test('markdownPlantumlSnippetMatcher should match plain plantuml snippet without link', () => {
    const snippetWithoutLink = PumlMdTestUtil.getPlainSnippetWithLink(
        PumlMdTestUtil.plainSnippet,
        undefined);
    const match = MdPumlMatchers.resetAndGetMarkdownPlantumlSnippetMatcher().exec(snippetWithoutLink);
    expect(match).toBeTruthy();
    expect(match[0]).toBe(snippetWithoutLink.trimStart());
    expect(match.groups.link).toBeFalsy();
    expect(match.groups.plantumlSnippet).toBe(PumlMdTestUtil.plainSnippet);
  });

  test('markdownPlantumlSnippetMatcher should match plantuml snippet with details', () => {
    const snippetWithoutLink = PumlMdTestUtil.getSnippetWithDetails(
        PumlMdTestUtil.plainSnippet,
        PumlMdTestUtil.imageLinkHardCode);
    const match = MdPumlMatchers.resetAndGetMarkdownPlantumlSnippetMatcher().exec(snippetWithoutLink);
    expect(match).toBeTruthy();
    expect(match[0]).toBe(snippetWithoutLink.trim());
    expect(match.groups.link).toBe(PumlMdTestUtil.imageLinkHardCode);
    expect(match.groups.detailsBeginning).toBeTruthy();
    expect(match.groups.detailsEnd).toBeTruthy();
    expect(match.groups.plantumlSnippet).toBe(PumlMdTestUtil.plainSnippet);
  });
});
