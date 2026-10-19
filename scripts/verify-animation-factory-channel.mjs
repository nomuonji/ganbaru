import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

function secret(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing Actions secret: ' + name);
  return value;
}

export async function verifyGanbaruChannel() {
  const auth = new google.auth.OAuth2(
    secret('YOUTUBE_CLIENT_ID'),
    secret('YOUTUBE_CLIENT_SECRET')
  );
  auth.setCredentials({ refresh_token: secret('YOUTUBE_REFRESH_TOKEN') });
  const yt = google.youtube({ version: 'v3', auth });
  const response = await yt.channels.list({ part: ['id', 'snippet'], mine: true });
  const channels = response.data.items || [];
  if (channels.length !== 1 || !channels[0].id) {
    throw new Error('OAuth did not resolve to exactly one owned YouTube channel');
  }
  const channel = channels[0];
  const status = JSON.parse(readFileSync('data/video-status.json', 'utf8'));
  const previousIds = [...new Set((status.history || []).map(v => v.videoId)
    .filter(v => typeof v === 'string' && /^[A-Za-z0-9_-]{11}$/.test(v)))].slice(0, 40);
  if (!previousIds.length) throw new Error('Historical Ganbaru uploads were not found');
  const previousVideos = await yt.videos.list({ part: ['snippet'], id: previousIds });
  const sameChannelVideo = (previousVideos.data.items || [])
    .find(v => v.snippet?.channelId === channel.id);
  if (!sameChannelVideo) {
    throw new Error('OAuth channel is NOT proven to own the historical Today\'s Ganbaru uploads; refusing to publish');
  }
  return {
    id: channel.id,
    title: channel.snippet?.title || '',
    verifiedAgainstVideoId: sameChannelVideo.id,
    youtube: yt
  };
}

if (process.argv.includes('--verify')) {
  verifyGanbaruChannel().then(c => {
    console.log(JSON.stringify({ stage: 'verified', channelId: c.id,
      channelTitle: c.title, verifiedAgainstVideoId: c.verifiedAgainstVideoId }));
  }).catch(err => {
    console.error('Ganbaru OAuth channel check failed: ' + (err?.message || 'unknown error').replace(/[\r\n]+/g, ' '));
    process.exitCode = 1;
  });
}
