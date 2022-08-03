const CollapsibleSnippet = require('../src/collapsible-snippet');

const expectedCollapsibleTpl = (content, appenditure) => `
<details>
  <summary>Click to expand the puml definition!</summary>

${content}

</details>

${appenditure}
`;
describe( 'Generates a collapsibe snippet', () => {
  const sampleContent = `\n\`\`\`plantuml
@startuml
:2. Hello world*!!!!*;
:This is defined on
several **lines**;
@enduml
\`\`\`\n\n`;

  const sampleAppenditure = `![](output_1658728903544.png)`;


  test('makeCollapsible should generate the correct output', () => {
    const content = sampleContent;
    const appenditure = sampleAppenditure;
    const inputPumlSnippet = `${content}\n${appenditure}`;

    expect(CollapsibleSnippet.makeCollapsible(inputPumlSnippet))
        .toBe(expectedCollapsibleTpl(content.trim(), appenditure));
  });

  test('makeCollapsible should generate the correct output even with additional \\n chars', () => {
    const content = sampleContent;
    const appenditure = sampleAppenditure;
    const inputPumlSnippet = `${content}\n\n\n${appenditure}\n\n\n\r`;

    expect(CollapsibleSnippet.makeCollapsible(inputPumlSnippet))
        .toBe(expectedCollapsibleTpl(content.trim(), appenditure));
  });
});
