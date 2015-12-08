
var reader = require('sugarlisp-core/reader');
var sl = require('sugarlisp-core/types');

function testReader(msg, src) {
  console.log('* ' + msg + ' ' + src);
  // the .slss filename extension tells the reader this is sugarlisp css
  var forms = reader.read_from_source(src, 'testReaderCSS.slss');
  //console.log('forms:', JSON.stringify(forms.toJSON()));
  console.log('\n' + sl.pprintSEXP(forms.toJSON(),{bareSymbols: true}) + '\n');
}

testReader('simple css:', '<style>.text-error { color: red; text-align: center; }</style>');

testReader('multi-line css:', '<style>\n' +
'body {\n' +
'    color: #333;\n' +
'    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;\n' +
'    font-size: 14px;\n' +
'    line-height: 1.42857;\n' +
'}\n' +
'</style>');

testReader('multiple css selectors:', '<style>\n' +
'.text-error { color: red; text-align: center; }\n\n' + 
'body {\n' +
'    color: #333;\n' +
'    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;\n' +
'    font-size: 14px;\n' +
'    line-height: 1.42857;\n' +
'}\n' +
'</style>');

