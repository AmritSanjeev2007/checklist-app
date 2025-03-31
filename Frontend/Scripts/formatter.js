const MD_SELECTORS = {
    LINK_SELECTOR: /\[[^\]]*\]\([^)]*\)/gi,

    ITALIC_BOLD_SELECTOR: /\*\*\*\ .+\ \*\*\*/gi, // Format *** ___ ***
    BOLD_SELECTOR: /\*\*\ .+\ \*\*/gi, // Format ** ___ **
    ITALIC_SELECTOR: /\*\ .+\ \*/gi, // Format * ___ *

    UNDERLINE_SELECTOR: /\_\_\ .+\ \_\_/gi, // Format __ ___ __
    STRIKE_THROUGH_SELECTOR: /\-\-\ .+\ \-\-/gi, // Format -- ___ --

    HIGHLIGHT_SELECTOR: /\!\ .+\ \!/gi, // Format ! ___ !

    CODE_SELECTOR: /\`\ [^`]+\ \`/gsi, // Format ` ___ `

    HEADING_SELECTOR: /(\r\n|\r|\n)\#+\ .+(\r\n|\r|\n)/gi, // Remove extra '\n's

    UNORDERED_LIST_DEMARKATION_SELECTOR: /(\r\n|\r|\n)[-*+]\ .+/gi, // Remove extra '\n's
    ORDERED_LIST_DEMARKATION_SELECTOR: /(\r\n|\r|\n)[0-9]+\.\ .+/gi, // Remove extra '\n's

    HORIZONTAL_RULE_SELECTOR: /(\r\n|\r|\n)[-|*]+(\r\n|\r|\n)/gi // Remove extra '\n's
};

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderLinks(formattedString) {
    let linksIter = formattedString.matchAll(MD_SELECTORS.LINK_SELECTOR);
    let retStr = formattedString;
    for(let match of linksIter) {
        let tempStr = [...match.values()][0];
        let linkAlias = tempStr.match(/\[.+\]/i)[0].slice(1,-1);
        let linkValue = tempStr.match(/\(.+\)/i)[0].slice(1,-1);

        retStr = retStr.replace(tempStr, `<a href="${linkValue}">${linkAlias}</a>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderItalicBolds(formattedString) {
    let italicsBoldIter = formattedString.matchAll(MD_SELECTORS.ITALIC_BOLD_SELECTOR);
    let retStr = formattedString;
    for(let match of italicsBoldIter) {
        let tempStr = [...match.values()][0];
        let italicBoldContent = tempStr.slice(4,-4);

        retStr = retStr.replace(tempStr, `<em><strong>${italicBoldContent}</strong></em>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderBolds(formattedString) {
    let boldsIter = formattedString.matchAll(MD_SELECTORS.BOLD_SELECTOR);
    let retStr = formattedString;
    for(let match of boldsIter) {
        let tempStr = [...match.values()][0];
        let boldContent = tempStr.slice(3,-3);

        retStr = retStr.replace(tempStr, `<strong>${boldContent}</strong>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderItalics(formattedString) {
    let italicsIter = formattedString.matchAll(MD_SELECTORS.ITALIC_SELECTOR);
    let retStr = formattedString;
    for(let match of italicsIter) {
        let tempStr = [...match.values()][0];
        let italicsContent = tempStr.slice(2,-2);

        retStr = retStr.replace(tempStr, `<em>${italicsContent}</em>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderUnderlines(formattedString) {
    let underlineIter = formattedString.matchAll(MD_SELECTORS.UNDERLINE_SELECTOR);
    let retStr = formattedString;
    for(let match of underlineIter) {
        let tempStr = [...match.values()][0];
        let underlineContent = tempStr.slice(3,-3);

        retStr = retStr.replace(tempStr, `<span class="underlined">${underlineContent}</span>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderStrikeThroughs(formattedString) {
    let strikeThroughIter = formattedString.matchAll(MD_SELECTORS.STRIKE_THROUGH_SELECTOR);
    let retStr = formattedString;
    for(let match of strikeThroughIter) {
        let tempStr = [...match.values()][0];
        let strikeThroughContent = tempStr.slice(3,-3);

        retStr = retStr.replace(tempStr, `<span class="strike-through">${strikeThroughContent}</span>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderHighlights(formattedString) {
    let highlightIter = formattedString.matchAll(MD_SELECTORS.HIGHLIGHT_SELECTOR);
    let retStr = formattedString;
    for(let match of highlightIter) {
        let tempStr = [...match.values()][0];
        let highlightContent = tempStr.slice(2,-2);

        retStr = retStr.replace(tempStr, `<mark>${highlightContent}</mark>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderCodes(formattedString) {
    let codeIter = formattedString.matchAll(MD_SELECTORS.CODE_SELECTOR);
    let retStr = formattedString;
    for(let match of codeIter) {
        let tempStr = [...match.values()][0];
        let codeContent = tempStr.slice(2,-2);

        retStr = retStr.replace(tempStr, `<code${tempStr.includes('\n')?' aria-multiline':''}>${codeContent}</code>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderHeadings(formattedString) {
    let headingIter = formattedString.matchAll(MD_SELECTORS.HEADING_SELECTOR);
    let retStr = formattedString;
    for(let match of headingIter) {
        let tempStr = [...match.values()][0];
        let n = tempStr.lastIndexOf('#')+1;
        let headingContent = tempStr.slice(n+1);

        retStr = retStr.replace(tempStr, `<h${Math.min(6,n)}>${headingContent}</h${Math.min(6,n)}>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderUnorderedLists(formattedString) {
    let unorderedListIter = formattedString.matchAll(MD_SELECTORS.UNORDERED_LIST_DEMARKATION_SELECTOR);
    let retStr = formattedString;
    for(let match of unorderedListIter) {
        let tempStr = [...match.values()][0];
        let liContent = tempStr.slice(3);

        retStr = retStr.replace(tempStr, `<ul><li>${liContent}</li></ul>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderOrderedLists(formattedString) {
    let orderedListIter = formattedString.matchAll(MD_SELECTORS.ORDERED_LIST_DEMARKATION_SELECTOR);
    let retStr = formattedString;
    for(let match of orderedListIter) {
        let tempStr = [...match.values()][0];
        let liContent = tempStr.slice(tempStr.indexOf('.')+2);

        retStr = retStr.replace(tempStr, `<ol start="${tempStr.slice(1, tempStr.indexOf('.'))}"><li>${liContent}</li></ol>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderHorizontalRules(formattedString) {
    let hrIter = formattedString.matchAll(MD_SELECTORS.HORIZONTAL_RULE_SELECTOR);
    let retStr = formattedString;
    for(let match of hrIter) {
        let tempStr = [...match.values()][0];
        retStr = retStr.replace(tempStr, `<hr>`);
    }

    return retStr;
}

/**
 * Returns a new string after rendering the formating.
 * @param {string} formattedString 
 * @returns {string}
 */
function __renderNewLines(formattedString) {
    let nIter = formattedString.matchAll(/\n/gi);
    let retStr = formattedString;
    for(let match of nIter) {
        let tempStr = [...match.values()][0];
        retStr = retStr.replace(tempStr, `<br>`);
    }

    return retStr;
}

/** @param {string} formattedString */
export function renderFormattedString(formattedString) {

    formattedString = formattedString.replaceAll('\t', '<span class="tabbed"></span>');

    return __renderNewLines(
        __renderHorizontalRules(
            __renderOrderedLists(
                __renderUnorderedLists(
                    __renderHeadings(
                        __renderCodes(
                            __renderHighlights(
                                __renderStrikeThroughs(
                                    __renderUnderlines(
                                        __renderItalics(
                                            __renderBolds(
                                                __renderItalicBolds(
                                                    __renderLinks(formattedString)
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}