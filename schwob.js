/*
 * $Id: schwob.js,v 1.23 2013/04/01 18:20:52 kili Exp $
 *
 * Derived from lex implementation of schwob by Ralf Zabka and the
 * work on webschwob by Markus Demleitner.
 *
 * Javascript implementation:
 *
 * Copyright (c) 2012, 2013 Matthias Kilian <kili@outback.escape.de>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/*
 * Usage: get a schwobifier object with
 *
 *	var schwob = new Schwoby(true);
 *
 * or
 *
 *	var schwob = new Schwoby(false);
 *
 * Then, translate text with
 *
 *	text = schwob.convert(text);
 *
 * When the constructor is invoked with false as the parameter, the
 * convert method will be a noop, returning just the unchanged text
 * parameter. Otherwise, it'll iterate over the text, doing regular
 * expression matching and replacement according to the rules below.
 *
 * TODO / Known or potential Bugs:
 *
 * - The trailing end context (/{end} in the original lex code) may not
 *   match correctly; there may be some additional special characters
 *   required for proper matching.
 *
 * - There are still problems with trailing context (here implemented
 *   with  (?=...) assertions) if the trailing context may be empty, for
 *   example in the rule
 *
 *		[/ ge(?=[^behrn])/, REPLACE(' g')],
 *
 * - This rule does *not* match " ge" at the end of line. This may be
 *   fixed by either using ((?=[^behrn])|$) or probably by inverting the
 *   asserteion and the character range, .e. use (?![behrn]). There are
 *   other rules where this problem occurs, too, including the rules
 *   with trailing end context.
 *
 * - In general, white space matching in the original code (and currently
 *   used here, too) may be too strict (we probably need character
 *   classes or something similar).
 *
 * - Performance probably sucks compared to the original lex code,
 *   because we always have to match against *all* rules.
 *
 */

// Testing loop. Probably only works with spidermonkeys command line
// tool 'js' and is disabled for this reason:
if (false) {
	var s = new Schwoby(true);
	var l;
	while ((l = readline()) != null)
		print(s.convert(l));
}


