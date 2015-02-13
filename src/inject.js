(function() {

  "use strict;"

  module.exports = function( target, src ){

    var obj;
    var type = typeof target;
    
    if( !src || type === 'undefined' || type === 'function' || target instanceof RegExp ){
      return target;
    }
    
    if( type === 'string' ){

      // --- String.

      obj = target;

      if( /\{\{(\w+)\}\}/.test(obj) ){

        var tags = target.match(/\{\{(\w+)\}\}/g);

        if( tags && 0 < tags.length ){

          if( tags.length == 1 && tags[0] === obj ){

            // If tags.length is one and target string is completely same as tags[0].
            // Only this condition. Target can replaced with src.value. 
            var result = (/\{\{(\w+)\}\}/).exec( tags[0] );
            obj = arguments.callee( src[result[1]], src );
            
          }else{

            for( var i=0; i<tags.length; i++ ){
              var result = /\{\{(\w+)\}\}/.exec(tags[i]);
              obj = obj.replace( result[0], src[result[1]].toString() );
            }

          }

        }

      }

    }else if( target instanceof Array ){
      
      // --- Array.
      obj = [];
      for( var i = 0; i < target.length; i++ ){
        obj[i] = arguments.callee( target[i], src );
      }

    }else if( type === 'object' ){
      
      // --- Object.
      
      obj = {};
      for( var key in target ){
        obj[key] = arguments.callee( target[key], src );
      }

    }else{
      
      obj = target;
      
    }
    
    return obj;
    
  }

}).call(this);