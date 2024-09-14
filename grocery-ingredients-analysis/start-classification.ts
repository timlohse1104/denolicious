/*
 * This script reads grocery ingredient texts from ocr-output folder and classifies the raw data using generative ai model.
 * Local or remote llm can be used for this purpose. Be sure to provide LLM_TOKEN if you are using a remote llm.
 *
 * To run this file, Deno should be installed in your system.
 * You need to run this command: deno run --env --allow-env --allow-read --allow-net --allow-write start-classification.ts
 * An .env file should be present with at least LLM_URL and optional LLM_TOKEN.
 *
 * Warning: If you are using wsl activate mirrored networking to use localhost. See https://superuser.com/questions/1848010/win11-wsl2-how-to-verify-networkingmode-mirrored-is-effective.
 */

import * as path from 'https://deno.land/std@0.169.0/path/mod.ts';
import { VeganClassificationType } from '../shared/types/classification.type.ts';

const helpArgProvided = Deno.args.find((arg) => arg === '--help');
const verboseLoggingActive = Deno.args.find((arg) => arg === '--verbose');
const allowedFileExtensions = '.txt';
const llmUrl: string = Deno.env.get('LLM_URL') || '';
const llmToken: string = Deno.env.get('LLM_TOKEN') || '';
const veganPrompt: string = Deno.env.get('LLM_VEGAN_SYSTEM_PROMPT') || '';

if (!llmUrl) {
  console.error('Please provide LLM_URL in .env file.');
  Deno.exit(1);
} else if (!llmToken) {
  console.error('Please provide LLM_TOKEN in .env file.');
  Deno.exit(1);
} else if (!veganPrompt) {
  console.error('Please provide LLM_VEGAN_SYSTEM_PROMPT in .env file.');
  Deno.exit(1);
}

async function classifyTextVegan(text: string) {
  const body = JSON.stringify({
    messages: [
      {
        role: 'system',
        content: veganPrompt,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.01,
    max_tokens: 256,
    frequency_penalty: 0.9,
    presence_penalty: 0.9,
    stream: false,
  });

  return (
    await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llmToken}`,
      },
      body,
    })
  ).json();
}

async function run() {
  if (helpArgProvided)
    return 'Run this file using: deno run --env --allow-env --allow-read --allow-net --allow-write start-classification.ts';

  console.log('📕 Reading files from ocr-output folder...');
  const inputDir = path.join('.', 'ocr-output');
  const outputDir = path.join('.', 'classification-output');

  for await (const entry of Deno.readDir(inputDir)) {
    const fileExtension = path.extname(entry.name);

    if (entry.isFile && allowedFileExtensions === fileExtension) {
      const sourcePath = path.join(inputDir, entry.name);
      if (verboseLoggingActive) console.log(`\n🔍 Classifying text from '${sourcePath}'...`);

      const fileData = await Deno.readTextFile(sourcePath);
      const classificationResult = await classifyTextVegan(fileData);

      if (!classificationResult.choices) {
        console.error(`❌ Error in classifying text from '${sourcePath}'.`);
        continue;
      } else {
        if (verboseLoggingActive) console.log(`✅ Classified text for file '${sourcePath}'.`);
      }

      if (verboseLoggingActive) console.log(`🔧 Creating output file for '${sourcePath}'...`);
      const outputFilename = `${entry.name.replace(fileExtension, '.json')}`;
      const outputFilePath = path.join(outputDir, outputFilename);
      await Deno.writeTextFile(outputFilePath, JSON.stringify(classificationResult));
      if (verboseLoggingActive) console.log(`✅ Output file created for '${sourcePath}'.`);
      const rawOutput = classificationResult?.choices[0]?.message?.content;
      const jsonSubstring = rawOutput?.substring(rawOutput?.indexOf('{'), rawOutput.lastIndexOf('}') + 1);
      if (!jsonSubstring) {
        console.log('❌ LLM sent no parsable json.');
        console.log(`rawOutput: ${rawOutput}`);
        console.log(`jsonSubstring: ${jsonSubstring}`);
        continue;
      }
      // console.log('jsonSubstring', jsonSubstring);
      const strippedJsonString = jsonSubstring?.replace(/\\n/g, '');
      // console.log('strippedJsonString', strippedJsonString);
      const outputJson: VeganClassificationType = JSON.parse(strippedJsonString);
      console.log(
        !outputJson
          ? '❌ Error in parsing json.'
          : `${outputJson?.diet === 'vegan' ? '🥬' : outputJson?.diet === 'nicht vegan' ? '🍖' : '🤷'} ${
              outputJson?.groceryType
            }: ${outputJson?.dietReason}`
      );
    }
  }
}

await run();
