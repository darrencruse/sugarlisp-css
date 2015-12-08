
module.exports = {
  type: "isolate",
  syntax: require('./syntax'),
  "__css_init": function(source) {
    // semi's delimit css properties
    // note: without this semi's get treated as comments and cause problems!
    source.setLinecommentRE(/\/\//g);
  }
};
