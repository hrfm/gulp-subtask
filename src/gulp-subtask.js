(function() {

  "use strict;"

  var gulp  = require('gulp'),
      th2   = require('through2');

  var gutil   = require('gulp-util'),
      cyan    = gutil.colors.cyan,
      magenta = gutil.colors.magenta;

  var EventEmitter = require('events').EventEmitter;

  // ------- LOGGER -----------------------------------------------------------------

  var PLUGIN_NAME = "gulp-subtask";

  // ------- EXPORTS ----------------------------------------------------------------

  module.exports = function( gulpRef ){

    var g = gulpRef || gulp;
    var inject = require('./inject.js');

    // ==============================================================================
    // --- SubTask.
    // ------------------------------------------------------------------------------

    var SubTask = function( taskName, silentMode ){
      this._name       = taskName;
      this._src        = undefined;
      this._pipes      = [];
      this._on         = {};
      this._silentMode = silentMode === true;
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
        return new gutil.PluginError( PLUGIN_NAME, 'Invalid arguments : First argument have to be a Function.' );
      }

      var args=[];
      for( var i=0; i<arguments.length; i++ ){
        args.push( arguments[i] );
      }
      this._pipes.push({
        'target' : 'pipe',
        'args'   : args
      });
      
      return this;

    }

    SubTask.prototype.on = function( type, callback ){
      this._pipes.push({
        'target'   : 'on',
        'type'     : type,
        'callback' : callback
      });
      return this;
    }

    SubTask.prototype.done = function( callback ){
      this._pipes.push({
        'target'   : 'done',
        'callback' : callback
      });
      return this;
    }

    SubTask.prototype.clone = function(){
      var clone = new SubTask( this._name, this._silentMode );
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
      return this._watch( this._src, options );
    }

    SubTask.prototype.watchWith = function( src, options ){
      if( this._src instanceof Array ){
        if( src instanceof Array ){
          return this._watch( src.concat(this._src), options );
        }else if( typeof src === 'string' ){
          return this._watch( [src].concat(this._src), options );
        }
      }else if( typeof this._src === 'string' ){
        if( src instanceof Array ){
          src.push( this._src );
          return this._watch( src, options );
        }else if( typeof src === 'string' ){
          return this._watch( [this._src,src], options );
        }
      }
    }

    SubTask.prototype.watchAs = function( src, options ){
      return this._watch( src, options );
    }

    // ------------------------------------------------------------------------------
    // private:

    SubTask.prototype._watch = function( src, options ){

      if( typeof src === 'undefined' ){
        throw 'watch src undefined.';
      }
      
      var self = this;
      var name = (typeof this._name==='string') ? this._name : "";
      
      if( name == "" ){
        gutil.log("Watching subtask");
      }else{
        gutil.log("Watching subtask '" + cyan(name) + "'");
      }

      if( typeof options !== 'undefined' ){
        src = inject( src, options );
      }

      // watch tasks 
      // If after task exists. pipe after run.

      var emitter = new EventEmitter();
      g.watch( src, function(){
        var after = new SubTask( undefined, true );
        emitter.emit('beforerun',after);
        var stream = self.run(options);
        stream.on("end",function(){
          emitter.emit('run',after);
        });
        if( 0 < after._pipes.length ){
          stream.pipe( after._pipe( options ) );
        }
      });

      return emitter;

    }

    SubTask.prototype._run = function( options, src, through2obj ){

      var name = (typeof this._name==='string') ? this._name : "",
          time = new Date().getTime(),
          silentMode = this._silentMode,
          stream;
      
      // Create stream.

      if( typeof through2obj === 'undefined' ){
        if( typeof src !== 'undefined' ){
          stream = g.src( inject( src , options ) );
        }else if( typeof this._src !== 'undefined' ){
          stream = g.src( inject( this._src, options ) );
        }else{
          throw 'subtask src undefined.';
        }
      }else{
        stream = through2obj;
      }

      if( silentMode !== true ){
        if( name == "" ){
          gutil.log("Starting subtask");
        }else{
          gutil.log("Starting subtask '" + cyan(name) + "'");
        }
      }

      // --- Run task.

      if( typeof options === 'undefined' ){
        
        for( var i=0, len=this._pipes.length; i < len; i++ ){
          
          if( this._pipes[i].target == 'pipe' ){
            
            var args = this._pipes[i].args;
            
            stream = stream.pipe( args[0].apply( null, args.slice(1,args.length) ) );

            // --- If set done task after pipe. Call done callback function with stream and options.
            if( this._pipes[i+1] && this._pipes[i+1].target == "done" ){
              var tmp = this._pipes[i+1].callback( stream, options );
              if( tmp ){ stream = tmp; }
            }

            //if( typeof args[0] === 'function' ){
            //  stream = stream.pipe( args[0].apply( null, args.slice(1,args.length) ) );
            //}else{
            //  stream = stream.pipe.apply( stream, args );
            //}

          }else if( this._pipes[i].target == 'on' ){

            stream = stream.on( this._pipes[i].type, this._pipes[i].callback );

          }

        }

      }else{

        for( var i=0, len=this._pipes.length; i < len; i++ ){

          if( this._pipes[i].target == 'pipe' ){

            var args = this._pipes[i].args, applyArgs = [];

            //if( typeof args[0] === 'function' ){
              
              for( var j=1; j<args.length; j++ ){
                applyArgs.push( inject( args[j], options ) );
              }

              stream = stream.pipe( args[0].apply( null, applyArgs ) );

              // --- If set done task after pipe. Call done callback function with stream and options.
              if( this._pipes[i+1] && this._pipes[i+1].target == "done" ){
                var tmp = this._pipes[i+1].callback( stream, options );
                if( tmp ){ stream = tmp; }
              }
              
            //}else{
            //  for( var j=0; j<args.length; j++ ){
            //    applyArgs.push( inject( args[j], options ) );
            //  }
            //  stream = stream.pipe.apply( stream, applyArgs );
            //}

          }else if( this._pipes[i].target == 'on' ){
            stream = stream.on( this._pipes[i].type, this._pipes[i].callback );
          }

        }

      }

      stream.on( 'end', function(){
        var elapsed = (new Date().getTime() - time) + " ms";
        if( silentMode !== true ){
          if( name == "" ){
            gutil.log("Finished subtask after " + magenta(elapsed) );
          }else{
            gutil.log("Finished subtask '" + cyan(name) + "' after " + magenta(elapsed) );
          }
        }
      });

      // --- Returen stream.

      return stream;

    }

    /**
     * Using subtask during pipes.
     * 
     */
    SubTask.prototype._pipe = function( options ){

      var start = th2.obj(
        // --- Get src from recent pipe.
        function( f, enc, callback ){
          if( f.isNull()   ){ return callback(); }
          if( f.isStream() ){ return this.emit('error',new PluginError('gulp-subtask','Streaming not supported')); }
          this.push(f);
          callback();
        }
      );

      var obj = th2.obj(
        // --- Get src from recent pipe.
        function( f, enc, callback ){
          if( f.isNull()   ){ return callback(); }
          if( f.isStream() ){ return this.emit('error',new PluginError('gulp-subtask','Streaming not supported')); }
          start.push(f);
          callback();
        },
        function(){
          start.emit('end');
        }
      );
      
      var end = th2.obj(
        // --- Get src from recent pipe.
        function( f, enc, callback ){
          if( f.isNull()   ){ return callback(); }
          if( f.isStream() ){ return this.emit('error',new PluginError('gulp-subtask','Streaming not supported')); }
          obj.push(f);
          callback();
        },
        function(){
          obj.emit('end');
        }
      );

      this.clone()._run( options, null, start ).pipe( end );

      return obj;

    }

    return SubTask;

  }

}).call(this);
