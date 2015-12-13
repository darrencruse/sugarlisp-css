var sl = require('sugarlisp-core/sl-types'),
    reader = require('sugarlisp-core/reader'),
    debug = require('debug')('sugarlisp:css:syntax:info'),
    trace = require('debug')('sugarlisp:css:syntax:trace');

// read list of css selectors
exports.read_css_rules = function(source, start, end, initial) {
    debug("reading css rule set found inside a <style> tag");
    start = start || '<style>';
    end = end || '</style>';
    var styleToken = source.next_token(start);
    var list = (initial && sl.isList(initial) ? initial :
            sl.list(sl.atom("css-style-tag", {token: styleToken})));
    var nextSelector;
    while (!source.eos() && !source.on(end)) {

      source.skip_whitespace();

      nextSelector = read_css_rule_set(source);

      // some "directives" don't return an actual form:
      if(!reader.isignorableform(nextSelector)) {
        list.push(nextSelector);
      }
    }
    if (source.eos()) {
        source.error("Missing \"" + end + "\" ?  (expected \"" + end + "\", got EOF)", startToken);
    }
    list.setClosing(nextSelector);
    source.next_token(end); // skip the end token
    return list;
}

// read a css rule set consisting of a selector and declaration block
// e.g. "body { color: red; }"
function read_css_rule_set(source) {

  // read the first selector
  // note this function expects source is sitting on the selector
  var selectorToken = source.next_token(/([a-zA-Z0-9]+|([a-zA-Z0-9]+)?\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*|\#[_a-zA-Z]+[a-zA-Z0-9_\-\:\.]+)/g);
  trace('reading css rule set with selector "' + selectorToken.text + '"');
  var list = sl.list("css-selector", selectorToken);

  // the declaration block part i.e. the "{ color: red; }" part is read on it's own
  var stylesForm = reader.read(source);

  // but it better be some styles:
  if(sl.isList(stylesForm) && stylesForm.length > 0 &&
    sl.typeOf(stylesForm[0]) === 'symbol' && sl.valueOf(stylesForm[0]) === 'css') {
      list.push(stylesForm);
  }
  else {
    source.error("CSS selector without style definitions", selectorToken);
  }

  return list;
}

// read css declarations i.e. the "{color: red; }" part of "body { color: red; }"
exports.read_css_declaration_block = function(source) {

  trace("reading the css declaration block for a selector (i.e. that part between {})");

  // we expect to called when source is on the opening {
  var startToken = source.next_token("{");
  var list = sl.list(sl.atom("css", {token: startToken}));

  source.skip_whitespace();
  while(!source.eos() && !source.on('}')) {

    var decl = read_css_declaration(source);
    if(decl && decl.propertyForm && decl.valueForm) {
      list.push(decl.propertyForm);
      list.push(decl.valueForm);
    }

    source.skip_whitespace();
  }
  if (source.eos()) {
      source.error("Missing '" + '}' + "', for CSS style definitions", token);
  }
  var endToken = source.next_token('}');
  list.setClosing(endToken);

  return list;
}

/**
* Read a style declaration and return as
*  { propertyForm: prop, valueForm: value}
*/
function read_css_declaration(source) {

  trace('reading a single css declaration within a block (i.e. a "property: value;")');

  var decl = {};
  var stylePropertyToken = source.till(':');
  var stylePropertySymbol = sl.atom(stylePropertyToken);
  decl.propertyForm = stylePropertySymbol;
  trace('the property is "' + decl.propertyForm.value + '"');


  // colons are an individual char separating the pairs:
  // we just skip the colon lispy doesn't use them
  source.skip_text(":");

  // read the style's value:
  decl.valueForm = read_css_declaration_value(source);
  trace('the value is "' + decl.valueForm.value + '"');

  return decl;
}

/**
* Read a declaration value (which may contain multiple comma separated parts)
* If there are commas it's read into a lispy array, otherwise as a symbol
*/
function read_css_declaration_value(source) {
  var list = sl.list("array");

  // read the style's value:
  // We can't go back thru the top level reader since it's assuming things
  // are selectors - I'm missing some notion of context -
  // so is this where this is worthy of a readtable of it's own?
  //    list.push(reader.read(source));
//  var styleValueToken = source.till(/[\;\}]/g);

  source.skip_whitespace();
  while (!source.eos() && !source.on(/[\;\}]/g)) {
    // we use read so that quoted values versus symbols or
    // even math expressions etc. can be used in style values
    var valueForm = reader.read(source);

    // some "directives" don't return an actual form:
    if(!reader.isignorableform(valueForm)) {
      list.push(valueForm);
    }
  }
  if (source.eos()) {
      source.error('Missing ";" or "}" in style declaration', source);
  }
  if(source.on(';')) {
    source.next_token(';'); // skip the end delimiter
  }

  // if it's an array of one don't make it an array at all
  if(list.length <= 2) {
    return list[1];
  }

  return list;
}
