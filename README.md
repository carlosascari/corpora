# corpora

**What is a corpus?**
A corpus is a large collection of texts. It is a body of written or spoken material, such as articles, books, conversations, etc. The plural form of corpus is corpora.

**Why would you need a corpus?**
Instead of teaching a computer how to spell or the rules of grammar for a particular language, you'd use a large collection of texts (a corpus), to test against, in order to determine whether a sample of text is properly spelled, has valid grammar, to interpolate missing words, etc.

> By testing against existing texts, a computer can determine how a word SHOULD be spelled as well as where and how a word SHOULD be used.

The way you would actually go about teaching a computer to process text is the basis of Natural Language Processing/Understanding and is not covered here. This is a simple utility, to filter and clean up large collections of texts, for later processing. 

### Samples

You can find a few sample texts in the folder `samples`, they were taken from [textfiles.com](textfiles.com). 

**original**

```
APPLE II HISTORY
===== == =======

Compiled and written by Steven Weyhrich
(C) Copyright 1991, Zonker Software

 (PART 6 -- THE APPLE II PLUS)
[v1.1 :: 12 Dec 91]
```

**processed**

```
APPLE II HISTORY.

Compiled and written by Steven Weyhrich
Copyright 1991, Zonker Software.

PART 6 - THE APPLE II PLUS
v1.1 12 Dec 91.
```

**original**

```
This should be
a single sentence!
```

**processed** 
*Sentence Stitching*

```
This should be a single sentence!
```

## USAGE

There is only a single required argument you must provide, that is the **input** filename or directory. If a folder is specified it will be recursively searched for files to process.

The **output** argument should be a filename to output the resulting corpus after processing all input files. If no output is specified, results will be sent to the console (stdout).

```js
var Corpora = require('./lib/corpora.js')
var corpora = new Corpora()

corpora.input = process.argv[2]
corpora.output = process.argv[3]
corpora.process(function(){
	console.log('FINITO')
})
```

### Custom Processing

By default a series of processing steps are done. They are defined in `default_steps.js`. You can specify your own steps:

**NOTE** Steps are fed directly to `String.prototype.replace` as arguments.

```js
var corpora = new Corpora()

// Step - uppercase
corpora.steps.push(
	[
		/[a-z]+/gi,
		function UPPERCASE(string)
		{
			return string.toUpperCase()
		}
	]
)

// Replace Special Characters with NULL character
corpora.steps.push(
	[
		/[@#$%]+/g,
		0x00
	]
)

// Replace a specific string
corpora.steps.push(
	[
		'John Smith',
		'Adam Smith'
	]
)
```
