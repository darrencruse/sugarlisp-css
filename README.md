# sugarlisp-css
sugarlisp dialect makes css "first class"

WORK IN PROGRESS

This is a start on a dialect (analogous to the html one) that makes css "first class" by desugaring it to s-expressions.

Once complete it will hopefully provide less/sass type capabilities but using the inherent power of macros and "code is data".

What's here so far is just the parsing that transforms css such as:

    <style>

    .text-error { 
        color: red; 
        text-align: center; 
    }

    body {
        color: #333;
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
        font-size: 14px;
        line-height: 1.42857;
    }

    </style>

into:

    (css-style-tag

      (css-selector .text-error
        (css 
          color red 
          text-align center))

      (css-selector body
        (css 
          color #333 
          font-family (array "Helvetica Neue" Helvetica Arial sans-serif) 
          font-size 14px 
          line-height 1.42857)))

TBD is the "keywords table" side to transform the s-expressions back to css.

As with the html dialect this will probably need versions both to generate the css as strings (for server side rendering), as well as straight to the DOM (for in browser real-time manipulation).



