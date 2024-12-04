// @ts-check

import { addErrorContext, allPunctuation } from "../helpers/helpers.cjs";
import { getDescendantsByType } from "../helpers/micromark-helpers.cjs";
import { filterByTypesCached } from "./cache.mjs";

/** @typedef {import("../helpers/micromark-helpers.cjs").TokenType} TokenType */
/** @type {TokenType[][]} */
const emphasisTypes = [
  [ "emphasis", "emphasisText" ],
  [ "strong", "strongText" ]
];

/** @type {import("./markdownlint.mjs").Rule} */
export default {
  "names": [ "MD036", "no-emphasis-as-heading" ],
  "description": "Emphasis used instead of a heading",
  "tags": [ "headings", "emphasis" ],
  "parser": "micromark",
  "function": function MD036(params, onError) {
    let punctuation = params.config.punctuation;
    punctuation = String((punctuation === undefined) ? allPunctuation : punctuation);
    const punctuationRe = new RegExp("[" + punctuation + "]$");
    const paragraphTokens =
      filterByTypesCached([ "paragraph" ])
        .filter((token) =>
          (token.parent?.type === "content") && !token.parent?.parent && (token.children.length === 1)
        );
    for (const emphasisType of emphasisTypes) {
      const textTokens = getDescendantsByType(paragraphTokens, emphasisType);
      for (const textToken of textTokens) {
        if (
          (textToken.children.length === 1) &&
          (textToken.children[0].type === "data") &&
          !punctuationRe.test(textToken.text)
        ) {
          addErrorContext(onError, textToken.startLine, textToken.text);
        }
      }
    }
  }
};