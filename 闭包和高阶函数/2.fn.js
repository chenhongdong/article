// 高阶函数

// 应用场景
// 回调函数
// 异步请求
let getInfo = function (keywords, callback) {
    $.ajax({
        url: 'http://musicapi.leanapp.cn/search',  // 以网易云音乐为例
        data: {
            keywords
        },
        success: function (res) {
            callback && callback(res.result.songs);
        }
    })
};

$('#btn').on('click', function() {
    let keywords = $(this).prev().val();
    $('#loading').show();
    getInfo(keywords, getData);
});
// 加入回车
$("#search_inp").on('keyup', function(e){
    if (e.keyCode === 13) {
        $('#loading').show();
        getInfo(this.value, getData);
    }
});

function getData(data) {
    if (data && data.length) {
        let html = render(data);
        // 初始化Dom结构
        initDom(html, function(wrap) {
            console.log(wrap);
            play(wrap);
        });
    }
}
// 格式化时间戳
function formatDuration(duration) {
    duration = parseInt(duration / 1000);     // 转换成秒
    let hour = Math.floor(duration / 60 / 60),
        min = Math.floor((duration % 3600) / 60),
        sec = duration % 60,
        result = '';

    result += `${fillIn(min)}:${fillIn(sec)}`;
    return result;
}

function fillIn(n) {
    return n < 10 ? '0' + n : '' + n;
}

let initDom = function (tmp, callback) {
    $('.item').remove();
    $('#loading').hide();
    $('#box').append(tmp);
    // 这里因为不知道dom合适才会被完全插入到页面中
    // 所以用callback当参数，等dom插入后再执行callback
    callback && callback(box);
};

let render = function (data) {
    let template = '';
    let set = new Set(data);
    data = [...set];    // 可以利用Set去做下简单的去重，可忽略这步
    for (let i = 0; i < 20; i++) {
        let item = data[i];
        let name = item.name;
        let singer = item.artists[0].name;
        let pic = item.album.picUrl;
        let time = formatDuration(item.duration);

        template += `
            <div class="item">
                <div class="pic" data-time="${time}">
                    <span></span>
                    <img src="${pic}" />
                </div>
                <h4>${name}</h4>
                <p>${singer}</p>
                <audio src="http://music.163.com/song/media/outer/url?id=${item.id}.mp3"></audio>
            </div>`;
    }
    return template;
};

let play = function(wrap) {
    wrap = $(wrap);
    wrap.on('click', '.item', function() {
        let self = $(this),
            $audio = self.find('audio'),
            $allAudio = wrap.find('audio');

        for (let i = 0; i < $allAudio.length; i++) {
            $allAudio[i].pause();
        }
        $audio[0].play();
        self.addClass('play').siblings('.item').removeClass('play');
    });
};