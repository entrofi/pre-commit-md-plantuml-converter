const PlantumlSnippetConverter = require('../src/plantuml-snippet-converter').PlantumlSnippetConverter;
const ImageNameData = require('../src/plantuml-snippet-converter').ImageNameData;
const fs = require('fs');
const crypto = require('crypto');
const {PassThrough} = require('stream');

const samplePlantuml = `@startuml
if (color?) is (<color:red>red) then
:print red;
else
:print not red;
@enduml`;
const sampleNoLinkInputSnippet = `\`\`\`plantuml
${samplePlantuml}
\`\`\``;

const sampleImgFilenamePrefix = crypto.createHash('md5').update(`${samplePlantuml}`).digest('hex');
const expectedImagePathWith = (extension, imageFileNamePrefix, savePath) => `${savePath? savePath + '/': ''}${imageFileNamePrefix}.${extension}`;

const getImageNameData = (filenamePrefix, imageDir, relativeToRootPath, relativeToWorkDirPath, extension) => {
  const imageFilename = `${filenamePrefix}.${extension}`;
  return new ImageNameData(filenamePrefix, imageDir, `${relativeToRootPath.replace(/\/$/, '')}/${imageFilename}`,
      `${relativeToWorkDirPath.replace(/\/$/, '')}/${imageFilename}`, `${extension}`, `${imageFilename}`);
};

const getImageNameDataWith = (imageDir, extension, relativeToRootPath, relativeToWorkDirPath ) => {
  return getImageNameData(sampleImgFilenamePrefix, imageDir, relativeToRootPath, relativeToWorkDirPath, extension);
};

const sampleMDOutputTplWith = (extension, imageName, savePath, isNew= true) => `
<details>
  <summary>Click to expand the puml definition!</summary>

${sampleNoLinkInputSnippet}

</details>

![](${expectedImagePathWith(extension, imageName, savePath)})${isNew ? '\n\n' : ''}`;

const testImagePath = '.tmp/assets/puml';

const snippetConverterPNG = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
    {extension: 'png', workingDir: '.', imagePath: testImagePath});
const snippetConverterEPS = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
    {extension: 'eps', workingDir: '.', imagePath: testImagePath});
const snippetConverterSVG = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
    {extension: 'svg', workingDir: '.', imagePath: testImagePath});

