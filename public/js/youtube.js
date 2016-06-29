var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
//https://www.youtube.com/playlist?list=PLHSdaq9eH6f5Uf-rIRwiJkwmu0ODuKeFV
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}
function onPlayerReady(event) {
    var videos = ['W9eypX6T1I8',
        'p5SDTlCeVYg',
        '139PPu-CEPU',
        'pQjNvZ1_gmg',
        'HQwE_uwvph4',
        'EGkRbjR3v0M',
        'HgaGEpkjt8Y',
        '3yOhUm-Hv-g',
        'M7M-kPcFBc4',
        'EYWbIdfw0XI',
        'bQzx9qVpqMg',
        'xiK5MU6aeMg',
        'cQjKefBs0MI',
        '8B8PLLiNCLQ',
        '9y7aqh8X_jo',
        'lnMqWnRKahg',
        'xysDzsiydk8',
        'UZckzkJZJVQ',
        'r5R4-oHDkNA',
        'kfLiD_XuHZY',
        'Eb8GWfLQ5kY',
        'HcEq4q7bp1Q',
        '4v3Pdy1fwYg',
        '20CxjYs4B54',
        'k6SdvvXEVt0',
        'QuvdMFYLaDo',
        'BAsH7f91xQs',
        'Q9WUPV2M4wo',
        'DyerMnM3Brw',
        'AwhQdF2Qfa0',
        'yxEZ-_cArmM',
        '4KX0b8JckQs',
        'JnCjDntUUWI',
        'ZE62FTzg1tg',
        'Y3MyGRhdb4w',
        'DW-h8YHwSgQ',
        'uSop14TGHj8',
        'QT7GeeySyDA',
        'ILY5Zl1J6AA',
        'NsiKMlzznkk',
        'BOHXqf8GH4w',
        '9nmJbSvQPLA',
        'D7fKWtfg5cs',
        'X2-qUtTUCiw',
        'ofaM3D1UQ50',
        '1Wbk0y3a0PM',
        '1kmsrdG8ce8',
        'zEFriK-UMQM',
        'xgz-BeyCCXw',
        '6UeSEfR-Yt4',
        'XxcsC9q0qe8',
        '3-LByc0NMBs',
        '4_nNcAghDQo',
        's1LdrHlyX5c',
        'oTChqBF94iA',
        'k9ajum8U1ws',
        'h0I-H0SzG3s',
        '4GYmum-jzpg',
        'anqyihTRQi0',
        'ZDXGcBeo7mI',
        'ubd0ueLAbwg',
        'Tgn89qXdBC0',
        'nI6KzNpQ78c',
        'PpC9EictJH0',
        'oY2bmciLXjA',
        'XxJuSigDSBU',
        'oPJWF48YoT4',
        'CwfuNDpVpxY',
        'IPidLG4ysu4',
        'by43GnnQWi8',
        'nkHIQHYrHpQ',
        'TBy9ajn7q-w',
        'NQA-gyv_krM',
        'Wh5pOFcalVs',
        '1ABMfPEj8JA',
        'MsgwoFHgmZU',
        'difaYfZ-9vY',
        'itFDie_Imm0',
        'D5UlVJeGsAY',
        'tY-3vgUQLL0'];
    event.target.loadPlaylist(videos);
}
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        // setTimeout(stopVideo, 60000);
        done = true;
    }
}
function stopVideo() {
    player.stopVideo();
}


$(function () {
    var pre = "";
    $("#word").keydown(function (e) {
        e.stopPropagation();
    });

    $("#word").keyup(function (e) {
        //Esc
        if (e.keyCode == 27) {
            $("#word").blur()
            return;
        }
        var text = $("#word").val();
        if (!text) {
            return;
        }
        if (pre == text) {
            console.log("skip");
            return;
        }
        setTimeout(function () {
            var text2 = $("#word").val();
            if (!text2) {
                return;
            }
            if (pre == text) {
                console.log("skip");
                return;
            }
            if (text2!=text) {
                console.log("skip");
                return;
            }
            var url = "/eiji?word=" + text2;
            pre = text;
            $.getJSON(url, function (raw) {
                $("#eiji").empty();
                var json = raw.sort(
                    function (row1, row2) {
                        a = row1.word;
                        b = row2.word;
                        a1 = a.replace(/^([a-zA-Z0-9 &',_~-]+).*/, function () { return RegExp.$1 });
                        a1 = a1.replace(/\s*$/, "");
                        b1 = b.replace(/^([a-zA-Z0-9 &',_~-]+).*/, function () { return RegExp.$1 });
                        b1 = b1.replace(/\s*$/, "");
                        //短いほうを優先
                        if (a1.length > b1.length) {
                            return 1;
                        }
                        if (a1.length < b1.length) {
                            return -1;
                        }
                        if (a1.match(/^[a-z]/) && b1.match(/^[A-Z]/)) {
                            return -1;
                        }
                        if (a1.match(/^[A-Z]/) && b1.match(/^[a-z]/)) {
                            return 1;
                        }
                        if (a.length > b.length) {
                            return 1;
                        }
                        if (a.length < b.length) {
                            return -1;
                        }
                        return 0;
                    }
                );

                for (var i = 0; i < json.length; i++) {
                    $('#eiji').append(json[i].word + "&nbsp;" + json[i].content + "<br/>");
                }
            });
        }, 200);
        e.stopPropagation();
    });
    $(window).keyup(function (e) {
        //s
        if (e.keyCode == 83) {
            if (player.getPlayerState() == 2) {
                $("#word").val("");
                pre = "";
                $("#eiji").empty();
                $("#word").focus();
            }
        }
        //f
        if (e.keyCode == 70) {
            $("#word").focus();
        }
    });
    $(window).keydown(function (e) {
        //s
        if (e.keyCode == 83) {
            if (player.getPlayerState() == 1) {
                player.pauseVideo();
            }
            if (player.getPlayerState() == 2) {
                player.playVideo();
            }
        }
        //n
        if (e.keyCode == 78) {
            //player.nextVideo();
        }

        //b
        if (e.keyCode == 66) {
            time = player.getCurrentTime();
            time -= 5;
            if (time < 0) {
                time = 0;
            }
            player.seekTo(time, true);
        }
    });
});
