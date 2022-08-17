const {exec} = require('child_process');
const fs = require('fs');


// TODO convert this to unit test
describe('convert-plantuml cli integration test', () => {
  test('should convert', (done) => {
    const file = `test/test.md`;
    const extension = 'png';
    const filePath = 'test';
    const imgRootDir = 'assets';
    const imageDir = `${imgRootDir}/uml/`;
    const prefixForImages = '';
    const outputFile = 'test/test_converted.md';
    exec(
        `node ./src/convert-plantuml.js run '${file}' -e '${extension}' -f '${filePath}' -i '${imageDir}' -p '${prefixForImages}' -o ${outputFile} `,
        (error, stdout, stderr) => {
          expect(stdout).toBeFalsy();
          expect(stderr).toBeFalsy();
          fs.rmSync(outputFile);
          fs.rmSync(`test/${imgRootDir}`, {recursive: true});
          done();
        },

    );
  });
});
