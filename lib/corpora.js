/**
* Provides Corpora class
*
* @example
* 	// filename or folder with files (recursive)
* 	corpora.input = process.argv[2] 
*
* 	// optional, output file name, other wise output
* 	corpora.output = process.argv[3] 
*
*   // Call with default processing steps
* 	corpora.process(function oncomplete(err){
* 	    console.log('FINITO')
* 	})
*
* 	// You may also use your own formatting steps
*   // Array is used as arguments for **String.prototype.replace arguments**
*   corpora.steps.push([/[a-z]+/g], function(v){return v.toUpperCase()})
*   corpora.steps.push([/[#@*]/g], ' ')
*
* @module Corpora
*/
var fs = require('fs')
var path = require('path')
var async = require('async')
var analyze = require('./fs_analyze')

// -----------------------------------------------------------------------------

/**
* Default processing steps used when user does not define their.
*
* @property DEFAULT_STEPS
* @type Array
* @final
*/
var DEFAULT_STEPS = require('./default_steps')

/**
* NOP Callback incase Corpora.process is executed without a callback
*
* @param [err] {Error}
* @private
*/
var NULL_CALLBACK = function(err){if (err instanceof Error) throw err}

/**
* Applies Processing Steps to a specified string
*
* @param string {String}
* @param steps {Array}
* @param cb {Function}
* @private
*/
function apply_steps(string, steps, cb)
{
	async
	.each(
		steps, 
		function apply_step(step, next_step)
		{
			string = string.replace.apply(string, step)
			next_step()
		}, 
		function steps_finished(err)
		{
			setImmediate(cb, err, string)
		}
	)	
}

// -----------------------------------------------------------------------------

/**
* @class Corpora
* @constructor
*/
function Corpora()
{
	Object.defineProperties(this, {
		__data__: {
			configurable: false,
			enumerable: true,
			value: {input: '', output: '', steps: []}
		},
		input: {
			configurable: false,
			enumerable: true,
			get: function(){
				return this.__data__.input
			},
			set: function(val) {
				var stats = fs.statSync(val)
				if (stats)
				{
					stats.filename = val
					this.__data__.input_stats = stats
					this.__data__.input = val
				}
				else
				{
					throw new Error(val + ' must be a filename or folder')
				}				
			},
		},
		output: {
			configurable: false,
			enumerable: true,
			get: function() {
				return this.__data__.output
			},
			set: function(val){
				this.__data__.output = val
			},
		},
		steps: {
			configurable: false,
			enumerable: true,
			get: function(){
				return this.__data__.steps
			},
			set: function(val){
				this.__data__.steps = val
			},
		}
	})
}

/**
* Begins processsing files and outputing merged result.
* 
* @method process
* @param [finito] {Function}
*/
Corpora.prototype.process = function(finito) 
{
	if (!this.input) throw new Error('Input is undefined')

	// Completion Callback
	finito = typeof finito === 'function' ? finito : NULL_CALLBACK 
	
	// Processing Steps
	var steps = (this.steps.length === 0) ? DEFAULT_STEPS : this.steps

	// Files to process
	var tasks = (this.__data__.input_stats.isFile())
				? [this.__data__.input_stats]
				: (this.__data__.input_stats.isDirectory())
					? analyze([this.input], '')
					: []

	// Output Stream
	var fout = (this.output) 
		? fs.createWriteStream(this.output, {flags : 'w'})
		: process.stdout

	// Start processing
	async
	.each(
		tasks, 
		function process_file(task, next)
		{
			// Processing buffer
			var buffer = ''

			// Filename
			var filename = task.filename

			// Input File Stream as utf8 String
			var fin = fs.createReadStream(filename).setEncoding('utf8')
			.on('data', function get_chunk(chunk){
				fin.pause()
				chunk = buffer + chunk
				buffer = ''

				// Processing is applied by chunks of text ending with a new line. This
				// is done so processing is done over complete words.
				var nl_index = chunk.lastIndexOf('\n')
				if (nl_index !== -1)
				{
					var processable = chunk.substr(0, nl_index + 1)
					var leftover = chunk.substr(1 + nl_index)
					buffer += leftover
					apply_steps(
						processable, 
						steps, 
						function processed_chunk(err, processed)
						{
							if (err) throw err 
							fout.write(processed)
							fin.resume()
						}
					)
				}
				else
				{
					// New line was not found, will add chunk to buffer and continue
					buffer += chunk
					fin.resume()
				}
			})
			.on('end', function endof_stream(chunk){
				var processable = (buffer + (chunk || ''))
				apply_steps(
					processable, 
					steps, 
					function processed_chunk(err, processed)
					{
						if (err) throw err 
						fout.write(processed)
						next()
					}
				)
			})
		},
		finito
	)
}

module.exports = Corpora
