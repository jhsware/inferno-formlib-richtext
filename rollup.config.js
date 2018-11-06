import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import replace from 'rollup-plugin-replace';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const baseConfig = (outputFormat) => {
  const isProduction = process.env.NODE_ENV === 'production';

  let file;
  switch (outputFormat) {
    case 'cjs':
      file = 'dist/index.' + outputFormat + (isProduction ? '.min' : '') + '.js';
      break;

    default:
      throw new Error('Unsupported output format: ' + outputFormat);
  }

  return {
    input: 'src/index.js',
    plugins: [
      nodeResolve({
        modulesOnly: true, //
      }),
      commonjs({
        include: 'node_modules/**'  // Default: undefined,
      }),
      babel({
        runtimeHelpers: true
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      isProduction ? minify({
        comments: false,
      }) : false,
    ],
    external: [
      /* vvv These are from inferno-formlib vvv */
      '@babel/runtime/helpers/createClass',
      '@babel/runtime/helpers/classCallCheck',
      '@babel/runtime/helpers/possibleConstructorReturn',
      '@babel/runtime/helpers/getPrototypeOf',
      '@babel/runtime/helpers/inherits',
      '@babel/runtime/helpers/assertThisInitialized',
      '@babel/runtime/helpers/typeof',
      '@babel/runtime/helpers/objectWithoutProperties',
      '@babel/runtime/helpers/defineProperty',
      '@babel/runtime/helpers/objectSpread',
      'classnames',
      'lodash.tonumber',
      'lodash.isobject',
      /* ^^^ These are from inferno-formlib ^^^ */
      'component-registry',
      'inferno',
      'inferno-formlib',
      'isomorphic-schema'
    ],
    output: {
      name: 'InfernoFormlibRichText',
      file: file,
      format: outputFormat,
      sourcemap: true,
      globals: {
        'component-registry': 'componentRegistry',
        'inferno': 'Inferno',
        'inferno-formlib': 'infernoFormlib',
        'isomorphic-schema': 'isomorphicSchema'
      },
    },
  };
};

export default [
  baseConfig('cjs')
];