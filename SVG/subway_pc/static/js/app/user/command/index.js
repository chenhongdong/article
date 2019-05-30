define(function(){
    var Index = So.Command.Base.extend({
        _run:function(){
            var callback = function(user_info){
                user_info = user_info || {};
                //重新生成用户头像url
                if(user_info.img_url){
                    var img_url = user_info.img_url || '';
                    var img_id = img_url.split("/").slice(-1);
                    var new_img_url = "https://p1.ssl.qhmsg.com/dm/120_120_100/" + img_id;
                    user_info.img_url = new_img_url;
                }
                

                So.Gcmd.changeHash('user/index', {
                    data: user_info
                });
            }
            QHPass.getUserInfo(callback,callback);
        }
    });
    return Index;
});