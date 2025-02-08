import axios from 'axios';
import https from 'https';
import ora from 'ora';

const accessToken = "EAAGUMo6VJboBOZBFHH2EpI91UzSv3hQGcjxAIJWS2aZBqIiON930Sxc0Xby4BC9S01Y2ZAiFcKmZAWlX9AZAUhYtNFU2ndyZBVCqcfofuR7vQTwwXtnVLBsZCBhzy2p5ZCzvLld0A70cegJFIfc64Upbyap2hZAcyehw0XK5IJhZAfRqnvNBJZC6rrbvykfrQZDZD"; // ACCESS TOKEN HERE
const shareUrl = "https://fb.watch/xzFekfc-bW/"; // URL HERE

const shareCount = 22200;
const timeInterval = 3000;
const deleteAfter = 60 * 60;

let sharedCount = 0;
let timer = null;

async function sharePost() {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/me/feed?access_token=EAAGUMo6VJboBO0jtCShw6TZAt3c5ZCAKDibnKZBBvXrNRZBeV9tLmnSVn7LoqUkncpfQRJhPmVvXlZCj0unlHCZBwSjD9DQXu0DiaFw1lNQSY6ELSiFRMn4gIhKf7blP5An7aGWEvCL0dzZCZCziAWmE4we09bnHvrSbMmXJYnSAVIZAfVxIPi7ehZAtFKFeW11beHZAAg3iRxlqUmFAqbEJLH3RRxFswZDZD&fields=id&limit=1&published=0`,
      {
        link: shareUrl,
        no_story: true,
      },
      {
        muteHttpExceptions: true,
        headers: {
          authority: 'graph.facebook.com',
          'cache-control': 'max-age=0',
          'sec-ch-ua-mobile': '?0',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
          },
          method: 'post',
      }
    );

    sharedCount++;
    const postId = response?.data?.id;

    console.log(`Post shared: ${sharedCount}`);
    console.log(`Post ID: ${postId || 'Unknown'}`);

    if (sharedCount === shareCount) {
      clearInterval(timer);
      console.log('Finished sharing posts.');

      if (postId) {
        setTimeout(() => {
          deletePost(postId);
        }, deleteAfter * 1000);
      }
    }
  } catch (error) {
    console.error('Failed to share post:', error.response.data);
  }
}

async function deletePost(postId) {
  try {
    await axios.delete(`https://graph.facebook.com/${postId}?access_token=${accessToken}`);
    console.log(`Post deleted: ${postId}`);
  } catch (error) {
    console.error('Failed to delete post:', error.response.data);
  }
}

setTimeout(() => {
  clearInterval(timer);
  console.log('Loop stopped.');
}, shareCount * timeInterval);

let spinner; // Declare a spinner variable

function startSpinner(text) {
    spinner = ora(text).start();
}

function stopSpinner() {
    if (spinner) {
        spinner.stop();
    }
}

function checkInternetConnection(callback) {
    startSpinner('Checking internet connection...');

    const options = {
        hostname: 'www.google.com',
        port: 443,
        path: '/',
        method: 'HEAD'
    };

    const req = https.request(options, (res) => {
        stopSpinner();
        if (res.statusCode === 200) {
            callback(null, true);
        } else {
            callback(`HTTP status code: ${res.statusCode}`, false);
        }
    });

    req.on('error', (err) => {
        stopSpinner();
        callback(err.message, false);
    });

    req.end();
}

function start() {
    checkInternetConnection((err, isConnected) => {
        if (err) {
            console.log('No Internet Access');
            process.exit(1);
        }
        if (isConnected) {
            console.log('Internet access confirmed. Starting process...');
            // Your logic for starting the process goes here
            timer = setInterval(sharePost, timeInterval); // Assuming sharePost and timeInterval are defined elsewhere
        }
    });
}

start(); // Start the script execution
