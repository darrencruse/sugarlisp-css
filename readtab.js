var sl = require('sugarlisp-core/sl-types'),
    reader = require('sugarlisp-core/reader'),
    rfuncs = require('./readfuncs'),
    plusrfuncs = require('sugarlisp-plus/readfuncs');

// WHAT YOU REALLY NEED IS A WAY TO SAY IF YOU SEE <style>
// ENABLE THIS READTABLE ON THE FRONT OF THE LIST OF READTABLES
// other question: likewise the valid compile functions like
// cssselector and css should only be visible in the *scope*
// of the style *expression* (similar to but slightly different
// from how the readtable stuff works)
// other question - how am I converting this to a tag?  this
//   part belongs in the html module which can generate the tag
//   *and* as a side effect also enable this readtable
exports['<style>'] = function(lexer) {
  return rfuncs.read_css_rules(lexer);
};

// THEN LIKEWISE THAT WHEN YOU SEE </style> REMOVE THIS READTABLE
// FROM THE FRONT OF THE LIST OF READTABLES
exports['</style>'] = reader.unexpected;

// style definitions
// HERES ANOTHER EXAMPLE OF MISSING CONTEXT SENSITIVITY
// THIS IS EFFECTIVELY GLOBAL OVERRIDING THE JSON AND
// CODE BLOCK USE OF '{' - IT CANT REMAIN THIS WAY
// READTABLES HAVE TO DYNAMICALLY PLUG INTO THE reader
// WHEN THEY HIT SOME SYNTAX THAT TRIGGERS A TRANSITION
// TO THE SYNTAX FOR THE OTHER "DIALECT", WHEREAS THE
// COMPILE FUNCTIONS SHOULD BE HANDLED MORE LIKE "SCOPES"
// I.E. A DIALECT CAN ADD HANDLER FUNCTIONS THAT ONLY APPLY
// WITHIN THE SCOPE OF ONE (OR ALL) OF *IT'S* EXPRESSIONS
exports['{'] = function(lexer) {
  return rfuncs.read_css_declaration_block(lexer);
};
exports['}'] = reader.unexpected;

exports[','] = reader.unexpected;

exports[';'] = reader.unexpected;

exports['\"'] = function(lexer) {
  // a template string becomes either 'str' or (str...)
  return plusrfuncs.read_template_string(lexer, '"', '"', ['str']);
};

// this is a good reference:  http://www.w3schools.com/css/css_selectors.asp
// (most obviously I've ignored the "Grouping Selectors" part - need to revisit)

// ALSO NOTE I'VE NOT SUPPORTED CSS COMMENTS AS DESCRIBED HERE
// http://www.w3schools.com/css/css_syntax.asp
// RIGHT NOW THEY WOULD WORK BECAUSE THEY LOOK LIKE JAVASCRIPT COMMENTS
// BUT AGAIN - THINGS ARENT RIGHT NOW - I SHOULDNT BE GETTING "LUCKY"
// OR UNLUCKY LIKE THIS WITH THE SYNTAXES MINGLING TOGETHER - IF
// CSS COMMENTS ARE /* .. */ AND NOT // THEN THAT NEEDS TO BE
// EXPLICITLY CODED FOR SO /* .. */ IS ACCEPTED AND // IS AN ERROR

/*
exports.rulesafter = [
  {
    // css selector
    match:
      // this is html elem, elem?.class, #id, or  (need to double check correctness)
      /([a-zA-Z0-9]+|([a-zA-Z0-9]+)?\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*|\#[_a-zA-Z]+[a-zA-Z0-9_\-\:\.]+)/g,
    read:
      function(lexer) {
        return rfuncs.read_selector(lexer);
      }
  }
];
*/
