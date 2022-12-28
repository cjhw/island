import type { Plugin } from 'unified';
import Slugger from 'github-slugger';
import { visit } from 'unist-util-visit';
import { Root } from 'mdast';
import type { MdxjsEsm, Program } from 'mdast-util-mdxjs-esm';
import { parse } from 'acorn';

interface TocItem {
  id: string;
  text: string;
  depth: number;
}

interface ChildNode {
  type: 'link' | 'text' | 'inlineCode';
  value: string;
  children?: ChildNode[];
}

const slugger = new Slugger();

export const remarkPluginToc: Plugin<[], Root> = () => {
  return (tree) => {
    const toc: TocItem[] = [];
    visit(tree, 'heading', (node) => {
      if (!node.depth || !node.children?.length) {
        return;
      }
      // h2 ~ h4
      if (node.depth > 1 && node.depth < 5) {
        const originalText = (node.children as ChildNode[])
          .map((child) => {
            switch (child.type) {
              case 'link':
                return child.children?.map((c) => c.value).join('');
              default:
                return child.value;
            }
          })
          .join('');
        const id = slugger.slug(originalText);
        toc.push({
          id,
          text: originalText,
          depth: node.depth
        });
      }
    });

    const insertCode = `export const toc = ${JSON.stringify(toc, null, 2)};`;

    tree.children.push({
      type: 'mdxjsEsm',
      value: insertCode,
      data: {
        estree: parse(insertCode, {
          ecmaVersion: 2020,
          sourceType: 'module'
        }) as unknown as Program
      }
    });
  };
};
