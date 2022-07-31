const PlantumlSnippetConverter = require('../src/plantuml-snippet-converter');
const fs = require('fs');

const sampleNoLinkInputSnippet = `\`\`\`plantuml
@startuml
if (color?) is (<color:red>red) then
:print red;
else
:print not red;
@enduml
\`\`\``;

const sampleImageFilename = 'd723db8c7063fdd0cc764a8f46fbd3ad';
const expectedImagePathWith = (extension, imageName, savePath) => `${savePath? savePath + '/': ''}${imageName}.${extension}`;

const sampleMDOutputTplWith = (extension, imageName, savePath) => `
<details>
  <summary>Click to expand the puml definition!</summary>

\`\`\`plantuml
@startuml
if (color?) is (<color:red>red) then
:print red;
else
:print not red;
@enduml
\`\`\`

</details>

![](${expectedImagePathWith(extension, imageName, savePath)})`;

const testImageSavePath = './.tmp/assets/puml';

const snippetConverterPNG = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
    {extension: 'png', imagePath: testImageSavePath});
const snippetConverterEPS = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
    {extension: 'eps', imagePath: testImageSavePath});
const snippetConverterSVG = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
    {extension: 'svg', imagePath: testImageSavePath});

describe('PlantumlSnippetConverter tests', () => {
  afterAll(() => {
    fs.rmSync(testImageSavePath, {recursive: true, force: true});
    fs.rmSync();
  });

  test('Converts markdown plantuml snippet with save path', () => {
    expect(snippetConverterPNG.convert()).toBe(sampleMDOutputTplWith('png', sampleImageFilename, testImageSavePath));
  });

  test('Converts markdown plantuml snippet without save path', () => {
    const snippetConverterWOPath = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
        {extension: 'png'});
    expect(snippetConverterWOPath.convert()).toBe(sampleMDOutputTplWith('png', sampleImageFilename));
  });

  test('Converts markdown plantuml snippet without save path for', () => {
    const trickySnippet = `
\`\`\`plantuml
@startuml
if (color?) is (<color:red>red) then
:print red;
else
:print not red;
@enduml
\`\`\`
![](output_1658728903544.png)

`;
    const snippetConverterWOPath = new PlantumlSnippetConverter(trickySnippet,
        {extension: 'png'});
    expect(snippetConverterWOPath.convert()).toBe(sampleMDOutputTplWith('png', 'output_1658728903544'));
  });

  test('generateImage() generates a png image with correct path', () => {
    const imagePath = snippetConverterPNG.generateImage();
    console.log(`image path: ${imagePath}`);
    expect(imagePath).toBe(expectedImagePathWith('png', sampleImageFilename, testImageSavePath));
  });

  test('generateImage() generates a eps image with correct path', () => {
    const imagePath = snippetConverterEPS.generateImage();
    console.log(`image path: ${imagePath}`);
    expect(imagePath).toBe(expectedImagePathWith('eps', sampleImageFilename, testImageSavePath));
  });

  test('generateImage() generates a svg image with correct path', () => {
    const imagePath = snippetConverterSVG.generateImage();
    console.log(`image path: ${imagePath}`);
    expect(imagePath).toBe(expectedImagePathWith('svg', sampleImageFilename, testImageSavePath));
  });


  test('Should get the existing path reference in the snippet', () => {
    const plantUmlWithPngLink = sampleMDOutputTplWith('png', 'myDummy/path');
    expect(PlantumlSnippetConverter.extractPathFromRefLink(plantUmlWithPngLink))
        .toBe(expectedImagePathWith('png', 'myDummy/path'));
  });
});
