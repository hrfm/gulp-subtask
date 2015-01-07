(function() {

  "use strict;"

  var gulp=require('gulp'), th2=require('through2');

  module.exports = function( gulpRef ){

    var g = gulpRef || gulp;

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
      this._src   = src
      this._pipes = [];
      return this;
    }

    SubTask.prototype.pipe = function( obj ){
      this._pipes.push( obj );
      return this;
    }

    SubTask.prototype.clone = function(){
      var clone = new SubTask( this._name );
      if( typeof this._src !== 'undefined' ){
        clone.src( this._src );
      }
      if( this._pipes && 0 < this._pipes.length ){
        for( var i = 0, len = this._pipes.length; i < len; i++ ){
          clone.pipe( this._pipes[i] );
        }
      }
      return clone;
    }

    SubTask.prototype.run = function( options ){
      if( typeof this._src === 'undefined' ){
        return this._pipe( options );
      }else{
        return this._run( options );
      }
    }

    SubTask.prototype.watch = function(){
      if( typeof this._src === 'undefined' ){
        throw 'watch src undefined.';
      }
      _gulp.watch( this._src, this._run );
    }

    // ------------------------------------------------------------------------------
    // private:

    SubTask.prototype._run = function( options, src ){

      var name = "sub task" + ( (typeof this._name==='string') ? " '"+this._name+"'" : "" ),
          time = new Date().getTime(),
          stream;

      console.log("Starting "+name);

      // --- Run task.

      stream = g.src( src || this._src );

      for( var i=0, len=this._pipes.length; i < len; i++ ){
        var p = this._pipes[i];
        if( typeof p === 'function' ){
          stream = stream.pipe( p( options ) );
        }else{
          stream = stream.pipe( p );
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
            .pipe(th2.obj(
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
            ))
            ._run( options, src );
        }
      );
      
    }

    return SubTask;

  }

}).call(this);