describe('PlantumlSnippetConverter tests', () => {
  beforeEach(() => {
    fs.createWriteStream = jest.fn().mockReturnValueOnce(new PassThrough());
  });

  test('Converts markdown plantuml snippet with image path', () => {
    expect(snippetConverterPNG.convert()).toBe(sampleMDOutputTplWith('png', sampleImgFilenamePrefix, `./${testImagePath}`));
  });

  test('Converts markdown plantuml snippet with image path in a sub directory', () => {
    const imagePrefix = 'test';
    const snippetConverter = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
        {extesion: 'png', workingDir: 'subdir/', imagePath: testImagePath, imagePrefix: 'test'});
    expect(snippetConverter.convert()).toBe(sampleMDOutputTplWith('png', `${imagePrefix}${sampleImgFilenamePrefix}`, `./${testImagePath}`));
  });

  test('Converts markdown plantuml snippet without image path', () => {
    const snippetConverterWOPath = new PlantumlSnippetConverter(sampleNoLinkInputSnippet,
        {extension: 'png', workingDir: '.'});
    expect(snippetConverterWOPath.convert()).toBe(sampleMDOutputTplWith('png', sampleImgFilenamePrefix, '.'));
  });

  test('Converts markdown plantuml snippet without save path for snippet with existing image', () => {
    const trickySnippet = `
\`\`\`plantuml
@startuml
if (color?) is (<color:red>red) then
:print red;
else
:print not red;
@enduml
\`\`\`\n
![](output_1658728903544.png)

`;
    const snippetConverterWOPath = new PlantumlSnippetConverter(trickySnippet,
        {extension: 'png'});
    expect(snippetConverterWOPath.convert())
        .toBe(
            sampleMDOutputTplWith('png', 'output_1658728903544', undefined, false),
        );
  });

  test('generateImage() generates a png image with correct path', () => {
    const imagePath = snippetConverterPNG.generateImage();
    expect(imagePath).toMatchObject(getImageNameDataWith(`./${testImagePath}`, 'png', `./${testImagePath}`, `./${testImagePath}`));
  });

  test('generateImage() generates a eps image with correct path', () => {
    const imagePath = snippetConverterEPS.generateImage();
    expect(imagePath).toMatchObject(getImageNameDataWith(`./${testImagePath}`, 'eps', `./${testImagePath}`, `./${testImagePath}`));
  });

  test('generateImage() generates a svg image with correct path', () => {
    const imagePath = snippetConverterSVG.generateImage();
    expect(imagePath).toMatchObject(getImageNameDataWith(`./${testImagePath}`, 'svg', `./${testImagePath}`, `./${testImagePath}`));
  });


  test('Should get the existing path reference in the snippet', () => {
    const imageNamePrefix = 'dummyImage';
    const imagePath = `myDummy/path/imagedir/`;
    const plantUmlWithPngLink = sampleMDOutputTplWith('png', `${imagePath}${imageNamePrefix}`);
    expect(PlantumlSnippetConverter.extractPathFromRefLink(plantUmlWithPngLink))
        .toMatchObject(getImageNameData(imageNamePrefix, imagePath, imagePath, imagePath, 'png' ));
  });

  test('Should replace relative path references correctly', () => {
    const snippetWithRelImagePath = `# A collapsible section with markdown\n<details>\n  <summary>Click to expand the puml definition!</summary>\n\n\`\`\`plantuml\n@startuml\nHasan -> Bob: Esenlikler Bob cugum\nBob --> Hasan: How are you\nBob --> Alice: Hello Alice\n\nAlice -> Bob: Another authentication Request\nAlice <-- Bob: Another authentication Response\n@enduml\n\`\`\`\n</details>\n\n![](./docs/assets/puml/README_b8115805a361deae478ef76dc2e0ab32.png)`;
    const snippetConverterWOPath = new PlantumlSnippetConverter(snippetWithRelImagePath,
        {extension: 'png', workingDir: '.', imagePath: './docs/assets/puml', imagePrefix: 'README_'});
    expect(snippetConverterWOPath.convert()).toBe(snippetWithRelImagePath);
  });

  test('mergePathSegments should merge correctly', () => {
    const inputs = [
      {pioneer: '.', follower: '', expectedResult: '.'},
      {pioneer: './', follower: '', expectedResult: './'},
      {pioneer: '.', follower: undefined, expectedResult: '.'},
      {pioneer: '.', follower: '/', expectedResult: `./`},
      {pioneer: './', follower: '/', expectedResult: `./`},
      {pioneer: './', follower: '/abc/def', expectedResult: `./abc/def`},
      {pioneer: 'pioneer/', follower: '/abc/def', expectedResult: `pioneer/abc/def`},
      {pioneer: '.pioneer/', follower: '/abc/def', expectedResult: `.pioneer/abc/def`},
      {pioneer: '/pioneer/', follower: '/abc/def', expectedResult: `/pioneer/abc/def`},
      {pioneer: './pioneer/', follower: '/abc/def', expectedResult: `./pioneer/abc/def`},
      {pioneer: './pioneer/', follower: './abc/def', expectedResult: `./pioneer/abc/def`},
      {pioneer: '/pioneer/', follower: undefined, expectedResult: `/pioneer/`},
      {pioneer: undefined, follower: undefined, expectedResult: undefined},
      {pioneer: undefined, follower: 'abc', expectedResult: `abc`},
    ];
    inputs.forEach((i) => {
      expect(PlantumlSnippetConverter.mergePathSegments(i.pioneer, i.follower)).toBe(i.expectedResult);
    });
  });
});
