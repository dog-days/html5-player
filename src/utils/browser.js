const userAgent = navigator.userAgent;

function userAgentMatch(regex) {
  return userAgent.match(regex) !== null;
}

function lazyUserAgentMatch(regex) {
  return function() {
    return userAgentMatch(regex);
  };
}

export const isFF = lazyUserAgentMatch(/gecko\//i);
export const isIETrident = lazyUserAgentMatch(/trident\/.+rv:\s*11/i);
// export const isIPod = lazyUserAgentMatch(/iP(hone|od)/i);
// export const isIPad = lazyUserAgentMatch(/iPad/i);
// export const isOSX = lazyUserAgentMatch(/Macintosh/i);
// Check for Facebook App Version to see if it's Facebook
// export const isFacebook = lazyUserAgentMatch(/FBAV/i);

export function isEdge() {
  return userAgentMatch(/\sEdge\/\d+/i);
}

export function isMSIE() {
  return userAgentMatch(/msie/i);
}

export function isChrome() {
  return userAgentMatch(/\s(?:Chrome|CriOS)\//i) && !isEdge();
}

export function isIE() {
  return isEdge() || isIETrident() || isMSIE();
}

// export function isSafari() {
//   return (
//     userAgentMatch(/safari/i) &&
//     !userAgentMatch(/(?:Chrome|CriOS|chromium|android)/i)
//   );
// }

// /** Matches iOS devices **/
// export function isIOS() {
//   return userAgentMatch(/iP(hone|ad|od)/i);
// }
//
// /** Matches Android devices **/
// export function isAndroidNative() {
//   // Android Browser appears to include a user-agent string for Chrome/18
//   if (userAgentMatch(/chrome\/[123456789]/i) && !userAgentMatch(/chrome\/18/)) {
//     return false;
//   }
//   return isAndroid();
// }
//
// export function isAndroid() {
//   return userAgentMatch(/Android/i);
// }
//
// /** Matches iOS and Android devices **/
// export function isMobile() {
//   return isIOS() || isAndroid();
// }
//
// export function isIframe() {
//   try {
//     return window.self !== window.top;
//   } catch (e) {
//     return true;
//   }
// }
