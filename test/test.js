/* eslint-env mocha, es6 */

import path from 'path';
import fs from 'fs';

import markdownit from '@gerhobbelt/markdown-it';
import generate from '@gerhobbelt/markdown-it-testgen';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import plugin from '../index.js';


describe('markdown-it-shortcode-tag holistic tests', function () {
  let standard_shortcodes = {
  	standard: {
      inline: true,
      render: function (params, env) {
        let out = '<pre>\nParams:\n';
        for (let entry in params) {
          out += entry + ': ' + params[entry] + ' (' + (typeof params[entry]) + ')\n';
        }
        out += 'Env:\n';
        for (let entry in env) {
          out += entry + ': ' + env[entry] + ' (' + (typeof env[entry]) + ')\n';
        }
        out += '</pre>';
        return out;
      }
    }
  };
  let config = {
  	interpolator: function (expr, env) {
      return 'interpolated(' + env[expr] + ')';
    }
  };

  const md = markdownit({ linkify: true, html: true })
      .use(plugin, standard_shortcodes, config);

  generate(path.join(__dirname, 'fixtures/shortcode-tag.txt'), {}, md, {
    local: 'test'
  });
});
