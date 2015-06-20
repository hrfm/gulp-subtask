gulp-subtask
============

## Getting started

```sh
npm install gulp-subtask
```

---

## Usage

- [Case1 : Basic usage.](#Case1)
- [Case2 : pipe after sub task](#Case2)
- [Case3 : Run with options.](#Case3)
- [Case4 : Using between gulp pipes.](#Case4)
- [Case5 : Watch the task.](#Case5)
- [Case6 : Do something after run task by watch().](#Case6)
- [Case7 : Using with non stream return plugins.](#Case7)

### At first.

Initialize gulp-subtask with gulp.

```javascript
var g       = require('gulp');
var SubTask = require('gulp-subtask')( g );
```

### <a name ="Case1">Case1 : Basic usage.

Create task likes gulp tasks.

```javascript
var task = new SubTask()
	.src( 'test/js/*.js' )
	.pipe( concat, 'all.js' )
	.on('end',function(){
		console.log('Concat ended.');
	})
	.pipe( g.dest, 'test/dest/js' );

task.run();
```

### <a name ="Case2">Case2 : pipe after sub task

gulp-subtask returns pipe stream.

```javascript
var task = new SubTask('task')
	.src( 'test/js/*.js' )
	.pipe( concat, 'all.js' );

task.run()
	.pipe( g.dest('test/dest/js') );
```

### <a name ="Case3">Case3 : Run with options.

For example. If you want to change flexibly input src, output, and more.

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
	concat : 'all_b.js'
});
```

You can get 'test/dest/js/all_a.js' and 'test/dest/js/all_b.js'.

Options is powerful solution of gulp-subtasks.  
You can replace all '{{key}}' markers recursivly.

For example...

```javascript
var tsc = new subtask('tsc')
	.src(['{{srcDir}}/*.ts','!**/*.d.ts'])
	.pipe( plumber )
	.pipe( tsc, { declaration : true, out:'{{out}}' })
	.pipe( g.dest, '{{srcDir}}' )
	.pipe( filter, '{{filter}}' )
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

### <a name ="Case4">Case4 : Using between gulp pipes.

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

### <a name ="Case5">Case5 : Watch the task.

If you want to watch subTask.src and run.
Simply call watch.

```javascript
var task = new SubTask()
	.src( 'test/js/*.js' )
	.pipe( concat, 'all.js' )
	.pipe( g.dest, 'test/dest/js' );

task.watch();
```

Ofcourse you can use options with watch method.

```javascript
task.watch( options );
```

If you watch with another src.  
Call watchWith method.

```javascript
task.watchWith( 'another/path/to/*js', options );
```

If you watch as another src.  
Call watchAs method.

```javascript
task.watchAs( 'another/path/to/*js', options );
```

### <a name ="Case6">Case6 : Do something after run task by watch().

gulp-subtask can piping other task when watched task run.

```javascript
task.watch( options )
    .on('run',function(subtask){
		subtask.pipe( gulp.dest, '/another/path/to/dest' );
    })
```

### <a name ="Case7">Case 7 : Using with non stream return plugins.

For exsample gulp-typescript pipes not return stream.

```js
gulp.src("*.ts")
	.pipe(typescript())
	.js
	.pipe( gulp.dest("outDir") );
```

In that case. Use done method.

```js
var task = new SubTask()
	.src( "" )
	.pipe( typescript )
	.done(
		function(result,options){
			// This return used after pipe.
			return result.js
		}
	)
	.pipe( g.dest, 'test/dest/js' );

tast.run();
```

```js
var task = new SubTask()
	.src( "{{srcDir}}/*.ts" )
	.pipe( typescript )
	.done(
		function(result,options){
			return result.js.pipe(g.dest(options.srcDir))
		}
	);

task.run({srcDir:"path/to/src"});
```

---

## <a name ="ReplaceRules">Replace Rules

This term is talking about options replace rules.

### Case 1 : Replace string.

If you want to replace from string to object or array.  
Use only one marker in target string.

#### target
```javascript
'{{object}}'
```

#### options
```javascript
{
	'object' : {key:'value'}
}
```

#### result
```javascript
{key:'value'}
```

If target string has charactor other than marker or multiple markers.
Not string values are automatically replace toString() value.

#### target
```javascript
'{{string}} {{object}} {{array}}.'
```

#### options
```javascript
{
	'string' : 'This is string.',
	'object' : {'text':'This is object'},
	'array'  : ['This','is','array']
}
```

#### result
```javascript
'This is string. [object Object] This,is,array'
```

### Case2 : Replace makers in object or array

Options can replace markers in object or array recursivly.

#### target
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

#### options
```javascript
{
	'src'  : 'path/to/js',
	'dest' : 'path/to/dest',
	'obj'  : {
		'key' : 'value'
	}
}
```

#### result
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

### SubTask.run( fnc );

example

```javescript
task.pipe( gulp_typescript )
	.done(function(result){
		result.js.pipe( gulp.dest("out") );
	});
```

#### fnc
Type: `Function`

Call with before pipes result.

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

---

## Update history

    0.3.3 Add done method.