import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import replace from 'rollup-plugin-replace';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    file: `dist/index.cjs${isProduction ? '.min' : ''}.js`,
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    babel({
      runtimeHelpers: true
    }),
    isProduction ? minify({
      comments: false,
    }) : false
  ],
  external: [
    'inferno',
    'component-registry',
    '@babel/runtime/helpers/createClass',
    '@babel/runtime/helpers/classCallCheck',
    '@babel/runtime/helpers/possibleConstructorReturn',
    '@babel/runtime/helpers/getPrototypeOf',
    '@babel/runtime/helpers/inherits',
    '@babel/runtime/helpers/assertThisInitialized',
    'isomorphic-schema',
    'inferno-formlib',
    'inferno-bootstrap'
  ]
}