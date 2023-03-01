import { declare } from '@babel/helper-plugin-utils';

import type { Visitor } from '@babel/traverse';
import type { PluginPass } from '@babel/core';
import { types as t } from '@babel/core';
import { MASK_SPLITTER } from './constants';
import { normalizePath } from 'vite';

export default declare((api) => {
  api.assertVersion(7);

  const visitor: Visitor<PluginPass> = {
    // 访问 JSX 开始标签
    JSXOpeningElement(path, state) {
      const name = path.node.name;
      // 拿到组件名字，如 Aside
      let bindingName = '';
      if (name.type === 'JSXIdentifier') {
        bindingName = name.name;
      } else if (name.type === 'JSXMemberExpression') {
        let object = name.object;
        // A.B.C
        while (t.isJSXMemberExpression(object)) {
          object = object.object;
        }
        // 取出 A
        bindingName = object.name;
      } else {
        // 其它 type 忽略
        return;
      }

      // 根据作用域信息拿到组件引入的位置
      const binding = path.scope.getBinding(bindingName);

      if (binding?.path.parent.type === 'ImportDeclaration') {
        // 定位到 import 语句之后，我们拿到 Island 组件对应的引入路径
        const source = binding.path.parent.source;
        // 然后将 __island prop 进行修改
        const attributes = (path.container as t.JSXElement).openingElement
          .attributes;
        for (let i = 0; i < attributes.length; i++) {
          const name = (attributes[i] as t.JSXAttribute).name;
          if (name?.name === '__island') {
            (attributes[i] as t.JSXAttribute).value = t.stringLiteral(
              `${source.value}${MASK_SPLITTER}${normalizePath(
                state.filename || ''
              )}`
            );
            console.log(
              t.stringLiteral(
                `${source.value}${MASK_SPLITTER}${normalizePath(
                  state.filename || ''
                )}`
              )
            );
          }
        }
      }
    }
  };

  return {
    name: 'transform-jsx-island',
    visitor
  };
});
