const { parsers: typescriptParsers } = require('prettier/parser-typescript');
const { parsers: javascriptParsers } = require('prettier/parser-babel');
const S = require('subsecond');

function preprocess(text) {
  S.load({ 'any.tsx': text });

  S('JSXOpeningElement').each((openingTag) => {
    const attributeSortingGroups = [];
    let currentAttributeGroup = [];

    openingTag
      .children('JSXAttribute, JSXSpreadAttribute')
      .each((attribute) => {
        if (attribute.type() === 'JSXSpreadAttribute') {
          attributeSortingGroups.push(currentAttributeGroup.sort());
          currentAttributeGroup = [];
          return;
        }
        currentAttributeGroup.push(attribute.text());
      });
    attributeSortingGroups.push(currentAttributeGroup.sort());

    const sortedAttributes = attributeSortingGroups.flat();
    openingTag
      .children('JSXAttribute')
      .each((attribute, i) => attribute.text(sortedAttributes[i]));
  });

  return S.print()['any.tsx'];
}

module.exports = {
  parsers: {
    typescript: {
      ...typescriptParsers.typescript,
      preprocess,
    },
    babel: {
      ...javascriptParsers.babel,
      preprocess,
    },
  },
};
