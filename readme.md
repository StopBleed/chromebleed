#Chromebleed Extension in Chrome Store
#Original versions and releases!
Displays a warning if the site you are browsing is affected by the Heartbleed bug.  
Chromebleed originally created by [Jamie Hoyle](https://twitter.com/mightyshakerjnr)  
Active admins and main developers [Tony Alves](https://twitter.com/3_alves) and [Jamie Hoyle](https://twitter.com/mightyshakerjnr)  

There are two mirrors on the Chrome Store.  They are following this repository versions always.  They may have a different versions due to Google release policies.  We are trying to resolve this issue.  
[Chromebleed](https://chrome.google.com/webstore/detail/chromebleed/eeoekjnjgppnaegdjbcafdggilajhpic) version 2.0.0  
[Stopbleed](https://chrome.google.com/webstore/detail/stopbleed/okdekadbjjhbnlmldheinccioijofhgc) Version 2.1.2  

##What does this do?
Many HTTPS-secured sites on the internet use OpenSSL. Unfortunately, a major vulnerability in OpenSSL was disclosed - known as the Heartbleed bug - yesterday that put hundreds of thousands of servers at risk of compromise.  

Whilst some servers have been patched already, many remain that have not been patched. Chromebleed uses a web service developed by [Filippo Valsorda](https://filippo.io/Heartbleed/) and checks the URL of the page you have just loaded. If it is affected by Heartbleed, then a Chrome notification will be displayed. It's as simple as that!  

**Gremlins exist** - this was developed rather late at night. Bugs will exist somewhere!  

## Contributing

Everyone is welcome to help [contribute](CONTRIBUTING.md) and improve this project. There are several ways you can contribute:

* Reporting issues (please read [issue guidelines](https://github.com/necolas/issue-guidelines))
* Suggesting new features
* Writing or refactoring code
* Fixing [issues](https://github.com/StopBleed/chromebleed/issues)
* Make sure to make changes and pull requests to the current version vX.X.X branch.  The master branch is for merged sub versions.  An admin will let you know when to submit a pull request to master. You can always ask in the [issues](https://github.com/StopBleed/chromebleed/issues) section and label `question`, if not sure.
 
##Download from Chrome Store  
Chromebleed [https://chrome.google.com/webstore/detail/chromebleed/eeoekjnjgppnaegdjbcafdggilajhpic](https://chrome.google.com/webstore/detail/chromebleed/eeoekjnjgppnaegdjbcafdggilajhpic)  
Stopbleed [https://chrome.google.com/webstore/detail/stopbleed/okdekadbjjhbnlmldheinccioijofhgc](https://chrome.google.com/webstore/detail/stopbleed/okdekadbjjhbnlmldheinccioijofhgc)

##LICENSE
This software is licensed under [http://opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)
