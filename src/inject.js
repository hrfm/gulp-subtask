(function() {

  "use strict;"

  module.exports = function( target, src ){

    var type = typeof target;

    if( !src || type === 'undefined' || type === 'function' ){
      return target;
    }

    if( type === 'string' ){

      // --- String.

      if( /\{\{(\w+)\}\}/.test(target) ){

        var tags = target.match(/\{\{(\w+)\}\}/g);

        if( tags && 0 < tags.length ){

          if( tags.length == 1 && tags[0] === target ){

            // If tags.length is one and target string is completely same as tags[0].
            // Only this condition. Target can replaced with src.value. 
            var result = (/\{\{(\w+)\}\}/).exec( tags[0] );
            target = arguments.callee( src[result[1]], src );
            
          }else{

            for( var i=0; i<tags.length; i++ ){
              var result = /\{\{(\w+)\}\}/.exec(tags[i]);
              target = target.replace( result[0], src[result[1]].toString() );
            }

          }

        }

      }

    }else if( target instanceof Array ){
      
      // --- Array.
      
      for( var i = 0; i < target.length; i++ ){
        target[i] = arguments.callee( target[i], src );
      }

    }else if( type === 'object' ){
      
      // --- Object.
      
      for( var key in target ){
        target[key] = arguments.callee( target[key], src );
      }

    }
    
    return target;

  }

}).call(this);