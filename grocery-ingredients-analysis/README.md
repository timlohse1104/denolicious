# Grocery ingredients analysis

This is a project to analyse the ingredients of grocery ingredients label images of german products. The goal is to extract the ingredients from the images and to classify them.

## Law
German grocery ingredients labelling law: https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:02011R1169-20180101&from=DE#tocId14

## Process

1. Put grocery ingredients label images in `ocr-input` folder
2. Run `deno run start-ocr.ts` to extract the ingredients from the images and save them in `ocr-output` folder
3. Run `deno run start-classification.ts` to classify the ocr-output files and save the results in `classification-output` folder
