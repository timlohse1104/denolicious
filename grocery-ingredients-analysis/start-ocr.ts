/*
 * This script reads image files containing grocery ingredients in the ocr-input folder, recognizes text from them and outputs into.
 *
 * To run this file, Deno should be installed in your system.
 * You need to run this command: deno run --env --allow-env --allow-read --allow-net --allow-write start-ocr.ts
 * An .env file should be present with at least OCR_URL and OCR_TOKEN.
 */
import * as path from 'https://deno.land/std@0.169.0/path/mod.ts';

const helpArgProvided = Deno.args.find((arg) => arg === '--help');
const allowedFileExtensions = ['.png', '.jpg', '.jpeg'];
const ocrUrl: string = Deno.env.get('OCR_URL') || '';
const ocrToken: string = Deno.env.get('OCR_TOKEN') || '';

if (!ocrUrl) {
  console.error('Please provide OCR_URL in .env file.');
  Deno.exit(1);
} else if (!Deno.env.get('OCR_TOKEN')) {
  console.error('Please provide OCR_TOKEN in .env file.');
  Deno.exit(1);
}

async function executeOcr(fileData: Uint8Array, filename: string, fileExtension: string) {
  const body = new FormData();
  body.set('scale', 'true');
  body.set('isTable', 'false');
  body.set('OCREngine', '2');
  body.set('filetype', fileExtension.replace('.', '').toUpperCase());
  body.set('file', new File([fileData], filename));

  return (
    await fetch(ocrUrl, {
      method: 'POST',
      headers: {
        apikey: ocrToken,
      },
      body,
    })
  ).json();
}

async function run() {
  if (helpArgProvided)
    return 'Run this file using: deno run --env --allow-env --allow-read --allow-net --allow-write start-ocr.ts';

  console.info('📕 Reading files from ocr-input folder...');

  const inputDir = path.join('.', 'ocr-input');

  for await (const entry of Deno.readDir(inputDir)) {
    const fileExtension = path.extname(entry.name);
    if (entry.isFile && allowedFileExtensions.find((type) => type === fileExtension)) {
      const sourcePath = path.join(inputDir, entry.name);
      console.log(`\n🔍 Recognizing text from '${sourcePath}'...`);

      const fileData = await Deno.readFile(sourcePath);
      const ocrResult = await executeOcr(fileData, entry.name, fileExtension);
      if (!ocrResult.ParsedResults) {
        console.error(`❌ Error in recognizing text from '${sourcePath}'.`);
        continue;
      } else {
        console.log(`✅ Recognized text for file '${sourcePath}'.`);
      }

      console.log(`\n🔧 Creating output file for '${sourcePath}'...`);
      const outputDir = path.join('.', 'ocr-output');
      const outputFilename = `${entry.name.replace(fileExtension, '.txt')}`;
      const outputFilePath = path.join(outputDir, outputFilename);
      await Deno.writeTextFile(outputFilePath, ocrResult.ParsedResults[0].ParsedText.replace(/\\n/g, ''));
      console.log(`✅ Output file created for '${sourcePath}'.`);
    }
  }

  return '🏁 Finished OCR for all files in ocr-input folder.';
}

console.log(await run());
