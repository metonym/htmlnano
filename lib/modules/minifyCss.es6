import { isStyleNode, extractCssFromStyleNode, optionalRequire } from '../helpers';

const cssnano = optionalRequire('cssnano');
const postcss = optionalRequire('postcss');

const postcssOptions = {
    // Prevent the following warning from being shown:
    // > Without `from` option PostCSS could generate wrong source map and will not find Browserslist config.
    // > Set it to CSS file path or to `undefined` to prevent this warning.
    from: undefined,
};

/** Minify CSS with cssnano */
export default function minifyCss(tree, options, cssnanoOptions) {
    if (!cssnano || !postcss) {
        return tree;
    }

    let promises = [];
    tree.walk(node => {
        if (isStyleNode(node)) {
            promises.push(processStyleNode(node, cssnanoOptions));
        } else if (node.attrs && node.attrs.style) {
            promises.push(processStyleAttr(node, cssnanoOptions));
        }

        return node;
    });

    return Promise.all(promises).then(() => tree);
}


function processStyleNode(styleNode, cssnanoOptions) {
    let css = extractCssFromStyleNode(styleNode);

    // Improve performance by avoiding calling stripCdata again and again
    let isCdataWrapped = false;
    if (css.includes('CDATA')) {
        const strippedCss = stripCdata(css);
        isCdataWrapped = css !== strippedCss;
        css = strippedCss;
    }

    return postcss([cssnano(cssnanoOptions)])
        .process(css, postcssOptions)
        .then(result => {
            if (isCdataWrapped) {
                return styleNode.content = ['<![CDATA[' + result + ']]>'];
            }
            return styleNode.content = [result.css];
        });
}


function processStyleAttr(node, cssnanoOptions) {
    // CSS "color: red;" is invalid. Therefore it should be wrapped inside some selector:
    // a{color: red;}
    const wrapperStart = 'a{';
    const wrapperEnd = '}';
    const wrappedStyle = wrapperStart + (node.attrs.style || '') + wrapperEnd;

    return postcss([cssnano(cssnanoOptions)])
        .process(wrappedStyle, postcssOptions)
        .then(result => {
            const minifiedCss = result.css;
            // Remove wrapperStart at the start and wrapperEnd at the end of minifiedCss
            node.attrs.style = minifiedCss.substring(
                wrapperStart.length,
                minifiedCss.length - wrapperEnd.length
            );
        });
}

function stripCdata(css) {
    const leftStrippedCss = css.replace('<![CDATA[', '');
    if (leftStrippedCss === css) {
        return css;
    }

    const strippedCss = leftStrippedCss.replace(']]>', '');
    return leftStrippedCss === strippedCss ? css : strippedCss;
}
