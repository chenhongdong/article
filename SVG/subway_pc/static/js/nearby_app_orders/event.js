define(function(require, exports, module){ 
    var events = {};  
      
    exports.subscribe = function(type,fn,arg){  
        if(!events[type]){  
            events[type] = {};  
        }  
        events[type] = {  
            fn:fn,  
            arg:arg  
        };  
    };  
    exports.unsubscribe = function(type){  
        if(!events[type] || !type ){  
            return false;  
        }  
        if(!!events[type]){  
            events[type] = {};  
            return true;  
        }  
        return false;  
    };  
    exports.fire = function(type,data){  
        if(events[type]){  
            events[type].fn(data,events[type].arg);  
        }  
    };  
});  