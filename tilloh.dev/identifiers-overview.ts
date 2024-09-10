/*
 * This file is a Deno script to get all identifiers from the TillohDev API.
 *
 * To run this file, Deno should be installed in your system.
 * You need to run this command: deno run --env --allow-env --allow-net identifiers-overview.ts
 * The environment variables TILLOHDEV_URL and TILLOHDEV_ADMIN_TOKEN should be set in your system.
 */

import { FetchResponseType } from '../shared/types/fetch-response.type.ts';
import { IdentifierType } from '../shared/types/identifiers.type.ts';
import { createHeaders } from '../shared/utils/fetching.ts';

const helpArgProvided = Deno.args.find((arg) => arg === '--help');
const url = Deno.env.get('TILLOHDEV_URL') || '';
const adminToken = Deno.env.get('TILLOHDEV_ADMIN_TOKEN') || '';

async function fetchIdentifiers() {
  return (
    await fetch(url, {
      method: 'GET',
      headers: createHeaders(adminToken),
    })
  ).json();
}

async function run() {
  if (helpArgProvided) return 'Run this file using: deno run --allow-env --allow-net tillohdev-identifiers-overview.ts';

  const identifiersResponse: FetchResponseType<unknown> & IdentifierType[] = await fetchIdentifiers();

  if (identifiersResponse.statusCode === 401)
    return "Unauthorized request. Please check the env variable 'TILLOHDEV_ADMIN_TOKEN'.";

  const identifiers: IdentifierType[] = identifiersResponse;

  let identifiersString = identifiers
    .map(
      (identifier) =>
        `👤 ${identifier.name} 🆔 ${identifier._id} ✨ ${new Date(identifier.created).toLocaleString(
          'DE-de'
        )} 🔧 ${new Date(identifier.updated).toLocaleString('DE-de')}\n`
    )
    .toString();

  identifiersString = identifiersString.slice(0, -2).replace(/,/g, '');

  return identifiersString;
}

console.log(await run());
