import { replace } from "rambda";

/**
 * Removes `www` from a url (including the dot and any numbers used i.e. www1, www2, etc)
 * @param url {String} The url to normalize
 */
export const www = replace(/www[0-9]*\./, '')
/**
 * Removes `.git` from a url
 * @param url {String} The url to normalize
 */
export const git = replace(/\.git/, '')
/**
 * Removes anchors from an url (i.e. `#master-yoda`)
 * @param url {String} The url to normalize
 */
export const anchor = replace(/#(.)+/, '')
/**
 * Removes `http(s)` from a url (including the colon and slashes after it)
 * @param url {String} The url to enter
 */
export const protocol = replace(/https?:\/\//, '')