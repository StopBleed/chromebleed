function checkURL(host, tld, parsedDomain) {
  var url = host + '.' + tld;
  requestURL(parsedDomain, function(text) {
    var result = JSON.parse(text);
    //register it as checked
    if(result.code === 0) {
      //it is vuln.
      $('.' + host + tld).prepend('<img class="chromebleedError" src="http://jamiehoyle.com/icon128.png" alt="Chromebleed Checker" />');
      return 'fail';
    } else {
      //add to the 'okay' register
      isokay.push(parsedDomain);
      while (isokay.length > 250) {
          isokay.shift();
      }
      localStorage.isokay = JSON.stringify(isokay);
    }
  })
}

function checkElements() {
  //set the eid
  eid = $('#rso').attr('eid');
  //and search text
  searchText = $('#gbqfq').val();
  //iterate
  $('h3 a').each(function() {
    var alreadyChecked = 0;
    var checkingURL = ($(this).attr('href'));
    var parsedURL = parseURL(checkingURL);
    $(this).attr('class', parsedURL.host + parsedURL.tld);
    //check if already checked
    if($(this).attr('checkedByChromebleed')) {
      alreadyChecked = 1;
    } else {
      //check if in last 250 URLs
      isokay.some(function(site) {
          if (parsedURL.domain == site) {
              alreadyChecked = 1;
              return true;
          }
      });
    }
    //now check alreadyChecked
    if(alreadyChecked === 0) {
      //it's going to be checked
      $('.' + parsedURL.host + parsedURL.tld).attr('checkedByChromebleed', '1');
      checkURL(parsedURL.host, parsedURL.tld, parsedURL.domain);
    }
  })
}

function waitForLoad() {
//wait for results to display
  if($('.g').length > 0) {
    //elements have arrived
    checkElements();
  } else {
    setTimeout(waitForLoad, 500);
  }
}

function searchUpdate() {
  newEid = $('#rso').attr('eid');
  newSearchText = $('#gbqfq').val();
  if(newEid === eid) {
    setTimeout(searchUpdate, 500);
  } else if(newSearchText === searchText) {
  } else {
    checkElements();
  }
}

//upon page load, check page elements
$(document).ready(function() {
  checkElements();
});

$('#gbqfb').click(function() {
  searchUpdate();
})

$('#gbqfsa').click(function() {
  waitForLoad();
})
