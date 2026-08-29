import { Extension } from '@tiptap/core';

const INDENT_STEP = 40;
const MAX_INDENT = 200;

const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const match = element.style.marginLeft?.match(/(\d+)px/);
              return match ? parseInt(match[1], 10) : 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) return {};
              return { style: `margin-left: ${attributes.indent}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ editor, commands }) => {
        const { selection } = editor.state;
        const { from, to } = selection;
        let applied = false;
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.min(MAX_INDENT, currentIndent + INDENT_STEP);
            if (newIndent !== currentIndent) {
              commands.updateAttributes(node.type.name, { indent: newIndent });
              applied = true;
            }
          }
        });
        return applied;
      },
      outdent: () => ({ editor, commands }) => {
        const { selection } = editor.state;
        const { from, to } = selection;
        let applied = false;
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.max(0, currentIndent - INDENT_STEP);
            if (newIndent !== currentIndent) {
              commands.updateAttributes(node.type.name, { indent: newIndent });
              applied = true;
            }
          }
        });
        return applied;
      },
    };
  },
});

export default Indent;