function Schwoby(schwob_enabled) {
	if (!schwob_enabled) {
		this.convert = function(text) {
			return text;
		}
		return;
	}

	// Set to true to enable some rule debugging:
	var debug = false;

	function Result(index, out, length) {
		this.index = index;
		this.out = out;
		this.length = length;
		this.skip = index + length;
	}

	function Rule(re, action) {
		this.m = function(text) {
			var match = re.exec(text);
			return match ? action(re, match, text) : null;
		}
	}

	var ECHO = function(re, match) {
		if (debug)
			print('*** ECHO(' + re + ', ' + match + ')');
		return new Result(match.index, match[0], match[0].length);
	}

	var DISCARD = function(re, match) {
		if (debug)
			print('*** DISCARD(' + re + ', ' + match + ')');
		return new Result(match.index, '', match[0].length);
	}

	// Probably only $1 and $2 ever used...
	var subs = [ null, /\$1/g, /\$2/g, /\$3/g, /\$4/g];

	var REPLACE = function(repl) {
		return function(re, match) {
			if (debug)
				print('*** REPLACE(' + repl + ')(' + re + ', ' + match, ')');
			var r = repl;
			for (var i = 1; i < match.length; i++)
				r = r.replace(subs[i], match[i])
			return new Result(match.index, r, match[0].length);
		}
	}

	var rules = [
		// Looks like the first two rules try to deal with HTML
		// markup (remember that this is derived from webschwob,
		// which was written to convert HTML content):
		[/<[^>]*>/, ECHO],
		[/&.[^;]*;/, ECHO],

		[/Wochen/, REPLACE('Woche')],
		[/ ge(?=[d-gk])/, REPLACE(' ')],
		[/ ge(?=[^behrn])/, REPLACE(' g')],
		[/Ein/, REPLACE('Oi')],
		[/ eines /, REPLACE(' von a ')],
		[/ dieser /, REPLACE(' von dene ')],
		[/ des /, REPLACE(' vom ')],
		[/ diesem /, REPLACE(' dem ')],
		[/ richtig/, REPLACE(' recht')],
		[/ heb(?=t|en)/, REPLACE(' lupf')],
		[/ halten /, REPLACE(' heben ')],
		[/ etwas(?=[ .,!?\)\(\n])/, REPLACE(' ebbes')],
		[/ auch(?=[ .,!?\)\(\n])/,  REPLACE(' au')],
		[/ n[ao]ch /, REPLACE(' no ')],
		// XXX: use real umlaut and sharp-s?
		[/ Guten Tag /, REPLACE(' Gruess Gott ')],
		[/hat/, REPLACE('hedd')],
		[/haben?/, REPLACE('hend')],
		[/eine?/, REPLACE('oi')],
		[/en Sie/, REPLACE('et Sie')],
		[/jenige[rsmn]?/, DISCARD],
		[/welche[rsmn]?/, REPLACE('wo')],
		[/([Ww])essen/, REPLACE('$1em sai')],
		[/he?runter/, REPLACE('raa')],
		[/hin(ab|unter)/, REPLACE('naa')],

		// The original lex code contained this, which looks
		// quite wrong for several reasons:
		// 1. The '?' after the "he" is strange;
		// 2. Something like 'rauf' was translated wrongly ('uuff'):
		// ("he"?|"hi")[nr]"auf" printf("%cuff",yytext[2]);
		[/(h[ei])?([nr])auf/, REPLACE('$2uff')],

		[/([Dd])as/, REPLACE('$1es')],
		[/da?ran/, REPLACE('dro')],
		[/ d[ae]nn/, REPLACE(' noh')],
		[/ den/, REPLACE(' den')],
		[/ nein/, REPLACE(' hanoi')],
		[/ sehr(?=[ .,!?\)\(\n])/, REPLACE(' saum‰ﬂich')],
		[/nicht mehr/, REPLACE('nemme')],
		[/ die($|(?=[ .,!?\)\(\n]))/, REPLACE(' d')],
		[/([Nn])ichts(?=[ .,!?\)\(\n])/, REPLACE('$1ix')],
		[/([Nn])icht/, REPLACE('$1edd')],
		[/tiell/, REPLACE('ziell')],
		[/tion/, REPLACE('zion')],
		[/ach/, REPLACE('ach')],
		[/einge/, REPLACE('oig')],
		[/ange/, REPLACE('og')],
		[/uch/, REPLACE('uch')],
		[/au/, REPLACE('au')],
		[/ck/, REPLACE('gg')],
		[/eu/, REPLACE('ei')],
		[/ie(?=b|hs)/, REPLACE('ia')],
		[/ja/, REPLACE('joo')],
		[/ph/, REPLACE('f')],
		[/([Ss])p/, REPLACE('$1chb')],
		[/([Tt])h/, REPLACE('$1h')],
		[/ut(?=t?e)/, REPLACE('uad')],
		[/zu(?![bdegl-prtz])/, REPLACE('z')],
		[/p/, REPLACE('b')],
		[/t/, REPLACE('d')],

		// Original version of the next rule (wich doesn't look
		// like it makes any sense):
		// "auchen$"/{end}	printf("auche");
		[/auchen\$(?=[ .,!?\)\(\n])/, REPLACE('auche')],
		[/sschen(?=[ .,!?\)\(\n])/, REPLACE('ssle')],
		[/schen(?=[ .,!?\)\(\n])/, REPLACE('sche')],
		[/chen(?=[ .,!?\)\(\n])/, REPLACE('le')],

		// In the original, the next two rules were implemented
		// by a single rule wich mached against [Ww]ir ... and
		// then used yytext[0] - 10 for the first character:
		[/ Wir(?=[ .,!?\)\(\n])/, REPLACE(' Mir')],
		[/ wir(?=[ .,!?\)\(\n])/, REPLACE(' mir')],

		[/ern(?=[ .,!?\)\(\n])/, REPLACE('eret')],
		[/([ DMSdms])ich(?=[ .,!?\)\(\n])/, REPLACE('$1i')],
		[/mal(?=[ .,!?\)\(\n])/, REPLACE('mol')],
		[/on(?=[ .,!?\)\(\n])/, REPLACE('o')],
		[/ig(?=[ .,!?\)\(\n])/, REPLACE('ich')],
		[/([bd-gmk])e(?=[ .,!?\)\(\n])/, REPLACE('$1')],
		[/pe(?=[ .,!?\)\(\n])/, REPLACE('b')],
		[/e([lrs])($|(?=[ .,!?\)\(\n]))/, REPLACE('$1')],
		[/(st [Dd]u|st)($|(?=[ .,!?\)\(\n]))/, REPLACE('sch')],
		[/en($|(?=[ .,!?\)\(\n]))/, REPLACE('e')],
		[/([Ss])t/, REPLACE('$1chd')],
		[/(!+)/, REPLACE(', hajo, so isch des $1')],
	];
	this.convert = function(text) {
		// print('convert(' + text + ')');
		if (!text || !text.length)
			return text;
		var parts = [];
		while (text && text.length) {
			var r = null;
			for (var i = 0; i < rules.length; i++) {
				var re = rules[i][0];
				var action = rules[i][1];
				var match = re.exec(text);
				var r1 = match ? action(re, match) : null;
				if (!r1 || r && r.index < r1.index) {
					// No match at all, or match starts
					// later then the previous one  => skip.
					if (debug && r1)
						print('*** DROPPED:' + match);
					continue;
				}
				if (!r || r1.index < r.index || r1.length > r.length)
					// First match, or matches earlier or is
					// longer than the previous one => replace.
					r = r1;
				if (debug && r1)
					print('*** MATCHED: ' + match);
			}
			if (!r) {
				// No match at all. Append text and quit.
				parts.push(text);
				break;
			} else {
				parts.push(text.substring(0, r.index));
				parts.push(r.out);
				text = text.substring(r.skip);
			}
		}
		return parts.join('');
	}
}
