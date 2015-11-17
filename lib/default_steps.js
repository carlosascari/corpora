module.exports = [
	[	
		// Replace Special Characeters
		/[^a-zA-Z0-9\n ',\.\-!\?]+/g, 
		''
	],
	[
		// Merge Spaces
		/[ ]{2,}/g, 
		' '
	],
	[
		// Merge Dashes
		/[-]{2,}/g, 
		'-'
	],
	[
		// Merge Exclamation Points 
		/[!]{2,}/g, 
		'!'
	],
	[
		// Merge Question Marks
		/[?]{2,}/g, 
		'?'
	],
	[
		// Remove Leading spaces in new lines 
		/\n[ \t]+/g, 
		'\n'
	],
	[
		// Remove `Lonely Island` Letters that are not `a` or `i`, are never by their self
		/\n+[bcdefghjklmnopqrstuvwxyz\-!?.,]\n+/gi, 
		'\n\n'
	],
	[
		// Leading Lonely Letters
		/\n[bcdefghjklmnopqrstuvwxyz\-!?.,][ \t]*[^\w]/gi, 
		'\n'
	],
	[
		// Join words where appropiate
		/[,\w]+\n[,\w]+/gi, 
		function(match)
		{
			var splitted = match.split('\n')
			var A = splitted[0]
			var B = splitted[1]

			if (isGlue(A))
			{
				return A + ' ' + B
			} 
			else if (isLowerCase(A[0]) && isLowerCase(B[0]))
			{
				return A + ' ' + B
			}
			else if (isLowerCase(A[0]) && isUpperCase(B))
			{
				return A + ' ' + B
			}
			else if (isUpperCase(A) && isUpperCase(B))
			{
				return A + ' ' + B
			}

			return match
		}
	],
	[
		// Expand comma seperators
		/,\w+/gi,
		function(match)
		{
			var notcomma = match.substr(1)
			return ', ' + notcomma
		}
	],
	[
		// Words seperated by two new lines is most 
		// likely seperate sentences, but not always the case.
		/[,\w]+\n+\n[,\w]+/gi,
		function(match)
		{
			var splitted = match.split('\n\n')
			var A = splitted[0]
			var B = splitted[1]

			if (isGlue(A))
			{
				return A + ' ' + B
			}
			else
			{
				var last_char = A[A.length-1]
				return last_char === '.' || last_char === ',' || last_char === '!' || last_char === '?' 
					? A + '\n\n' + B[0].toUpperCase() + B.substr(1)
					: A.trim() + '.' + '\n\n' + ((B) ? B[0].toUpperCase() + B.substr(1) : '')
			}
			return match
		}
	],
	[
		// Reduce New Lines
		/[\n]{3,}/g, '\n\n'
	]
]

function isLowerCase(string)
{
	return string === string.toLowerCase()
}

function isUpperCase(string)
{
	return string === string.toUpperCase()
}

var glues = [ 
	'has', 'be', 'from', 'a', 'and', 'or', 
	'it', 'does', 'then', 'there', 'for', 
	'to', 'these', 'the', 'their', 'which', 
	'an', 'i'
]

function isGlue(word)
{
	return glues.indexOf(word.toLowerCase()) !== -1
}
