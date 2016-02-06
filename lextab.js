
module.exports = [

  // semicolons delimit css properties
  // note: without this semicolons get treated as comments and cause problems!
  {
    category: 'linecomment',
    match: /\/\//g,
    replace: true
  }

];
