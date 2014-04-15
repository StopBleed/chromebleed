#Chromebleed
Displays a warning if the site you are browsing is affected by the Heartbleed bug.  

##What does this do?
Many HTTPS-secured sites on the internet use OpenSSL. Unfortunately, a major vulnerability in OpenSSL was disclosed - known as the Heartbleed bug - yesterday that put hundreds of thousands of servers at risk of compromise.  

Whilst some servers have been patched already, many remain that have not been patched. Chromebleed uses a web service developed by Filippo Valsorda and checks the URL of the page you have just loaded. If it is affected by Heartbleed, then a Chrome notification will be displayed. It's as simple as that!  

**Beware of gremlins** - this was developed in about half an hour rather late at night. Bugs will exist somewhere!  

## Contributing

Everyone is welcome to help [contribute](CONTRIBUTING.md) and improve this project. There are several ways you can contribute:

* Reporting issues (please read [issue guidelines](https://github.com/necolas/issue-guidelines))
* Suggesting new features
* Writing or refactoring code
* Fixing [issues](https://github.com/StopBleed/chromebleed/issues)
 
##Download  
https://chrome.google.com/webstore/detail/chromebleed/eeoekjnjgppnaegdjbcafdggilajhpic

##LICENSE
This software is licensed under [http://opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)
