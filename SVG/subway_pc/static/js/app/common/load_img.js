define(function(require){
	var lazyImg = {
		imgs: [],
		loading_count: 0,
		load: function(){
			this.imgs = $('img[data-imgsrc]');
			this.fetch();
		},
		fetch: function(){
			var me = this;
			_.each(this.imgs, function(item){
				var img = $(item),
					src = img.data('imgsrc');

				if(me.loading_count > 10){
					return false;
				}

				if(!src){
					return false;
				}

				me.loading_count ++;

				img.on('load', function(){
					me.loading_count --;

					//删除懒加载图片url;
					$(this).removeAttr('data-imgsrc');

					me.fetch();
				});

				img.attr('src', src);

			});
		}
	};

	return lazyImg;
});