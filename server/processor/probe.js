import { exec } from 'server/utils';

// TODO images, video

const SUPPORTED_MEDIA_FORMATS = [ 'mp3' ];

async function probeMediaFileMeta(filePath) {
  const { format } = JSON.parse(await exec(`ffprobe -v quiet -of json -show_format -i ${filePath}`).catch((e) => {
    if (e.code !== 1) throw e;
    return e.stdout;
  }));

  if (!format || !SUPPORTED_MEDIA_FORMATS.includes(format.format_name)) return null;

  return {
    bitRate: parseInt(format.bit_rate, 10),
    duration: parseFloat(format.duration, 10),
  };
}

export default async function probeMetadata(filePath) {
  const mediaMeta = await probeMediaFileMeta(filePath);
  if (mediaMeta) return mediaMeta;

  return {};
}
