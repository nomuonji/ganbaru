import { createReadStream } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { verifyGanbaruChannel } from './verify-animation-factory-channel.mjs';

function option(flag) {
  const index = process.argv.indexOf(flag);
  return index < 0 ? null : process.argv[index + 1];
}

async function main() {
  if (process.env.ANIMATION_FACTORY_UPLOAD_MODE !== 'private_only' ||
      process.env.ANIMATION_FACTORY_REVIEW_CONFIRMED !== 'true') {
    throw new Error('Private-only upload requires a reviewed video and explicit confirmation');
  }
  const mp4 = option('--mp4');
  const metadataFile = option('--metadata');
  const receipt = option('--receipt');
  const format = option('--format');
  const audience = process.env.ANIMATION_FACTORY_MADE_FOR_KIDS;
  if (!['true', 'false'].includes(audience)) {
    throw new Error('Explicit made-for-kids declaration is required');
  }
  if (!mp4 || !metadataFile || !receipt || !['footage-first', 'standard'].includes(format))
    throw new Error('Require --mp4 --metadata --receipt --format=footage-first|standard');
  if ((await stat(mp4)).size <= 0) throw new Error('Empty MP4');
  const spec = JSON.parse(await readFile(metadataFile, 'utf8'));
  if (spec.demoOnly === true || /(^demo|smoke|fixture|test)/i.test(spec.id || spec.meta?.id || ''))
    throw new Error('Demo/test productions must not be uploaded');

  const title = format === 'footage-first' ? spec.title : spec.meta?.title;
  if (!title || typeof title !== 'string') throw new Error('Production title missing');
  const credits = format === 'footage-first'
    ? (spec.sources || []).map(s => [s.credit || s.author, s.sourcePage, s.license].filter(Boolean).join(' | '))
    : (spec.meta?.credits || []);
  if (format === 'footage-first' && (!credits.length || !credits.every(Boolean)))
    throw new Error('Source credits missing');
  const videoDescription = [
    format === 'footage-first' ? (spec.licenseStatement || '') : (spec.meta?.description || ''),
    ...credits,
    'Produced with Animation Factory'
  ].filter(Boolean).join('\n\n').slice(0, 4900);

  // Write the intent BEFORE initiating an upload. Never auto-retry an unknown response.
  const channel = await verifyGanbaruChannel();
  const base = { stage: 'upload_started', channelId: channel.id,
    productionId: spec.id || spec.meta?.id, source: 'nomuonji/animation-factory',
    startedAt: new Date().toISOString() };
  await writeFile(receipt, JSON.stringify(base, null, 2), { flag: 'wx', mode: 0o600 });
  try {
    const inserted = await channel.youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: { title: title.slice(0, 100), description: videoDescription,
          categoryId: '22', defaultLanguage: 'ja' },
        status: { privacyStatus: 'private', selfDeclaredMadeForKids: audience === 'true' }
      },
      media: { mimeType: 'video/mp4', body: createReadStream(mp4) }
    });
    const videoId = inserted.data.id;
    if (!videoId) throw new Error('Upload returned no video ID');
    const response = await channel.youtube.videos.list({
      part: ['snippet', 'status'], id: [videoId]
    });
    const item = response.data.items?.[0];
    if (item?.snippet?.channelId !== channel.id || item?.status?.privacyStatus !== 'private') {
      throw new Error('Uploaded video ownership/privacy verification failed');
    }
    const finished = { ...base, stage: 'uploaded_private', videoId,
      finishedAt: new Date().toISOString() };
    await writeFile(receipt, JSON.stringify(finished, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({stage:'uploaded_private', channelId:channel.id, videoId}));
  } catch {
    await writeFile(receipt, JSON.stringify({...base,stage:'upload_unknown',
      note:'Inspect YouTube Studio before retrying; the upload may have succeeded'}, null, 2),
      { mode: 0o600 });
    throw new Error('Upload state unknown; do not retry until YouTube Studio reconciliation');
  }
}

main().catch(err => {
  console.error(err?.message || 'YouTube upload failed');
  process.exitCode = 1;
});
