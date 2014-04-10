function checkURL(host, tld) {
  var url = host + '.' + tld;
  requestURL(url, function(text) {
    var result = JSON.parse(text);
    console.log(url + ': ' + result.code);
    if(result.code === 0) {
      //it is vuln.
      $('.' + host + tld).prepend('<img class="chromebleedError" src="http://jamiehoyle.com/icon128.png" alt="Chromebleed Checker" />');
      return 'fail';
    }
  })
}

function checkElements() {
  $('h3 a').each(function() {
    var checkingURL = ($(this).attr('href'));
    var parsedURL = parseURL(checkingURL);
    console.log(parsedURL.host + '.' + parsedURL.tld);
    $(this).attr('class', parsedURL.host + parsedURL.tld);
    if(checkURL(parsedURL.host, parsedURL.tld) === 'fail') {
      $(this).prepend('<img class="chromebleedError" src="http://jamiehoyle.com/icon128.png" alt="Chromebleed Checker" />');
    } else {
      //do nothing
      return;
    }
  })
}

//upon page load, check page elements
$(document).ready(function() {
  checkElements();
});
