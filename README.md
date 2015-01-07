gulp-subtask
============

## Getting started

You can install this module from npm.

```sh
npm install gulp-carryout
```

## Usage

### Case1 : Basic usage.

```javascript
var task = new SubTask()
	.src( 'test/js/*.js' )
	.pipe( concat('ab.case1.js') )
	.pipe( g.dest('test/dest/js') );

task.run();
```

### Case2 : pipe after sub task

```javascript
var task = new SubTask('task')
	.src( 'test/js/*.js' )
	.pipe( concat('ab.case2.js') );

task.run()
	.pipe( g.dest('test/dest/js') );
```

### Case3 : Task with options.

```javascript
var task = new SubTask('task')
	.src( 'test/js/*.js' )
	.pipe( function(opt){
		return concat(opt.name)
	})
	.pipe( g.dest('test/dest/js') );

task.run({ name : 'ab.case3.js' });
```

// Case4 : Using between gulp pipes.

```javascript
var task4 = new SubTask('task4')
	.pipe( concat('ab.case4.js') );

g.src( 'test/js/*.js' )
 .pipe( task4.run() )
 .pipe( g.dest('test/dest/js') );
```