export function vimeoHTML(videoId) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">
    <title>Vimeo Player Webview</title>
    <meta charset="utf-8">
    <meta name="author" content="santran686@gmail.com">
    <meta name="author" content="chainplatform.net">
    <style>
        html {
            overflow-y: hidden;
            overflow-x: hidden;
            height: 100%;
        }
        body {
            background-color: transparent;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
        .embed-container {
            position: relative;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            max-width: 100%;
            width: 100%;
            height: 100%;
        }
        .embed-container iframe,
        .embed-container object,
        .embed-container embed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div class="embed-container"><div id="player"></div></div>
    <script>
        const parsedUrl = new URL(window.location.href), videoId = parsedUrl.searchParams.get("videoId");
        let tag = document.createElement('script');
        tag.src = "https://player.vimeo.com/api/player.js";
        let lastTimeUpdate = 0;
        let player;
        const options = {
            id: '${videoId}',
            loop: false,
            autopause: false,
            byline: false,
            cc: false,
            chromecast: false,
            controls: false,
            fullscreen: false,
            keyboard: false,
            progress_bar: false,
            title: false,
            transcript: false,
            vimeo_logo: false,
            dnt: true
        };
        tag.onload = () => {
            // const iframe = document.querySelector('iframe');
            player = new Vimeo.Player('player', options);
            player.ready().then(function () {
                // console.log("playerReady ");
                player.getDuration().then(function (duration) {
                    // duration = the duration of the video in seconds
                    // console.log('video length is:', duration);
                    sendMessageToParent({ eventType: "initialDelivery", data: { duration: duration, currentTime: 0 } });
                    // const event = { eventType: "initialDelivery", data: { duration: duration, currentTime: 0 } };
                    // (window.ReactNativeWebView || window.parent || window).postMessage(JSON.stringify(event), '*');
                }).catch(function (error) {});
                sendMessageToParent({ eventType: "playerReady", data: null });
                player.on('playbackratechange', function (data) {
                    // console.log("playbackratechange ", data);
                    // sendMessageToParent({ eventType: "playbackRateChange", data: data })
                });
                player.on('qualitychange', function (data) {
                    // console.log("qualitychange ", data);
                    // sendMessageToParent({ eventType: "playerQualityChange", data: data })
                });
                player.on('error', function (data) {
                    // console.log("error ", data);
                    sendMessageToParent({ eventType: "playerError", data: data })
                });
                player.on('timeupdate', function (infos) {
                    // console.log("timeupdate ", data);
                    // if (typeof infos.seconds != "undefined") {
                        // var time = Math.floor(infos.seconds);
                        // if (time !== lastTimeUpdate) {
                        //     lastTimeUpdate = time;
                        //     sendMessageToParent({ eventType: "infoDelivery", data: { duration: infos.duration, currentTime: time } });
                        // }
                    // }
                });
                player.on('progress', function (infos) {
                    // console.log("progress ", data);
                    // if (typeof infos.seconds != "undefined") {
                    //     sendMessageToParent({ eventType: "initialDelivery", data: { duration: infos.duration, currentTime: infos.seconds } });
                    // }
                });
            });
            let updateTime;
            player.on('play', function (data) {
                // console.log("play ", data);
                updateTime = setInterval(() => {
                    player.getCurrentTime().then(function (seconds) {
                        // console.log("seconds ", seconds);
                        var time = Math.floor(seconds);
                        if (time !== lastTimeUpdate) {
                            lastTimeUpdate = time;
                            sendMessageToParent({ eventType: "infoDelivery", data: { currentTime: time } });
                        }
                    }).catch(function (error) { });
                }, 1000);
            });
            player.on('ended', function () {
                // console.log("ended ");
                if (updateTime) { clearInterval(updateTime); }
                sendMessageToParent({ eventType: "playerStateChange", data: 0 })
            });
        };
        tag.onerror = () => { };
        let firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        function sendMessageToParent(event) {
            // console.log('sendMessageToParent ', event);
            (window.ReactNativeWebView || window.parent || window).postMessage(JSON.stringify(event), '*');
        }
        window.addEventListener("message", function (events) {
            let infos = events.data;
            if (typeof events.data != "object") {
                infos = JSON.parse(events.data);
            }
            switch (infos.event) {
                case "playVideo":
                    player.play().then(function () { }).catch(function (error) {
                        switch (error.name) {
                            case 'PasswordError':
                                // The video is password-protected
                                break;
                            case 'PrivacyError':
                                // The video is private
                                break;
                            default:
                                // Some other error occurred
                                break;
                        }
                    });
                    break;
                case "pauseVideo":
                    player.pause().then(function () { }).catch(function (error) {
                        switch (error.name) {
                            case 'PasswordError':
                                // The video is password-protected
                                break;
                            case 'PrivacyError':
                                // The video is private
                                break;
                            default:
                                // Some other error occurred
                                break;
                        }
                    });
                    break;
                case "stopVideo":
                    player.pause().then(function () { }).catch(function (error) {
                        switch (error.name) {
                            case 'PasswordError':
                                // The video is password-protected
                                break;
                            case 'PrivacyError':
                                // The video is private
                                break;
                            default:
                                // Some other error occurred
                                break;
                        }
                    });
                    break;
                case "volumeOff":
                    player.setMuted(true).then(function (muted) {}).catch(function (error) { });
                    break;
                case "volumeOn":
                    player.setMuted(false).then(function (muted) { }).catch(function (error) { });
                    break;
            }
        })
    </script>
</body>

</html>`
}