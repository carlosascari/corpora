/**
* Recursively searches directories for filenames
*
* Returns an Array of `fs.Stats`, for each file that was
* found.
*
* @module Corpora
*/
var fs = require('fs')
var path = require('path')

/**
* Extract all files recursively in a list of paths
*
* @method fs_analyze
* @param list {Array} List of filenames/folders as String
* @param baseDir {String} Top Level Directory Path
* @return Array of `fs.Stats` instances
*/
function fs_analyze(list, baseDir)
{
	var files = [], file_size = 0
	for (var i = 0, l = list.length; i < l; i++) 
	{
		var item = list[i]
		var fullpath = path.resolve(baseDir, item)
		var fs_stat = fs.statSync(fullpath)
		fs_stat.filename = fullpath

		if (fs_stat)
		{
			if (fs_stat.isDirectory())
			{
				files.push.apply(files, fs_analyze(fs.readdirSync(fullpath), fullpath))
			}
			else if (fs_stat.isFile())
			{
				files.push(fs_stat)
			}
			else
			{
				// console.log('skipped: %s, not a file or folder.', fullpath)
			}
		}
	}

	return files
}

module.exports = fs_analyze
