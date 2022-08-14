const {exec} = require('child_process');


// TODO convert this to unit test
describe('convert-plantuml cli integration test', () => {
  test('should convert', (done) => {
    const file = `test/test.md`;
    const extension = 'png';
    const filePath = 'test';
    const imageDir = 'assets/uml/';
    const prefixForImages = '';
    exec(
        `node ./src/convert-plantuml.js run '${file}' -e '${extension}' -f '${filePath}' -i '${imageDir}' -p '${prefixForImages}' -o .tmp/test_converted.md `,
        (error, stdout, stderr) => {
          expect(stdout).toBeFalsy();
          expect(stderr).toBeFalsy();
          done();
        },

    );
  });
});
