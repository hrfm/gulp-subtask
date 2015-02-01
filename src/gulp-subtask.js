(function() {

  "use strict;"

  var gulp = require('gulp'),
      th2  = require('through2');

  module.exports = function( gulpRef ){

    var g = gulpRef || gulp;
    var inject = require('./inject.js');

    // ==============================================================================
    // --- SubTask.
    // ------------------------------------------------------------------------------

    var SubTask = function( taskName ){
      this._name  = taskName;
      this._src   = undefined;
      this._pipes = [];
    }

    // ------------------------------------------------------------------------------
    // public:

    SubTask.prototype.src = function( src ){
      this._src   = src;
      this._pipes = [];
      return this;
    }

    SubTask.prototype.pipe = function(){
      
      if( typeof arguments[0] !== 'function' ){
        throw 'Invalid arguments : First argument have to be a Function.';
      }

      var args=[];
      for( var i=0; i<arguments.length; i++ ){
        args.push( arguments[i] );
      }
      this._pipes.push(args);
      
      return this;

    }

    SubTask.prototype.clone = function(){
      var clone = new SubTask( this._name );
      clone._src   = this._src;
      clone._pipes = this._pipes;
      return clone;
    }

    SubTask.prototype.run = function( options ){
      if( typeof this._src === 'undefined' ){
        return this._pipe( options );
      }else{
        return this._run( options );
      }
    }

    SubTask.prototype.watch = function( options ){
      this._watch( this._src, options );
    }

    SubTask.prototype.watchWith = function( src, options ){
      if( this._src instanceof Array ){
        if( src instanceof Array ){
          this._watch( src.concat(this._src), options );
        }else if( typeof src === 'string' ){
          this._watch( [src].concat(this._src), options );
        }
      }else if( typeof this._src === 'string' ){
        if( src instanceof Array ){
          src.push( this._src );
          this._watch( src, options );
        }else if( typeof src === 'string' ){
          this._watch( [this._src,src], options );
        }
      }
    }

    SubTask.prototype.watchAs = function( src, options ){
      this._watch( src, options );
    }

    // ------------------------------------------------------------------------------
    // private:

    SubTask.prototype._watch = function( src, options ){

      if( typeof src === 'undefined' ){
        throw 'watch src undefined.';
      }
      
      var self = this;
      var name = "sub task" + ( (typeof this._name==='string') ? " '"+this._name+"'" : "" );
      
      console.log("Watching "+name);

      if( typeof options !== 'undefined' ){
        src = inject( src, options );
      }
      
      g.watch( src, function(){ self.run(options); });

    }

    SubTask.prototype._run = function( options, src, stream ){

      var name = "sub task" + ( (typeof this._name==='string') ? " '"+this._name+"'" : "" ),
          time = new Date().getTime(),
          stream;

      console.log("Starting "+name);

      // --- Run task.

      if( typeof stream === "undefined" ){
        stream = g.src( inject( src || this._src, options ) );
      }

      if( typeof options === 'undefined' ){
        
        for( var i=0, len=this._pipes.length; i < len; i++ ){
          
          var args = this._pipes[i];
          //if( typeof args[0] === 'function' ){
            stream = stream.pipe( args[0].apply( null, args.slice(1,args.length) ) );
          //}else{
          //  stream = stream.pipe.apply( stream, args );
          //}

        }

      }else{

        for( var i=0, len=this._pipes.length; i < len; i++ ){

          var args = this._pipes[i], applyArgs = [];

          //if( typeof args[0] === 'function' ){
            for( var j=1; j<args.length; j++ ){
              applyArgs.push( inject( args[j], options ) );
            }
            stream = stream.pipe( args[0].apply( null, applyArgs ) );
          //}else{
          //  for( var j=0; j<args.length; j++ ){
          //    applyArgs.push( inject( args[j], options ) );
          //  }
          //  stream = stream.pipe.apply( stream, applyArgs );
          //}

        }

      }

      stream.on( 'end', function(){
        var elapsed = new Date().getTime() - time;
        console.log("Finished " + name + " after " + elapsed + " ms");
      });

      // --- Returen stream.

      return stream;

    }

    /**
     * Using subtask during pipes.
     * 
     */
    SubTask.prototype._pipe = function( options ){

      var obj = th2.obj(
        // --- Get src from recent pipe.
        function( f, enc, callback ){
          if(f.isNull()  ){ return callback(); }
          if(f.isStream()){ return this.emit('error',new PluginError('gulp-subtask','Streaming not supported')); }
          this.push(f);
          callback();
        }
      );
      
      return this.clone()
          ._run( options, null, obj );
            
    }

    return SubTask;

  }

}).call(this);
