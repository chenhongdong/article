(function(p){
    function connectWebViewJavascriptBridge(callback) {
          if (window.WebViewJavascriptBridge) {
              callback(WebViewJavascriptBridge)
          } else {
              document.addEventListener(
                  'WebViewJavascriptBridgeReady'
                  , function() {
                      callback(WebViewJavascriptBridge)
                  },
                  false
              );
          }
      }

      connectWebViewJavascriptBridge(function(bridge) {
          bridge.init(function(message, responseCallback) {
              console.log('JS got a message', message);
              var data = {
                  'Javascript Responds': 'Wee!'
              };
              console.log('JS responding with', data);
              responseCallback(data);
          });
      })

    window[p] = {};
    window[p].getNative = function(n,d,cb){
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(n,d,cb);
        }else{
            document.addEventListener(
                'WebViewJavascriptBridgeReady'
                , function() {
                    window.WebViewJavascriptBridge.callHandler(n,d,cb);
                },
                false
            );
        }
    }
})("JTN");