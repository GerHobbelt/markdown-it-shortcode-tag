/* eslint-env mocha, es6 */

import path from 'path';
import fs from 'fs';
import assert from 'assert';

import MarkdownIt from '@gerhobbelt/markdown-it';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import shortcode from '../index.js';


describe('plugin usage', function () {
  let md;
  let standard = {
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
  };

  beforeEach(function () {
    md = MarkdownIt({ html: true });
  });

  describe('shortcode tag as block', function () {
    let source = fs.readFileSync(path.join(__dirname, 'fixtures/block.md'), { encoding: 'utf8' });

    beforeEach(function () {
      md.use(shortcode, { standard: standard });
    });

    it('identifies tag', function () {
      let result = md.render(source);
      assert.ok(result.includes('<h1>Hello Shortcode</h1>'));
      assert.ok(!result.includes('<standard'));
      assert.ok(result.includes('<pre>'));
    });

    it('understands attributes', function () {
      let result = md.render(source, {
        local: 'test'
      });
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('first: true (boolean)'));
      assert.ok(result.includes('second: string (string)'));
      assert.ok(result.includes('third: other (string)'));
      assert.ok(result.includes('fourth: 3.7 (number)'));
      assert.ok(result.includes('fifth: test (string)'));
      assert.ok(result.includes('sixth: nontest (string)'));
    });

    it('passes enviroment', function () {
      let result = md.render(source, {
        local: 'test'
      });
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('local: test (string)'));
    });

    it('ignores closing tags', function () {
      let result = md.render(source);
      assert.ok(result.includes('</standard>'));
    });
  });

  describe('options', function () {
    let source = fs.readFileSync(path.join(__dirname, 'fixtures/block.md'), { encoding: 'utf8' });

    beforeEach(function () {
      let interpolator = function (expr, env) {
        return 'interpolated(' + env[expr] + ')';
      };
      md.use(shortcode, { standard: standard }, { interpolator });
    });

    it('should use the interpolator option to process ${expression} values', function () {
      let result = md.render(source, {
        local: 'test'
      });

      assert.ok(result.includes('fifth: interpolated(test) (string)'));
      assert.ok(result.includes('sixth: nontest (string)'));
    });
  });

  describe('shortcode tag as inline', function () {
    let source = fs.readFileSync(path.join(__dirname, 'fixtures/inline.md'), { encoding: 'utf8' });

    beforeEach(function () {
      md.use(shortcode, { standard: standard });
    });

    it('identifies tag', function () {
      let result = md.render(source);
      assert.ok(result.includes('<h1>Hello Shortcode</h1>'));
      assert.ok(!result.includes('<standard'));
      assert.ok(result.includes('<p>It is <pre>'));
    });

    it('understands attributes', function () {
      let result = md.render(source);
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('first: true (boolean)'));
      assert.ok(result.includes('second: string (string)'));
      assert.ok(result.includes('third: other (string)'));
      assert.ok(result.includes('fourth: 3.7 (number)'));
    });

    it('passes enviroment', function () {
      let result = md.render(source, {
        local: 'test'
      });
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('local: test (string)'));
    });
  });

  describe('shortcode forced inline tag', function () {
    let source = fs.readFileSync(path.join(__dirname, 'fixtures/block.md'), { encoding: 'utf8' });

    beforeEach(function () {
      md.use(shortcode, { standard: { inline: true, render: standard.render } });
    });

    it('identifies tag', function () {
      let result = md.render(source);
      assert.ok(result.includes('<h1>Hello Shortcode</h1>'));
      assert.ok(!result.includes('<standard'));
      assert.ok(result.match(/<p>\s*<pre>/));
      assert.ok(result.match(/<\/pre>\s*<\/p>/));
    });

    it('understands attributes', function () {
      let result = md.render(source);
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('first: true (boolean)'));
      assert.ok(result.includes('second: string (string)'));
      assert.ok(result.includes('third: other (string)'));
      assert.ok(result.includes('fourth: 3.7 (number)'));
    });

    it('passes enviroment', function () {
      let result = md.render(source, {
        local: 'test'
      });
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('local: test (string)'));
    });
  });

  it('ignores unknown or closing tags', function () {
    let source = fs.readFileSync(path.join(__dirname, 'fixtures/unknown.md'), { encoding: 'utf8' });
    md.use(shortcode, { standard: standard });

    let result = md.render(source);
    assert.ok(result.includes('<h1>Hello Shortcode</h1>'));
    assert.ok(result.includes('<careless thing>'));
    assert.ok(result.includes('<unknown attr>ignore this</unknown>'));
    assert.ok(result.includes('</standard>'));
    assert.ok(!result.includes('<pre>'));
  });
});
