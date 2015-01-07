gulp-subtask
============

## Getting started

You can install this module from npm.

```sh
npm install gulp-subtask
```

---

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

### Case3 : Run with options.

gulp-subtask is able to run with using option.

For example. If you want to change flexibly input src, output, and more.

You can do it like below.

```javascript
var task = new SubTask('task')
	.src( '{{src}}' )
	.pipe( concat, '{{concat}}' )
	.pipe( g.dest, 'test/dest/js' );

task.run({
	src    : 'test/js/*.js',
	concat : 'all_a.js'
});
task.run({
	src    : 'test/js/*.js',
	concat : 'all_a.js'
});
```

You can get 'test/dest/js/all_a.js' and 'test/dest/js/all_b.js'.

Options is powerful solution for gulp tasks.  
You can replace all '{{key}}' markers recursivly.

For example...

```javascript
var tsc = new subtask('tsc')
	.src(['{{srcDir}}/*.ts','!**/*.d.ts'])
	.pipe( plumber )
	.pipe( tsc, { declaration : true, out:'{{out}}' })
	.pipe( g.dest, '{{srcDir}}' )
	.pipe( filter, '{{filter}} )
	.pipe( g.dest, '{{dest}}' );

tsc.run({
	'srcDir' : 'path/to/ts',
	'out'    : 'output.js',
	'filter' : ['*','!*.d.ts'],
	'dest'   : 'path/to/dest/js'
});
```

This code is same as below.

```javascript
var tsc = new subtask('tsc')
	.src(['path/to/ts/*.ts','!**/*.d.ts'])
	.pipe( plumber )
	.pipe( tsc, { declaration : true, out:'output.js' })
	.pipe( g.dest, 'path/to/ts' )
	.pipe( filter, ['*','!*.d.ts'] )
	.pipe( g.dest, 'path/to/dest/js' );

tsc.run();
```

If you would like to know replace rules.  
Check out the [Replace Rules](#ReplaceRules) term.

### Case4 : Using between gulp pipes.

gulp-subtask is be able to using between gulp pipes.
In that case. You have to make a task without src method.

```javascript
var task = new SubTask('task')
	// Don't call src() method!!
	.pipe( concat, 'all.js' );

g.src( 'test/js/*.js' )
 .pipe( task.run() )
 .pipe( g.dest('test/dest/js') );
```

Ofcourse you can use options during pipe.

```javascript
var task = new SubTask('task')
	.pipe( concat, '{{name}}' );

g.src( 'test/js/*.js' )
 .pipe( task.run({name:'all.js'}) )
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

---

## <a name ="ReplaceRules">Replace Rules

This term is talking about options replace rules.

### Case 1 : Replace string with one marker only string.

If you want to replace from string to object or array.  
Use only one marker in target string.

- target
```javascript
'{{object}}'
```

- options
```javascript
{
	'object' : {key:'value'}
}
```

- result
```javascript
{key:'value'}
```

### Case 2 : Replace string with multiple marker string.

If target string has multiple markers.
Not string values are automatically replace toString() value.

- target
```javascript
'{{string}} {{object}} {{array}}.'
```

- options
```javascript
{
	'string' : 'This is string.',
	'object' : {'text':'This is object'},
	'array'  : ['This','is','array']
}
```

- result
```javascript
'This is string. [object Object] This,is,array'
```

### Case3 : Replace object or array recursivly

Options can replace markers recursivly.

- target
```javascript
{
	'obj' : {
		'arr' : [
			'{{src}}',
			'dest is {{dest}}'
		],
		'str' : 'src is {{src}}',
		'mix' : [
			'{{src}}',
			[
				'{{obj}}',
				{'str':'{{src}}'}
			]
		]
	}
}
```

- options
```javascript
{
	'src'  : 'path/to/js',
	'dest' : 'path/to/dest',
	'obj'  : {
		'key' : 'value'
	}
}
```

- result
```javascript
{
	'obj' : {
		'arr' : [
			'path/to/js',
			'dest is path/to/dest'
		],
		'str' : 'src is path/to/js',
		'mix' : [
			'path/to/js',
			[
				{'key':'value'},
				{'str':'path/to/js'}
			]
		]
	}
}
```

---

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
