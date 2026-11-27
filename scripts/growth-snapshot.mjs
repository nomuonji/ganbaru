import { verifyGanbaruChannel } from './verify-animation-factory-channel.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

async function main() {
  const { id, youtube } = await verifyGanbaruChannel();
  const response = await youtube.channels.list({ part: ['id','snippet','statistics','contentDetails'], id:[id] });
  const channel = response.data.items?.[0];
  if (channel?.id !== id) throw new Error('Channel mismatch');
  const uploads = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error('Uploads playlist missing');
  const items = [];
  let pageToken;
  // Bounded recent public inventory; never publish private/unlisted metadata.
  for (let i=0; i<3; i++) {
    const page = await youtube.playlistItems.list({part:['contentDetails'], playlistId:uploads,maxResults:50,pageToken});
    const ids = (page.data.items||[]).map(x=>x.contentDetails?.videoId).filter(Boolean);
    if (ids.length) {
      const videos = await youtube.videos.list({part:['snippet','statistics','status','contentDetails'],id:ids});
      for (const v of videos.data.items||[]) {
        if (v.snippet?.channelId !== id || v.status?.privacyStatus !== 'public') continue;
        items.push({videoId:v.id,title:v.snippet.title,publishedAt:v.snippet.publishedAt,duration:v.contentDetails?.duration,
          views:v.statistics?.viewCount??null,likes:v.statistics?.likeCount??null,comments:v.statistics?.commentCount??null});
      }
    }
    pageToken=page.data.nextPageToken;
    if (!pageToken) break;
  }
  const statistics=channel.statistics||{};
  const snapshot={schemaVersion:1,collectedAt:new Date().toISOString(),channelId:id,channelTitle:channel.snippet?.title,
    publicStatistics:{subscribers:statistics.hiddenSubscriberCount?null:statistics.subscriberCount??null,views:statistics.viewCount??null,videoCount:statistics.videoCount??null},
    recentPublicVideos:items,limitations:['Public Data API counts only; not Studio Earn qualified views or watch hours','Recent uploads bounded to 150 playlist items; not full channel inventory','Subscriber count may be rounded','Duration alone does not determine Shorts status'],studioEarn:null};
  await mkdir('growth',{recursive:true});
  await writeFile('growth/public-snapshot.json',JSON.stringify(snapshot,null,2)+'\n');
  console.log('Verified public channel snapshot written; public videos: '+items.length);
}
main().catch(()=>{console.error('Public snapshot failed; verify OAuth, API quota and channel ownership in a private environment.');process.exitCode=1;});
