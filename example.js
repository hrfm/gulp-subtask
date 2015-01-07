var g       = require('gulp');
var SubTask = require('./index.js')( g );
var concat  = require('gulp-concat');
var uglify  = require('gulp-uglify');

// Case1 : Basic usage.

var task1 = new SubTask('task1')
	.src( 'test/js/*.js' )
	.pipe( concat('ab.case1.js') )
	.pipe( g.dest('test/dest/js') );

task1.run();

// Case2 : pipe after sub task

var task2 = new SubTask('task2')
	.src( 'test/js/*.js' )
	.pipe( concat('ab.case2.js') );

task2.run()
	.pipe( g.dest('test/dest/js') );

// Case3 : Task with options.

var task3 = new SubTask('task3')
	.src( 'test/js/*.js' )
	.pipe( function(opt){
		return concat(opt.name)
	})
	.pipe( g.dest('test/dest/js') );

task3.run({ name : 'ab.case3.js' });

// Case4 : Using between pipes

var task4 = new SubTask('task4')
	.pipe( concat('ab.case4.js') );

g.src( 'test/js/*.js' )
 .pipe( task4.run() )
 .pipe( g.dest('test/dest/js') );
