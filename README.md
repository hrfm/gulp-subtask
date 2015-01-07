gulp-subtask
============

## Getting started

You can install this module from npm.

```sh
npm install gulp-subtask
```

## Usage

### At first.

Initialize gulp-subtask with gulp.

```javascript
var g       = require('gulp');
var SubTask = require('gulp-subtask')( g );
```

### Case1 : Basic usage.

Create task likes gulp tasks.

```javascript
var task = new SubTask()
	.src( 'test/js/*.js' )
	.pipe( concat, 'all.js' )
	.pipe( g.dest, 'test/dest/js' );

task.run();
```

### Case2 : pipe after sub task

gulp-subtask returns pipe stream.
You can continue task use pipe() afret run().

```javascript
var task = new SubTask('task')
	.src( 'test/js/*.js' )
	.pipe( concat, 'all.js' );

task.run()
	.pipe( g.dest('test/dest/js') );
```

### Case3 : Task with options.

gulp-subtask is able to run with using option.
For example. If you want to change concat() output filename flexibly.
You can do it like below.

```javascript
var task = new SubTask('task')
	.src( 'test/js/*.js' )
	.pipe( concat, '{{name}}' )
	.pipe( g.dest, 'test/dest/js' );

task.run({ name : 'all_a.js' });
task.run({ name : 'all_b.js' });
```

You can get 'test/dest/js/all_a.js' and 'test/dest/js/all_b.js'.

### Case4 : Using between gulp pipes.

gulp-subtask is be able to using between gulp pipes.
In that case. You have to make a task without src method.

```javascript
var task4 = new SubTask('task4')
	// Don't call src() method!!
	.pipe( concat, 'all.js' );

g.src( 'test/js/*.js' )
 .pipe( task4.run() )
 .pipe( g.dest('test/dest/js') );
```

Ofcourse you can use options during pipe.

```javascript
var task4 = new SubTask('task4')
	.pipe( concat, '{{name}}' );

g.src( 'test/js/*.js' )
 .pipe( task4.run({name:'all.js'}) )
 .pipe( g.dest('test/dest/js') );
```

### Case5 : Watch the task.

If you want to watch subTask.src and run.
Simply call watch.

```javascript
var task = new SubTask()
	.src( 'test/js/*.js' )
	.pipe( concat, 'all.js' )
	.pipe( g.dest, 'test/dest/js' );

task.watch();
```


## API

### SubTask.src( src );

example

```javescript
task.src(['path/to/js/*.js','!**/*.map'])
```

#### src
Type: `String` or `Array`

### SubTask.pipe( fnc, ...args );

example

```javescript
task.pipe( concat, 'all.js' );
```
```javescript
task.pipe( someTask, arg1, arg2, arg3 );
```

#### fnc
Type: `Function`

What plugins want to use.
Don't call. Set function's reference only.

#### ...args
Type: `Any`

### SubTask.run( options );

example

```javescript
task.run();
```
```javescript
task.run({name:'test.js'});
```

#### options
Type: `Object`

Key-Value Object.

### SubTask.watch( options );

example

```javescript
task.watch();
```
```javescript
task.watch({name:'test.js'});
```

#### options
Type: `Object`

Key-Value Object.

---

LICENSE
-------

(MIT License)

Copyright (c) 2015 [ Hirofumi Kawakita ] https://github.com/hrfm

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
