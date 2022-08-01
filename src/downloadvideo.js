import { SingleBar, Presets } from 'cli-progress';
import chalk from 'chalk';
import { createWriteStream } from 'fs';
import { join } from 'path';
import fs from 'fs';
import ytdl from 'ytdl-core';

async function DownloadVideo(videolist, saveLocation) {
    let videoCount = 0;
    for(let i = 0; i < videolist.length; i++) {

        const video = videolist[i];
        const videoId = video.slice(-11);
        const videoName = videoId + '.mp4';
        const videoPath = join(saveLocation, videoName);
        if(!fs.existsSync(videoPath)) {
            await DownloadVideoFile(video, videoPath);
            videoCount++;
        }
    }
}

async function DownloadVideoFile(video, videoPath) {
    console.clear();
    console.log(chalk.green(`Downloading ${video}`));
    // download the video in best quality available (mp4)
    const videoStream = ytdl(video, {
        filter: 'audioandvideo', // filter audio and video
        quality: 'highest', // highest quality available
        format: 'mp4', // 'mp4', 'flv', 'webm', 'mkv', 'mp3'
    });
    const writeStream = createWriteStream(videoPath);
    const bar = new SingleBar({
        format: '{bar} {percentage}%',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
        stopOnComplete: true,
        clearOnComplete: true,
        stream: process.stdout,
    }, Presets.shades_grey);
    bar.start(100, 0);
    videoStream.on('data', (chunkLength, downloaded, total) => {
        bar.update(downloaded / total * 100);
    }
    );
    videoStream.on('end', () => {
        bar.stop();
        console.clear();
    });

   videoStream.pipe(writeStream);

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            resolve();
        }
        );
        writeStream.on('error', (error) => {
            reject(error);
        }
        );
    });
}

export default DownloadVideo;

