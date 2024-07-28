import axios from 'axios';
import https from 'https';
import ora from 'ora';
import fb from "fbkey";
const accessToken = process.env.EAAD6V7; // ACCESS TOKEN HERE
const shareUrl = process.env.shareUrl; // URL HERE

const shareCount = 22200;
const timeInterval = 800;
const deleteAfter = 60 * 60;

let sharedCount = 0;
let timer = null;

async function sharePost() {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/me/feed?access_token=${accessToken}&fields=id&limit=1&published=0`,
      {
        link: shareUrl,
        privacy: { value: 'SELF' },
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
