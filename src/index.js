import GetVideoList from './getvideolist.js';
import DownloadVideo from './downloadvideo.js';
import chalk from 'chalk';
import cliSelect from 'cli-select';
import prompts from 'prompts';
import fs from 'fs';
import path from 'path';

function linkValidator(value) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/g;
    return regex.test(value);
}

(async () => {
    console.log(chalk.red('Welcome to the YtChannel Downloader!'));
    console.log(chalk.green('Please enter the channel name to start the download process.'));
    const channelUrl = await prompts({
        type: 'text',
        name: 'channelUrl',
        message: 'Channel URL:',
        validate: value => value.length > 0 ? true : 'Please enter a valid channel URL.',
    });
    if(linkValidator(channelUrl.channelUrl)) {
        console.log(chalk.green('Valid channel URL entered.'));

        // choose the location to save the videos
        const saveLocation = await prompts({
            type: 'text',
            name: 'saveLocation',
            message: 'Save location:(default: ./videos)',
            initial: './videos',
            validate: value => value.length > 0 ? true : 'Please enter a valid save location.',
        });
        if(saveLocation.saveLocation) {
           if(!fs.existsSync(saveLocation.saveLocation)) {
               fs.mkdirSync(saveLocation.saveLocation);
           }
        } else {
            saveLocation.saveLocation = './videos';
        }

        // get the video list
    const videoList = await GetVideoList(channelUrl.channelUrl);
    if(videoList.length > 0) {
        fs.writeFileSync(path.join(saveLocation.saveLocation, 'video-list.txt'), videoList.join('\n'));
        console.log(chalk.white(`Video list saved to ${saveLocation.saveLocation}/video-list.txt`));
    } else {
        console.log(chalk.red('No videos found.'));
        process.exit();
    }
    
    console.log(chalk.green('Is ready to start downloading all videos?'));
    console.log(chalk.red('This can take a while depending on the number of videos.')); 
    cliSelect({
        values: ['Yes', 'No'],
        valueRenderer: (value, Selected) => {
            if(Selected) {
                return chalk.underline(value);
            }
            return value;
        }
    }).then(async (selection) => {
        if(selection.value === 'Yes') {
            console.log(chalk.green('Starting download...'));
            // só deve prosseguir quando retornar true
            await DownloadVideo(videoList, saveLocation.saveLocation);
            console.log(chalk.green('Download finished!'));
        } else {
            console.log(chalk.red('Exiting...'));
        }
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        process.exit();
    });

    } else {
        console.log(chalk.red('Invalid channel URL entered.'));
        process.exit();
    }

                
})();

