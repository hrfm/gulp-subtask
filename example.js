var g       = require('gulp');
var SubTask = require('./index.js')( g );
var concat  = require('gulp-concat');
var uglify  = require('gulp-uglify');
var replace = require('gulp-replace');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');

// Case1 : Basic usage.

var task1 = new SubTask('task1')
	.src( 'test/js/*.js' )
	.pipe( concat, 'ab.case1.js' )
	.on( 'end',function(){
		console.log('end task1 concat');
	})
	.pipe( g.dest, 'test/dest/js' )
	.pipe( replace, /test/g, 'hoge' )
	.pipe( g.dest, 'test/dest' );

task1.run();

// Case2 : pipe after sub task

var task2 = new SubTask('task2')
	.src( 'test/js/**/*.js' )
	.pipe( replace, /test/g, 'case2' )
	.pipe( debug, {title: 'task2', minimal: false} )
	.on('end',function(){
		console.log('task2 debug end.');
	});

var task2_2 = new SubTask('task2_2')
	.pipe( debug, {title: 'task2', minimal: false} )
	.pipe( concat, 'ab.case2.js' )
	.on('end',function(){
		console.log('task2_2 concat end.');
	})
	.pipe( uglify )
	.on('end',function(){
		console.log('task2_2 uglify end.');
	})
	.pipe( g.dest, 'test/dest/case2' )
	.on('end',function(){
		console.log('task2_2 dest end.');
	})

task2.run()
	.pipe( task2_2.run() )
	.pipe( g.dest('test/dest/js') );

// Case3 : Task with options.

var task3 = new SubTask('task3')
	.src( '{{src}}' )
	.pipe( concat, '{{concat}}' )
	.on( 'end',function(){
		console.log('end task3 concat');
	})
	.pipe( g.dest, 'test/dest/js' )
	.pipe( replace, /test/g, 'hoge' )
	.pipe( g.dest, 'test/dest' );

task3.run({
	src    : 'test/js/*.js',
	concat : 'ab.case3a.js'
});
task3.run({
	src    : 'test/js/*.js',
	concat : 'ab.case3b.js'
});

// Case4 : Using between pipes

var task4 = new SubTask('task4')
	.pipe( uglify )
	.on('end',function(){
		console.log('task4 uglify end.');
	})
	.pipe( g.dest, 'test/dest/case4' )
	.on('end',function(){
		console.log('task4 dest end.');
	});

var task4_2 = new SubTask('task4_2')
	.pipe( replace, /test/g, 'hoge' )
	.on('end',function(){
		console.log('task4_2 replace end.');
	})
	.pipe( g.dest, 'test/dest/case4' )
	.on('end',function(){
		console.log('task4_2 dest end.');
	});

g.src( 'test/js/*.js' )
 .pipe( plumber() )
 .pipe( concat( 'ab.case4.js' ) )
 .pipe( task4.run() )
 .pipe( task4_2.run() )
 .pipe( g.dest('test/dest/js') );

// Case5 : Watch.

var task5 = new SubTask('task5')
	.src( 'test/js/*.js' )
	.pipe( concat, 'ab.case5.js' )
	.on( 'end',function(){
		console.log('end task5 concat');
	})
	.on( 'end',function(){
		console.log('end task5 concat end');
	})
	.pipe( g.dest, 'test/dest/js' )
	.on( 'end',function(){
		console.log('end task5 dest');
	})

task5.watch()
	.on('run',function(subtask){
		subtask
			.pipe( uglify )
			.on('end',function(){
				console.log('end task5 uglify with watch');
			})
			.pipe( g.dest, 'test/dest/complete' )
			.on('end',function(){
				console.log('end task5 dest with watch');
			});
	});