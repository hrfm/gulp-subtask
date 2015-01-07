(function() {

  "use strict;"

  var gulp=require('gulp'), th2=require('through2');

  module.exports = function( gulpRef ){

    var g = gulpRef || gulp;

    function replaceToOption( target, options ){

      var type = typeof target;

      if( !options || type === 'undefined' || type === 'function' ){
        return target;
      }


      if( type === 'string' && /\{\{(\w+)\}\}/.test(target) ){
        
        // --- String.

        var tags = target.match(/\{\{(\w+)\}\}/g);

        if( tags && 0 < tags.length ){

          if( tags.length == 1 && tags[0] === target ){

            // If tags.length is one and target string is completely same as tags[0].
            // Only this condition. Target can replaced with options.value. 

            return options[ (/\{\{(\w+)\}\}/).exec( tags[0] )[1] ];

          }else{

            for( var i=0; i<tags.length; i++ ){
              var result = /\{\{(\w+)\}\}/.exec(tags[i]);
              target = target.replace( result[0], options[result[1]].toString() );
            }

          }

        }

      }else if( target instanceof Array ){
        
        // --- Array.
        
        for( var i = 0; i < target.length; i++ ){
          target[i] = replaceToOption( target[i], options );
        }

      }else if( type === 'object' ){
        
        // --- Object.
        
        for( var key in target ){
          target[key] = replaceToOption( target[key], options );
        }

      }
      
      return target;

    }

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
      
      //if( typeof arguments[0] !== 'function' ){
      //  throw 'Invalid arguments : First argument have to be a Function.';
      //}

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
      
      if( typeof this._src === 'undefined' ){
        throw 'watch src undefined.';
      }
      
      var self = this;
      var name = "sub task" + ( (typeof this._name==='string') ? " '"+this._name+"'" : "" );
      
      console.log("Watching "+name);
      
      if( typeof options !== 'undefined' ){
        g.watch( replaceToOption( this._src, options ), function(){ self.run(options); });
      }else{
        g.watch( this._src, this.run );
      }
      
    }


    // ------------------------------------------------------------------------------
    // private:

    SubTask.prototype._run = function( options, src ){

      var name = "sub task" + ( (typeof this._name==='string') ? " '"+this._name+"'" : "" ),
          time = new Date().getTime(),
          stream;

      console.log("Starting "+name);

      // --- Run task.

      stream = g.src( replaceToOption( src || this._src, options ) );

      if( typeof options === 'undefined' ){
        
        for( var i=0, len=this._pipes.length; i < len; i++ ){
          
          var args = this._pipes[i];
          if( typeof args[0] === 'function' ){
            stream = stream.pipe( args[0].apply( null, args.slice(1,args.length) ) );
          }else{
            stream = stream.pipe.apply( stream, args );
          }

        }

      }else{

        for( var i=0, len=this._pipes.length; i < len; i++ ){

          var args = this._pipes[i], applyArgs = [];

          if( typeof args[0] === 'function' ){
            for( var j=1; j<args.length; j++ ){
              applyArgs.push( replaceToOption( args[j], options ) );
            }
            stream = stream.pipe( args[0].apply( null, applyArgs ) );
          }else{
            for( var j=0; j<args.length; j++ ){
              applyArgs.push( replaceToOption( args[j], options ) );
            }
            stream = stream.pipe.apply( stream, applyArgs );
          }

        }

      }

      stream.on( 'end', function(){
        var elapsed = new Date().getTime() - time;
        console.log("Finished " + name + " after " + elapsed + " ms");
      });

      // --- Returen stream.

      return stream;

    }

    SubTask.prototype._pipe = function( options ){

      var src=[], self=this;

      return th2.obj(
        function( f, enc, callback ){
          if(f.isNull()  ){ return callback(); }
          if(f.isStream()){ return this.emit('error',new PluginError('gulp-subtask','Streaming not supported')); }
          src.push(f.path);
          callback();
        },
        function( callback ){
          var that=this;
          self.clone()
            .pipe(
              th2.obj,
              function(f,enc,cb){
                if(f.isNull()  ){ return cb(); }
                if(f.isStream()){ return this.emit('error',new PluginError('gulp-subtask','Streaming not supported')); }
                that.push(f);
                cb();
              },
              function(cb){
                cb();
                this.emit('end');
              }
            )
            ._run( options, src );
        }
      );
      
    }

    return SubTask;

  }

}).call(this);
