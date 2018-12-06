/*! URI.js v1.19.1 http://medialize.github.io/URI.js/ */
/* build contains: IPv6.js, URI.js, URITemplate.js, jquery.URI.js */
/*
 URI.js - Mutating URLs
 IPv6 Support

 Version: 1.19.1

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
   MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs

 Version: 1.19.1

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
   MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs
 URI Template Support - http://tools.ietf.org/html/rfc6570

 Version: 1.19.1

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
   MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs
 jQuery Plugin

 Version: 1.19.1

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/jquery-uri-plugin.html

 Licensed under
   MIT License http://www.opensource.org/licenses/mit-license

*/
(function(f,l){"object"===typeof module&&module.exports?module.exports=l():"function"===typeof define&&define.amd?define(l):f.IPv6=l(f)})(this,function(f){var l=f&&f.IPv6;return{best:function(g){g=g.toLowerCase().split(":");var f=g.length,c=8;""===g[0]&&""===g[1]&&""===g[2]?(g.shift(),g.shift()):""===g[0]&&""===g[1]?g.shift():""===g[f-1]&&""===g[f-2]&&g.pop();f=g.length;-1!==g[f-1].indexOf(".")&&(c=7);var n;for(n=0;n<f&&""!==g[n];n++);if(n<c)for(g.splice(n,1,"0000");g.length<c;)g.splice(n,0,"0000");
for(n=0;n<c;n++){f=g[n].split("");for(var l=0;3>l;l++)if("0"===f[0]&&1<f.length)f.splice(0,1);else break;g[n]=f.join("")}f=-1;var r=l=0,q=-1,m=!1;for(n=0;n<c;n++)m?"0"===g[n]?r+=1:(m=!1,r>l&&(f=q,l=r)):"0"===g[n]&&(m=!0,q=n,r=1);r>l&&(f=q,l=r);1<l&&g.splice(f,l,"");f=g.length;c="";""===g[0]&&(c=":");for(n=0;n<f;n++){c+=g[n];if(n===f-1)break;c+=":"}""===g[f-1]&&(c+=":");return c},noConflict:function(){f.IPv6===this&&(f.IPv6=l);return this}}});
(function(f,l){"object"===typeof module&&module.exports?module.exports=l(require("./punycode"),require("./IPv6"),require("./SecondLevelDomains")):"function"===typeof define&&define.amd?define(["./punycode","./IPv6","./SecondLevelDomains"],l):f.URI=l(f.punycode,f.IPv6,f.SecondLevelDomains,f)})(this,function(f,l,g,u){function c(a,b){var d=1<=arguments.length,k=2<=arguments.length;if(!(this instanceof c))return d?k?new c(a,b):new c(a):new c;if(void 0===a){if(d)throw new TypeError("undefined is not a valid argument for URI");
a="undefined"!==typeof location?location.href+"":""}if(null===a&&d)throw new TypeError("null is not a valid argument for URI");this.href(a);return void 0!==b?this.absoluteTo(b):this}function n(a){return a.replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}function A(a){return void 0===a?"Undefined":String(Object.prototype.toString.call(a)).slice(8,-1)}function r(a){return"Array"===A(a)}function q(a,b){var d={},c;if("RegExp"===A(b))d=null;else if(r(b)){var p=0;for(c=b.length;p<c;p++)d[b[p]]=!0}else d[b]=
!0;p=0;for(c=a.length;p<c;p++)if(d&&void 0!==d[a[p]]||!d&&b.test(a[p]))a.splice(p,1),c--,p--;return a}function m(a,b){var d;if(r(b)){var c=0;for(d=b.length;c<d;c++)if(!m(a,b[c]))return!1;return!0}var p=A(b);c=0;for(d=a.length;c<d;c++)if("RegExp"===p){if("string"===typeof a[c]&&a[c].match(b))return!0}else if(a[c]===b)return!0;return!1}function x(a,b){if(!r(a)||!r(b)||a.length!==b.length)return!1;a.sort();b.sort();for(var d=0,c=a.length;d<c;d++)if(a[d]!==b[d])return!1;return!0}function h(a){return a.replace(/^\/+|\/+$/g,
"")}function t(a){return escape(a)}function B(a){return encodeURIComponent(a).replace(/[!'()*]/g,t).replace(/\*/g,"%2A")}function y(a){return function(b,d){if(void 0===b)return this._parts[a]||"";this._parts[a]=b||null;this.build(!d);return this}}function E(a,b){return function(d,c){if(void 0===d)return this._parts[a]||"";null!==d&&(d+="",d.charAt(0)===b&&(d=d.substring(1)));this._parts[a]=d;this.build(!c);return this}}var v=u&&u.URI;c.version="1.19.1";var e=c.prototype,z=Object.prototype.hasOwnProperty;
c._parts=function(){return{protocol:null,username:null,password:null,hostname:null,urn:null,port:null,path:null,query:null,fragment:null,preventInvalidHostname:c.preventInvalidHostname,duplicateQueryParameters:c.duplicateQueryParameters,escapeQuerySpace:c.escapeQuerySpace}};c.preventInvalidHostname=!1;c.duplicateQueryParameters=!1;c.escapeQuerySpace=!0;c.protocol_expression=/^[a-z][a-z0-9.+-]*$/i;c.idn_expression=/[^a-z0-9\._-]/i;c.punycode_expression=/(xn--)/i;c.ip4_expression=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
c.ip6_expression=/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
c.find_uri_expression=/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019]))/ig;c.findUri={start:/\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,end:/[\s\r\n]|$/,trim:/[`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u201e\u2018\u2019]+$/,parens:/(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g};c.defaultPorts={http:"80",https:"443",ftp:"21",
gopher:"70",ws:"80",wss:"443"};c.hostProtocols=["http","https"];c.invalid_hostname_characters=/[^a-zA-Z0-9\.\-:_]/;c.domAttributes={a:"href",blockquote:"cite",link:"href",base:"href",script:"src",form:"action",img:"src",area:"href",iframe:"src",embed:"src",source:"src",track:"src",input:"src",audio:"src",video:"src"};c.getDomAttribute=function(a){if(a&&a.nodeName){var b=a.nodeName.toLowerCase();if("input"!==b||"image"===a.type)return c.domAttributes[b]}};c.encode=B;c.decode=decodeURIComponent;c.iso8859=
function(){c.encode=escape;c.decode=unescape};c.unicode=function(){c.encode=B;c.decode=decodeURIComponent};c.characters={pathname:{encode:{expression:/%(24|26|2B|2C|3B|3D|3A|40)/ig,map:{"%24":"$","%26":"&","%2B":"+","%2C":",","%3B":";","%3D":"=","%3A":":","%40":"@"}},decode:{expression:/[\/\?#]/g,map:{"/":"%2F","?":"%3F","#":"%23"}}},reserved:{encode:{expression:/%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,map:{"%3A":":","%2F":"/","%3F":"?","%23":"#","%5B":"[","%5D":"]","%40":"@",
"%21":"!","%24":"$","%26":"&","%27":"'","%28":"(","%29":")","%2A":"*","%2B":"+","%2C":",","%3B":";","%3D":"="}}},urnpath:{encode:{expression:/%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,map:{"%21":"!","%24":"$","%27":"'","%28":"(","%29":")","%2A":"*","%2B":"+","%2C":",","%3B":";","%3D":"=","%40":"@"}},decode:{expression:/[\/\?#:]/g,map:{"/":"%2F","?":"%3F","#":"%23",":":"%3A"}}}};c.encodeQuery=function(a,b){var d=c.encode(a+"");void 0===b&&(b=c.escapeQuerySpace);return b?d.replace(/%20/g,"+"):d};c.decodeQuery=
function(a,b){a+="";void 0===b&&(b=c.escapeQuerySpace);try{return c.decode(b?a.replace(/\+/g,"%20"):a)}catch(d){return a}};var C={encode:"encode",decode:"decode"},w,D=function(a,b){return function(d){try{return c[b](d+"").replace(c.characters[a][b].expression,function(d){return c.characters[a][b].map[d]})}catch(k){return d}}};for(w in C)c[w+"PathSegment"]=D("pathname",C[w]),c[w+"UrnPathSegment"]=D("urnpath",C[w]);C=function(a,b,d){return function(k){var p=d?function(a){return c[b](c[d](a))}:c[b];
k=(k+"").split(a);for(var e=0,h=k.length;e<h;e++)k[e]=p(k[e]);return k.join(a)}};c.decodePath=C("/","decodePathSegment");c.decodeUrnPath=C(":","decodeUrnPathSegment");c.recodePath=C("/","encodePathSegment","decode");c.recodeUrnPath=C(":","encodeUrnPathSegment","decode");c.encodeReserved=D("reserved","encode");c.parse=function(a,b){b||(b={preventInvalidHostname:c.preventInvalidHostname});var d=a.indexOf("#");-1<d&&(b.fragment=a.substring(d+1)||null,a=a.substring(0,d));d=a.indexOf("?");-1<d&&(b.query=
a.substring(d+1)||null,a=a.substring(0,d));"//"===a.substring(0,2)?(b.protocol=null,a=a.substring(2),a=c.parseAuthority(a,b)):(d=a.indexOf(":"),-1<d&&(b.protocol=a.substring(0,d)||null,b.protocol&&!b.protocol.match(c.protocol_expression)?b.protocol=void 0:"//"===a.substring(d+1,d+3)?(a=a.substring(d+3),a=c.parseAuthority(a,b)):(a=a.substring(d+1),b.urn=!0)));b.path=a;return b};c.parseHost=function(a,b){a||(a="");a=a.replace(/\\/g,"/");var d=a.indexOf("/");-1===d&&(d=a.length);if("["===a.charAt(0)){var k=
a.indexOf("]");b.hostname=a.substring(1,k)||null;b.port=a.substring(k+2,d)||null;"/"===b.port&&(b.port=null)}else{var p=a.indexOf(":");k=a.indexOf("/");p=a.indexOf(":",p+1);-1!==p&&(-1===k||p<k)?(b.hostname=a.substring(0,d)||null,b.port=null):(k=a.substring(0,d).split(":"),b.hostname=k[0]||null,b.port=k[1]||null)}b.hostname&&"/"!==a.substring(d).charAt(0)&&(d++,a="/"+a);b.preventInvalidHostname&&c.ensureValidHostname(b.hostname,b.protocol);b.port&&c.ensureValidPort(b.port);return a.substring(d)||
"/"};c.parseAuthority=function(a,b){a=c.parseUserinfo(a,b);return c.parseHost(a,b)};c.parseUserinfo=function(a,b){var d=a.indexOf("/"),k=a.lastIndexOf("@",-1<d?d:a.length-1);-1<k&&(-1===d||k<d)?(d=a.substring(0,k).split(":"),b.username=d[0]?c.decode(d[0]):null,d.shift(),b.password=d[0]?c.decode(d.join(":")):null,a=a.substring(k+1)):(b.username=null,b.password=null);return a};c.parseQuery=function(a,b){if(!a)return{};a=a.replace(/&+/g,"&").replace(/^\?*&*|&+$/g,"");if(!a)return{};for(var d={},k=a.split("&"),
p=k.length,e,h,f=0;f<p;f++)if(e=k[f].split("="),h=c.decodeQuery(e.shift(),b),e=e.length?c.decodeQuery(e.join("="),b):null,z.call(d,h)){if("string"===typeof d[h]||null===d[h])d[h]=[d[h]];d[h].push(e)}else d[h]=e;return d};c.build=function(a){var b="";a.protocol&&(b+=a.protocol+":");a.urn||!b&&!a.hostname||(b+="//");b+=c.buildAuthority(a)||"";"string"===typeof a.path&&("/"!==a.path.charAt(0)&&"string"===typeof a.hostname&&(b+="/"),b+=a.path);"string"===typeof a.query&&a.query&&(b+="?"+a.query);"string"===
typeof a.fragment&&a.fragment&&(b+="#"+a.fragment);return b};c.buildHost=function(a){var b="";if(a.hostname)b=c.ip6_expression.test(a.hostname)?b+("["+a.hostname+"]"):b+a.hostname;else return"";a.port&&(b+=":"+a.port);return b};c.buildAuthority=function(a){return c.buildUserinfo(a)+c.buildHost(a)};c.buildUserinfo=function(a){var b="";a.username&&(b+=c.encode(a.username));a.password&&(b+=":"+c.encode(a.password));b&&(b+="@");return b};c.buildQuery=function(a,b,d){var k="",p,e;for(p in a)if(z.call(a,
p)&&p)if(r(a[p])){var h={};var f=0;for(e=a[p].length;f<e;f++)void 0!==a[p][f]&&void 0===h[a[p][f]+""]&&(k+="&"+c.buildQueryParameter(p,a[p][f],d),!0!==b&&(h[a[p][f]+""]=!0))}else void 0!==a[p]&&(k+="&"+c.buildQueryParameter(p,a[p],d));return k.substring(1)};c.buildQueryParameter=function(a,b,d){return c.encodeQuery(a,d)+(null!==b?"="+c.encodeQuery(b,d):"")};c.addQuery=function(a,b,d){if("object"===typeof b)for(var k in b)z.call(b,k)&&c.addQuery(a,k,b[k]);else if("string"===typeof b)void 0===a[b]?
a[b]=d:("string"===typeof a[b]&&(a[b]=[a[b]]),r(d)||(d=[d]),a[b]=(a[b]||[]).concat(d));else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");};c.setQuery=function(a,b,d){if("object"===typeof b)for(var k in b)z.call(b,k)&&c.setQuery(a,k,b[k]);else if("string"===typeof b)a[b]=void 0===d?null:d;else throw new TypeError("URI.setQuery() accepts an object, string as the name parameter");};c.removeQuery=function(a,b,d){var k;if(r(b))for(d=0,k=b.length;d<k;d++)a[b[d]]=
void 0;else if("RegExp"===A(b))for(k in a)b.test(k)&&(a[k]=void 0);else if("object"===typeof b)for(k in b)z.call(b,k)&&c.removeQuery(a,k,b[k]);else if("string"===typeof b)void 0!==d?"RegExp"===A(d)?!r(a[b])&&d.test(a[b])?a[b]=void 0:a[b]=q(a[b],d):a[b]!==String(d)||r(d)&&1!==d.length?r(a[b])&&(a[b]=q(a[b],d)):a[b]=void 0:a[b]=void 0;else throw new TypeError("URI.removeQuery() accepts an object, string, RegExp as the first parameter");};c.hasQuery=function(a,b,d,k){switch(A(b)){case "String":break;
case "RegExp":for(var p in a)if(z.call(a,p)&&b.test(p)&&(void 0===d||c.hasQuery(a,p,d)))return!0;return!1;case "Object":for(var e in b)if(z.call(b,e)&&!c.hasQuery(a,e,b[e]))return!1;return!0;default:throw new TypeError("URI.hasQuery() accepts a string, regular expression or object as the name parameter");}switch(A(d)){case "Undefined":return b in a;case "Boolean":return a=!(r(a[b])?!a[b].length:!a[b]),d===a;case "Function":return!!d(a[b],b,a);case "Array":return r(a[b])?(k?m:x)(a[b],d):!1;case "RegExp":return r(a[b])?
k?m(a[b],d):!1:!(!a[b]||!a[b].match(d));case "Number":d=String(d);case "String":return r(a[b])?k?m(a[b],d):!1:a[b]===d;default:throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");}};c.joinPaths=function(){for(var a=[],b=[],d=0,k=0;k<arguments.length;k++){var p=new c(arguments[k]);a.push(p);p=p.segment();for(var e=0;e<p.length;e++)"string"===typeof p[e]&&b.push(p[e]),p[e]&&d++}if(!b.length||!d)return new c("");b=(new c("")).segment(b);
""!==a[0].path()&&"/"!==a[0].path().slice(0,1)||b.path("/"+b.path());return b.normalize()};c.commonPath=function(a,b){var d=Math.min(a.length,b.length),c;for(c=0;c<d;c++)if(a.charAt(c)!==b.charAt(c)){c--;break}if(1>c)return a.charAt(0)===b.charAt(0)&&"/"===a.charAt(0)?"/":"";if("/"!==a.charAt(c)||"/"!==b.charAt(c))c=a.substring(0,c).lastIndexOf("/");return a.substring(0,c+1)};c.withinString=function(a,b,d){d||(d={});var k=d.start||c.findUri.start,p=d.end||c.findUri.end,e=d.trim||c.findUri.trim,h=
d.parens||c.findUri.parens,f=/[a-z0-9-]=["']?$/i;for(k.lastIndex=0;;){var q=k.exec(a);if(!q)break;var g=q.index;if(d.ignoreHtml){var t=a.slice(Math.max(g-3,0),g);if(t&&f.test(t))continue}var m=g+a.slice(g).search(p);t=a.slice(g,m);for(m=-1;;){var B=h.exec(t);if(!B)break;m=Math.max(m,B.index+B[0].length)}t=-1<m?t.slice(0,m)+t.slice(m).replace(e,""):t.replace(e,"");t.length<=q[0].length||d.ignore&&d.ignore.test(t)||(m=g+t.length,q=b(t,g,m,a),void 0===q?k.lastIndex=m:(q=String(q),a=a.slice(0,g)+q+a.slice(m),
k.lastIndex=g+q.length))}k.lastIndex=0;return a};c.ensureValidHostname=function(a,b){var d=!!a,k=!1;b&&(k=m(c.hostProtocols,b));if(k&&!d)throw new TypeError("Hostname cannot be empty, if protocol is "+b);if(a&&a.match(c.invalid_hostname_characters)){if(!f)throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-:_] and Punycode.js is not available');if(f.toASCII(a).match(c.invalid_hostname_characters))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-:_]');
}};c.ensureValidPort=function(a){if(a){var b=Number(a);if(!(/^[0-9]+$/.test(b)&&0<b&&65536>b))throw new TypeError('Port "'+a+'" is not a valid port');}};c.noConflict=function(a){if(a)return a={URI:this.noConflict()},u.URITemplate&&"function"===typeof u.URITemplate.noConflict&&(a.URITemplate=u.URITemplate.noConflict()),u.IPv6&&"function"===typeof u.IPv6.noConflict&&(a.IPv6=u.IPv6.noConflict()),u.SecondLevelDomains&&"function"===typeof u.SecondLevelDomains.noConflict&&(a.SecondLevelDomains=u.SecondLevelDomains.noConflict()),
a;u.URI===this&&(u.URI=v);return this};e.build=function(a){if(!0===a)this._deferred_build=!0;else if(void 0===a||this._deferred_build)this._string=c.build(this._parts),this._deferred_build=!1;return this};e.clone=function(){return new c(this)};e.valueOf=e.toString=function(){return this.build(!1)._string};e.protocol=y("protocol");e.username=y("username");e.password=y("password");e.hostname=y("hostname");e.port=y("port");e.query=E("query","?");e.fragment=E("fragment","#");e.search=function(a,b){var d=
this.query(a,b);return"string"===typeof d&&d.length?"?"+d:d};e.hash=function(a,b){var d=this.fragment(a,b);return"string"===typeof d&&d.length?"#"+d:d};e.pathname=function(a,b){if(void 0===a||!0===a){var d=this._parts.path||(this._parts.hostname?"/":"");return a?(this._parts.urn?c.decodeUrnPath:c.decodePath)(d):d}this._parts.path=this._parts.urn?a?c.recodeUrnPath(a):"":a?c.recodePath(a):"/";this.build(!b);return this};e.path=e.pathname;e.href=function(a,b){var d;if(void 0===a)return this.toString();
this._string="";this._parts=c._parts();var k=a instanceof c,e="object"===typeof a&&(a.hostname||a.path||a.pathname);a.nodeName&&(e=c.getDomAttribute(a),a=a[e]||"",e=!1);!k&&e&&void 0!==a.pathname&&(a=a.toString());if("string"===typeof a||a instanceof String)this._parts=c.parse(String(a),this._parts);else if(k||e){k=k?a._parts:a;for(d in k)"query"!==d&&z.call(this._parts,d)&&(this._parts[d]=k[d]);k.query&&this.query(k.query,!1)}else throw new TypeError("invalid input");this.build(!b);return this};
e.is=function(a){var b=!1,d=!1,k=!1,e=!1,h=!1,f=!1,q=!1,t=!this._parts.urn;this._parts.hostname&&(t=!1,d=c.ip4_expression.test(this._parts.hostname),k=c.ip6_expression.test(this._parts.hostname),b=d||k,h=(e=!b)&&g&&g.has(this._parts.hostname),f=e&&c.idn_expression.test(this._parts.hostname),q=e&&c.punycode_expression.test(this._parts.hostname));switch(a.toLowerCase()){case "relative":return t;case "absolute":return!t;case "domain":case "name":return e;case "sld":return h;case "ip":return b;case "ip4":case "ipv4":case "inet4":return d;
case "ip6":case "ipv6":case "inet6":return k;case "idn":return f;case "url":return!this._parts.urn;case "urn":return!!this._parts.urn;case "punycode":return q}return null};var F=e.protocol,G=e.port,H=e.hostname;e.protocol=function(a,b){if(a&&(a=a.replace(/:(\/\/)?$/,""),!a.match(c.protocol_expression)))throw new TypeError('Protocol "'+a+"\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");return F.call(this,a,b)};e.scheme=e.protocol;e.port=function(a,b){if(this._parts.urn)return void 0===
a?"":this;void 0!==a&&(0===a&&(a=null),a&&(a+="",":"===a.charAt(0)&&(a=a.substring(1)),c.ensureValidPort(a)));return G.call(this,a,b)};e.hostname=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0!==a){var d={preventInvalidHostname:this._parts.preventInvalidHostname};if("/"!==c.parseHost(a,d))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-]');a=d.hostname;this._parts.preventInvalidHostname&&c.ensureValidHostname(a,this._parts.protocol)}return H.call(this,
a,b)};e.origin=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a){var d=this.protocol();return this.authority()?(d?d+"://":"")+this.authority():""}d=c(a);this.protocol(d.protocol()).authority(d.authority()).build(!b);return this};e.host=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a)return this._parts.hostname?c.buildHost(this._parts):"";if("/"!==c.parseHost(a,this._parts))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-]');
this.build(!b);return this};e.authority=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a)return this._parts.hostname?c.buildAuthority(this._parts):"";if("/"!==c.parseAuthority(a,this._parts))throw new TypeError('Hostname "'+a+'" contains characters other than [A-Z0-9.-]');this.build(!b);return this};e.userinfo=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a){var d=c.buildUserinfo(this._parts);return d?d.substring(0,d.length-1):d}"@"!==a[a.length-1]&&
(a+="@");c.parseUserinfo(a,this._parts);this.build(!b);return this};e.resource=function(a,b){if(void 0===a)return this.path()+this.search()+this.hash();var d=c.parse(a);this._parts.path=d.path;this._parts.query=d.query;this._parts.fragment=d.fragment;this.build(!b);return this};e.subdomain=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a){if(!this._parts.hostname||this.is("IP"))return"";var d=this._parts.hostname.length-this.domain().length-1;return this._parts.hostname.substring(0,
d)||""}d=this._parts.hostname.length-this.domain().length;d=this._parts.hostname.substring(0,d);d=new RegExp("^"+n(d));a&&"."!==a.charAt(a.length-1)&&(a+=".");if(-1!==a.indexOf(":"))throw new TypeError("Domains cannot contain colons");a&&c.ensureValidHostname(a,this._parts.protocol);this._parts.hostname=this._parts.hostname.replace(d,a);this.build(!b);return this};e.domain=function(a,b){if(this._parts.urn)return void 0===a?"":this;"boolean"===typeof a&&(b=a,a=void 0);if(void 0===a){if(!this._parts.hostname||
this.is("IP"))return"";var d=this._parts.hostname.match(/\./g);if(d&&2>d.length)return this._parts.hostname;d=this._parts.hostname.length-this.tld(b).length-1;d=this._parts.hostname.lastIndexOf(".",d-1)+1;return this._parts.hostname.substring(d)||""}if(!a)throw new TypeError("cannot set domain empty");if(-1!==a.indexOf(":"))throw new TypeError("Domains cannot contain colons");c.ensureValidHostname(a,this._parts.protocol);!this._parts.hostname||this.is("IP")?this._parts.hostname=a:(d=new RegExp(n(this.domain())+
"$"),this._parts.hostname=this._parts.hostname.replace(d,a));this.build(!b);return this};e.tld=function(a,b){if(this._parts.urn)return void 0===a?"":this;"boolean"===typeof a&&(b=a,a=void 0);if(void 0===a){if(!this._parts.hostname||this.is("IP"))return"";var d=this._parts.hostname.lastIndexOf(".");d=this._parts.hostname.substring(d+1);return!0!==b&&g&&g.list[d.toLowerCase()]?g.get(this._parts.hostname)||d:d}if(a)if(a.match(/[^a-zA-Z0-9-]/))if(g&&g.is(a))d=new RegExp(n(this.tld())+"$"),this._parts.hostname=
this._parts.hostname.replace(d,a);else throw new TypeError('TLD "'+a+'" contains characters other than [A-Z0-9]');else{if(!this._parts.hostname||this.is("IP"))throw new ReferenceError("cannot set TLD on non-domain host");d=new RegExp(n(this.tld())+"$");this._parts.hostname=this._parts.hostname.replace(d,a)}else throw new TypeError("cannot set TLD empty");this.build(!b);return this};e.directory=function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a||!0===a){if(!this._parts.path&&
!this._parts.hostname)return"";if("/"===this._parts.path)return"/";var d=this._parts.path.length-this.filename().length-1;d=this._parts.path.substring(0,d)||(this._parts.hostname?"/":"");return a?c.decodePath(d):d}d=this._parts.path.length-this.filename().length;d=this._parts.path.substring(0,d);d=new RegExp("^"+n(d));this.is("relative")||(a||(a="/"),"/"!==a.charAt(0)&&(a="/"+a));a&&"/"!==a.charAt(a.length-1)&&(a+="/");a=c.recodePath(a);this._parts.path=this._parts.path.replace(d,a);this.build(!b);
return this};e.filename=function(a,b){if(this._parts.urn)return void 0===a?"":this;if("string"!==typeof a){if(!this._parts.path||"/"===this._parts.path)return"";var d=this._parts.path.lastIndexOf("/");d=this._parts.path.substring(d+1);return a?c.decodePathSegment(d):d}d=!1;"/"===a.charAt(0)&&(a=a.substring(1));a.match(/\.?\//)&&(d=!0);var k=new RegExp(n(this.filename())+"$");a=c.recodePath(a);this._parts.path=this._parts.path.replace(k,a);d?this.normalizePath(b):this.build(!b);return this};e.suffix=
function(a,b){if(this._parts.urn)return void 0===a?"":this;if(void 0===a||!0===a){if(!this._parts.path||"/"===this._parts.path)return"";var d=this.filename(),k=d.lastIndexOf(".");if(-1===k)return"";d=d.substring(k+1);d=/^[a-z0-9%]+$/i.test(d)?d:"";return a?c.decodePathSegment(d):d}"."===a.charAt(0)&&(a=a.substring(1));if(d=this.suffix())k=a?new RegExp(n(d)+"$"):new RegExp(n("."+d)+"$");else{if(!a)return this;this._parts.path+="."+c.recodePath(a)}k&&(a=c.recodePath(a),this._parts.path=this._parts.path.replace(k,
a));this.build(!b);return this};e.segment=function(a,b,d){var c=this._parts.urn?":":"/",e=this.path(),f="/"===e.substring(0,1);e=e.split(c);void 0!==a&&"number"!==typeof a&&(d=b,b=a,a=void 0);if(void 0!==a&&"number"!==typeof a)throw Error('Bad segment "'+a+'", must be 0-based integer');f&&e.shift();0>a&&(a=Math.max(e.length+a,0));if(void 0===b)return void 0===a?e:e[a];if(null===a||void 0===e[a])if(r(b)){e=[];a=0;for(var q=b.length;a<q;a++)if(b[a].length||e.length&&e[e.length-1].length)e.length&&!e[e.length-
1].length&&e.pop(),e.push(h(b[a]))}else{if(b||"string"===typeof b)b=h(b),""===e[e.length-1]?e[e.length-1]=b:e.push(b)}else b?e[a]=h(b):e.splice(a,1);f&&e.unshift("");return this.path(e.join(c),d)};e.segmentCoded=function(a,b,d){var e;"number"!==typeof a&&(d=b,b=a,a=void 0);if(void 0===b){a=this.segment(a,b,d);if(r(a)){var h=0;for(e=a.length;h<e;h++)a[h]=c.decode(a[h])}else a=void 0!==a?c.decode(a):void 0;return a}if(r(b))for(h=0,e=b.length;h<e;h++)b[h]=c.encode(b[h]);else b="string"===typeof b||b instanceof
String?c.encode(b):b;return this.segment(a,b,d)};var I=e.query;e.query=function(a,b){if(!0===a)return c.parseQuery(this._parts.query,this._parts.escapeQuerySpace);if("function"===typeof a){var d=c.parseQuery(this._parts.query,this._parts.escapeQuerySpace),e=a.call(this,d);this._parts.query=c.buildQuery(e||d,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace);this.build(!b);return this}return void 0!==a&&"string"!==typeof a?(this._parts.query=c.buildQuery(a,this._parts.duplicateQueryParameters,
this._parts.escapeQuerySpace),this.build(!b),this):I.call(this,a,b)};e.setQuery=function(a,b,d){var e=c.parseQuery(this._parts.query,this._parts.escapeQuerySpace);if("string"===typeof a||a instanceof String)e[a]=void 0!==b?b:null;else if("object"===typeof a)for(var h in a)z.call(a,h)&&(e[h]=a[h]);else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");this._parts.query=c.buildQuery(e,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace);"string"!==typeof a&&
(d=b);this.build(!d);return this};e.addQuery=function(a,b,d){var e=c.parseQuery(this._parts.query,this._parts.escapeQuerySpace);c.addQuery(e,a,void 0===b?null:b);this._parts.query=c.buildQuery(e,this._parts.duplicateQueryParameters,this._parts.escapeQuerySpace);"string"!==typeof a&&(d=b);this.build(!d);return this};e.removeQuery=function(a,b,d){var e=c.parseQuery(this._parts.query,this._parts.escapeQuerySpace);c.removeQuery(e,a,b);this._parts.query=c.buildQuery(e,this._parts.duplicateQueryParameters,
this._parts.escapeQuerySpace);"string"!==typeof a&&(d=b);this.build(!d);return this};e.hasQuery=function(a,b,d){var e=c.parseQuery(this._parts.query,this._parts.escapeQuerySpace);return c.hasQuery(e,a,b,d)};e.setSearch=e.setQuery;e.addSearch=e.addQuery;e.removeSearch=e.removeQuery;e.hasSearch=e.hasQuery;e.normalize=function(){return this._parts.urn?this.normalizeProtocol(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build():this.normalizeProtocol(!1).normalizeHostname(!1).normalizePort(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build()};
e.normalizeProtocol=function(a){"string"===typeof this._parts.protocol&&(this._parts.protocol=this._parts.protocol.toLowerCase(),this.build(!a));return this};e.normalizeHostname=function(a){this._parts.hostname&&(this.is("IDN")&&f?this._parts.hostname=f.toASCII(this._parts.hostname):this.is("IPv6")&&l&&(this._parts.hostname=l.best(this._parts.hostname)),this._parts.hostname=this._parts.hostname.toLowerCase(),this.build(!a));return this};e.normalizePort=function(a){"string"===typeof this._parts.protocol&&
this._parts.port===c.defaultPorts[this._parts.protocol]&&(this._parts.port=null,this.build(!a));return this};e.normalizePath=function(a){var b=this._parts.path;if(!b)return this;if(this._parts.urn)return this._parts.path=c.recodeUrnPath(this._parts.path),this.build(!a),this;if("/"===this._parts.path)return this;b=c.recodePath(b);var d="";if("/"!==b.charAt(0)){var e=!0;b="/"+b}if("/.."===b.slice(-3)||"/."===b.slice(-2))b+="/";b=b.replace(/(\/(\.\/)+)|(\/\.$)/g,"/").replace(/\/{2,}/g,"/");e&&(d=b.substring(1).match(/^(\.\.\/)+/)||
"")&&(d=d[0]);for(;;){var h=b.search(/\/\.\.(\/|$)/);if(-1===h)break;else if(0===h){b=b.substring(3);continue}var f=b.substring(0,h).lastIndexOf("/");-1===f&&(f=h);b=b.substring(0,f)+b.substring(h+3)}e&&this.is("relative")&&(b=d+b.substring(1));this._parts.path=b;this.build(!a);return this};e.normalizePathname=e.normalizePath;e.normalizeQuery=function(a){"string"===typeof this._parts.query&&(this._parts.query.length?this.query(c.parseQuery(this._parts.query,this._parts.escapeQuerySpace)):this._parts.query=
null,this.build(!a));return this};e.normalizeFragment=function(a){this._parts.fragment||(this._parts.fragment=null,this.build(!a));return this};e.normalizeSearch=e.normalizeQuery;e.normalizeHash=e.normalizeFragment;e.iso8859=function(){var a=c.encode,b=c.decode;c.encode=escape;c.decode=decodeURIComponent;try{this.normalize()}finally{c.encode=a,c.decode=b}return this};e.unicode=function(){var a=c.encode,b=c.decode;c.encode=B;c.decode=unescape;try{this.normalize()}finally{c.encode=a,c.decode=b}return this};
e.readable=function(){var a=this.clone();a.username("").password("").normalize();var b="";a._parts.protocol&&(b+=a._parts.protocol+"://");a._parts.hostname&&(a.is("punycode")&&f?(b+=f.toUnicode(a._parts.hostname),a._parts.port&&(b+=":"+a._parts.port)):b+=a.host());a._parts.hostname&&a._parts.path&&"/"!==a._parts.path.charAt(0)&&(b+="/");b+=a.path(!0);if(a._parts.query){for(var d="",e=0,h=a._parts.query.split("&"),q=h.length;e<q;e++){var g=(h[e]||"").split("=");d+="&"+c.decodeQuery(g[0],this._parts.escapeQuerySpace).replace(/&/g,
"%26");void 0!==g[1]&&(d+="="+c.decodeQuery(g[1],this._parts.escapeQuerySpace).replace(/&/g,"%26"))}b+="?"+d.substring(1)}return b+=c.decodeQuery(a.hash(),!0)};e.absoluteTo=function(a){var b=this.clone(),d=["protocol","username","password","hostname","port"],e,h;if(this._parts.urn)throw Error("URNs do not have any generally defined hierarchical components");a instanceof c||(a=new c(a));if(b._parts.protocol)return b;b._parts.protocol=a._parts.protocol;if(this._parts.hostname)return b;for(e=0;h=d[e];e++)b._parts[h]=
a._parts[h];b._parts.path?(".."===b._parts.path.substring(-2)&&(b._parts.path+="/"),"/"!==b.path().charAt(0)&&(d=(d=a.directory())?d:0===a.path().indexOf("/")?"/":"",b._parts.path=(d?d+"/":"")+b._parts.path,b.normalizePath())):(b._parts.path=a._parts.path,b._parts.query||(b._parts.query=a._parts.query));b.build();return b};e.relativeTo=function(a){var b=this.clone().normalize();if(b._parts.urn)throw Error("URNs do not have any generally defined hierarchical components");a=(new c(a)).normalize();var d=
b._parts;var e=a._parts;var h=b.path();a=a.path();if("/"!==h.charAt(0))throw Error("URI is already relative");if("/"!==a.charAt(0))throw Error("Cannot calculate a URI relative to another relative URI");d.protocol===e.protocol&&(d.protocol=null);if(d.username===e.username&&d.password===e.password&&null===d.protocol&&null===d.username&&null===d.password&&d.hostname===e.hostname&&d.port===e.port)d.hostname=null,d.port=null;else return b.build();if(h===a)return d.path="",b.build();h=c.commonPath(h,a);
if(!h)return b.build();e=e.path.substring(h.length).replace(/[^\/]*$/,"").replace(/.*?\//g,"../");d.path=e+d.path.substring(h.length)||"./";return b.build()};e.equals=function(a){var b=this.clone(),d=new c(a);a={};var e;b.normalize();d.normalize();if(b.toString()===d.toString())return!0;var h=b.query();var f=d.query();b.query("");d.query("");if(b.toString()!==d.toString()||h.length!==f.length)return!1;b=c.parseQuery(h,this._parts.escapeQuerySpace);f=c.parseQuery(f,this._parts.escapeQuerySpace);for(e in b)if(z.call(b,
e)){if(!r(b[e])){if(b[e]!==f[e])return!1}else if(!x(b[e],f[e]))return!1;a[e]=!0}for(e in f)if(z.call(f,e)&&!a[e])return!1;return!0};e.preventInvalidHostname=function(a){this._parts.preventInvalidHostname=!!a;return this};e.duplicateQueryParameters=function(a){this._parts.duplicateQueryParameters=!!a;return this};e.escapeQuerySpace=function(a){this._parts.escapeQuerySpace=!!a;return this};return c});
(function(f,l){"object"===typeof module&&module.exports?module.exports=l(require("./URI")):"function"===typeof define&&define.amd?define(["./URI"],l):f.URITemplate=l(f.URI,f)})(this,function(f,l){function g(c){if(g._cache[c])return g._cache[c];if(!(this instanceof g))return new g(c);this.expression=c;g._cache[c]=this;return this}function u(c){this.data=c;this.cache={}}var c=l&&l.URITemplate,n=Object.prototype.hasOwnProperty,A=g.prototype,r={"":{prefix:"",separator:",",named:!1,empty_name_separator:!1,
encode:"encode"},"+":{prefix:"",separator:",",named:!1,empty_name_separator:!1,encode:"encodeReserved"},"#":{prefix:"#",separator:",",named:!1,empty_name_separator:!1,encode:"encodeReserved"},".":{prefix:".",separator:".",named:!1,empty_name_separator:!1,encode:"encode"},"/":{prefix:"/",separator:"/",named:!1,empty_name_separator:!1,encode:"encode"},";":{prefix:";",separator:";",named:!0,empty_name_separator:!1,encode:"encode"},"?":{prefix:"?",separator:"&",named:!0,empty_name_separator:!0,encode:"encode"},
"&":{prefix:"&",separator:"&",named:!0,empty_name_separator:!0,encode:"encode"}};g._cache={};g.EXPRESSION_PATTERN=/\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;g.VARIABLE_PATTERN=/^([^*:.](?:\.?[^*:.])*)((\*)|:(\d+))?$/;g.VARIABLE_NAME_PATTERN=/[^a-zA-Z0-9%_.]/;g.LITERAL_PATTERN=/[<>{}"`^| \\]/;g.expand=function(c,f,l){var h=r[c.operator],q=h.named?"Named":"Unnamed";c=c.variables;var m=[],y,n;for(n=0;y=c[n];n++){var v=f.get(y.name);if(0===v.type&&l&&l.strict)throw Error('Missing expansion value for variable "'+
y.name+'"');if(v.val.length){if(1<v.type&&y.maxlength)throw Error('Invalid expression: Prefix modifier not applicable to variable "'+y.name+'"');m.push(g["expand"+q](v,h,y.explode,y.explode&&h.separator||",",y.maxlength,y.name))}else v.type&&m.push("")}return m.length?h.prefix+m.join(h.separator):""};g.expandNamed=function(c,g,l,h,t,B){var q="",m=g.encode;g=g.empty_name_separator;var n=!c[m].length,e=2===c.type?"":f[m](B),r;var x=0;for(r=c.val.length;x<r;x++){if(t){var w=f[m](c.val[x][1].substring(0,
t));2===c.type&&(e=f[m](c.val[x][0].substring(0,t)))}else n?(w=f[m](c.val[x][1]),2===c.type?(e=f[m](c.val[x][0]),c[m].push([e,w])):c[m].push([void 0,w])):(w=c[m][x][1],2===c.type&&(e=c[m][x][0]));q&&(q+=h);l?q+=e+(g||w?"=":"")+w:(x||(q+=f[m](B)+(g||w?"=":"")),2===c.type&&(q+=e+","),q+=w)}return q};g.expandUnnamed=function(c,g,l,h,t){var m="",q=g.encode;g=g.empty_name_separator;var n=!c[q].length,r;var e=0;for(r=c.val.length;e<r;e++){if(t)var x=f[q](c.val[e][1].substring(0,t));else n?(x=f[q](c.val[e][1]),
c[q].push([2===c.type?f[q](c.val[e][0]):void 0,x])):x=c[q][e][1];m&&(m+=h);if(2===c.type){var u=t?f[q](c.val[e][0].substring(0,t)):c[q][e][0];m+=u;m=l?m+(g||x?"=":""):m+","}m+=x}return m};g.noConflict=function(){l.URITemplate===g&&(l.URITemplate=c);return g};A.expand=function(c,f){var m="";this.parts&&this.parts.length||this.parse();c instanceof u||(c=new u(c));for(var h=0,t=this.parts.length;h<t;h++)m+="string"===typeof this.parts[h]?this.parts[h]:g.expand(this.parts[h],c,f);return m};A.parse=function(){var c=
this.expression,f=g.EXPRESSION_PATTERN,l=g.VARIABLE_PATTERN,h=g.VARIABLE_NAME_PATTERN,t=g.LITERAL_PATTERN,n=[],y=0,u=function(c){if(c.match(t))throw Error('Invalid Literal "'+c+'"');return c};for(f.lastIndex=0;;){var v=f.exec(c);if(null===v){n.push(u(c.substring(y)));break}else n.push(u(c.substring(y,v.index))),y=v.index+v[0].length;if(!r[v[1]])throw Error('Unknown Operator "'+v[1]+'" in "'+v[0]+'"');if(!v[3])throw Error('Unclosed Expression "'+v[0]+'"');var e=v[2].split(",");for(var z=0,A=e.length;z<
A;z++){var w=e[z].match(l);if(null===w)throw Error('Invalid Variable "'+e[z]+'" in "'+v[0]+'"');if(w[1].match(h))throw Error('Invalid Variable Name "'+w[1]+'" in "'+v[0]+'"');e[z]={name:w[1],explode:!!w[3],maxlength:w[4]&&parseInt(w[4],10)}}if(!e.length)throw Error('Expression Missing Variable(s) "'+v[0]+'"');n.push({expression:v[0],operator:v[1],variables:e})}n.length||n.push(u(c));this.parts=n;return this};u.prototype.get=function(c){var f=this.data,g={type:0,val:[],encode:[],encodeReserved:[]};
if(void 0!==this.cache[c])return this.cache[c];this.cache[c]=g;f="[object Function]"===String(Object.prototype.toString.call(f))?f(c):"[object Function]"===String(Object.prototype.toString.call(f[c]))?f[c](c):f[c];if(void 0!==f&&null!==f)if("[object Array]"===String(Object.prototype.toString.call(f))){var h=0;for(c=f.length;h<c;h++)void 0!==f[h]&&null!==f[h]&&g.val.push([void 0,String(f[h])]);g.val.length&&(g.type=3)}else if("[object Object]"===String(Object.prototype.toString.call(f))){for(h in f)n.call(f,
h)&&void 0!==f[h]&&null!==f[h]&&g.val.push([h,String(f[h])]);g.val.length&&(g.type=2)}else g.type=1,g.val.push([void 0,String(f)]);return g};f.expand=function(c,m){var l=(new g(c)).expand(m);return new f(l)};return g});
(function(f,l){"object"===typeof module&&module.exports?module.exports=l(require("jquery"),require("./URI")):"function"===typeof define&&define.amd?define(["jquery","./URI"],l):l(f.jQuery,f.URI)})(this,function(f,l){function g(c){return c.replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}function u(c){var h=c.nodeName.toLowerCase();if("input"!==h||"image"===c.type)return l.domAttributes[h]}function c(c){return{get:function(h){return f(h).uri()[c]()},set:function(h,g){f(h).uri()[c](g);return g}}}function n(c,
g){if(!u(c)||!g)return!1;var h=g.match(m);if(!h||!h[5]&&":"!==h[2]&&!r[h[2]])return!1;var t=f(c).uri();if(h[5])return t.is(h[5]);if(":"===h[2]){var l=h[1].toLowerCase()+":";return r[l]?r[l](t,h[4]):!1}l=h[1].toLowerCase();return A[l]?r[h[2]](t[l](),h[4],l):!1}var A={},r={"=":function(c,f){return c===f},"^=":function(c,f){return!!(c+"").match(new RegExp("^"+g(f),"i"))},"$=":function(c,f){return!!(c+"").match(new RegExp(g(f)+"$","i"))},"*=":function(c,f,l){"directory"===l&&(c+="/");return!!(c+"").match(new RegExp(g(f),
"i"))},"equals:":function(c,f){return c.equals(f)},"is:":function(c,f){return c.is(f)}};f.each("origin authority directory domain filename fragment hash host hostname href password path pathname port protocol query resource scheme search subdomain suffix tld username".split(" "),function(h,g){A[g]=!0;f.attrHooks["uri:"+g]=c(g)});var q=function(c,g){return f(c).uri().href(g).toString()};f.each(["src","href","action","uri","cite"],function(c,g){f.attrHooks[g]={set:q}});f.attrHooks.uri.get=function(c){return f(c).uri()};
f.fn.uri=function(c){var f=this.first(),h=f.get(0),g=u(h);if(!g)throw Error('Element "'+h.nodeName+'" does not have either property: href, src, action, cite');if(void 0!==c){var m=f.data("uri");if(m)return m.href(c);c instanceof l||(c=l(c||""))}else{if(c=f.data("uri"))return c;c=l(f.attr(g)||"")}c._dom_element=h;c._dom_attribute=g;c.normalize();f.data("uri",c);return c};l.prototype.build=function(c){if(this._dom_element)this._string=l.build(this._parts),this._deferred_build=!1,this._dom_element.setAttribute(this._dom_attribute,
this._string),this._dom_element[this._dom_attribute]=this._string;else if(!0===c)this._deferred_build=!0;else if(void 0===c||this._deferred_build)this._string=l.build(this._parts),this._deferred_build=!1;return this};var m=/^([a-zA-Z]+)\s*([\^\$*]?=|:)\s*(['"]?)(.+)\3|^\s*([a-zA-Z0-9]+)\s*$/;var x=f.expr.createPseudo?f.expr.createPseudo(function(c){return function(f){return n(f,c)}}):function(c,f,g){return n(c,g[3])};f.expr[":"].uri=x;return f});