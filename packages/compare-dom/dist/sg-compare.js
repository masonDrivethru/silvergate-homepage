/*! SilverBio Compare SDK v1.0.0 | (c) SilverGate Co., Ltd. ((주)실버게이트). All rights reserved. | Includes diff-match-patch (Apache-2.0, (c) Google) */
var SgCompare = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../../node_modules/diff-match-patch/index.js
  var require_diff_match_patch = __commonJS({
    "../../node_modules/diff-match-patch/index.js"(exports, module) {
      var diff_match_patch = function() {
        this.Diff_Timeout = 1;
        this.Diff_EditCost = 4;
        this.Match_Threshold = 0.5;
        this.Match_Distance = 1e3;
        this.Patch_DeleteThreshold = 0.5;
        this.Patch_Margin = 4;
        this.Match_MaxBits = 32;
      };
      var DIFF_DELETE = -1;
      var DIFF_INSERT = 1;
      var DIFF_EQUAL = 0;
      diff_match_patch.Diff = function(op, text) {
        return [op, text];
      };
      diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines, opt_deadline) {
        if (typeof opt_deadline == "undefined") {
          if (this.Diff_Timeout <= 0) {
            opt_deadline = Number.MAX_VALUE;
          } else {
            opt_deadline = (/* @__PURE__ */ new Date()).getTime() + this.Diff_Timeout * 1e3;
          }
        }
        var deadline = opt_deadline;
        if (text1 == null || text2 == null) {
          throw new Error("Null input. (diff_main)");
        }
        if (text1 == text2) {
          if (text1) {
            return [new diff_match_patch.Diff(DIFF_EQUAL, text1)];
          }
          return [];
        }
        if (typeof opt_checklines == "undefined") {
          opt_checklines = true;
        }
        var checklines = opt_checklines;
        var commonlength = this.diff_commonPrefix(text1, text2);
        var commonprefix = text1.substring(0, commonlength);
        text1 = text1.substring(commonlength);
        text2 = text2.substring(commonlength);
        commonlength = this.diff_commonSuffix(text1, text2);
        var commonsuffix = text1.substring(text1.length - commonlength);
        text1 = text1.substring(0, text1.length - commonlength);
        text2 = text2.substring(0, text2.length - commonlength);
        var diffs = this.diff_compute_(text1, text2, checklines, deadline);
        if (commonprefix) {
          diffs.unshift(new diff_match_patch.Diff(DIFF_EQUAL, commonprefix));
        }
        if (commonsuffix) {
          diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, commonsuffix));
        }
        this.diff_cleanupMerge(diffs);
        return diffs;
      };
      diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines, deadline) {
        var diffs;
        if (!text1) {
          return [new diff_match_patch.Diff(DIFF_INSERT, text2)];
        }
        if (!text2) {
          return [new diff_match_patch.Diff(DIFF_DELETE, text1)];
        }
        var longtext = text1.length > text2.length ? text1 : text2;
        var shorttext = text1.length > text2.length ? text2 : text1;
        var i = longtext.indexOf(shorttext);
        if (i != -1) {
          diffs = [
            new diff_match_patch.Diff(DIFF_INSERT, longtext.substring(0, i)),
            new diff_match_patch.Diff(DIFF_EQUAL, shorttext),
            new diff_match_patch.Diff(
              DIFF_INSERT,
              longtext.substring(i + shorttext.length)
            )
          ];
          if (text1.length > text2.length) {
            diffs[0][0] = diffs[2][0] = DIFF_DELETE;
          }
          return diffs;
        }
        if (shorttext.length == 1) {
          return [
            new diff_match_patch.Diff(DIFF_DELETE, text1),
            new diff_match_patch.Diff(DIFF_INSERT, text2)
          ];
        }
        var hm = this.diff_halfMatch_(text1, text2);
        if (hm) {
          var text1_a = hm[0];
          var text1_b = hm[1];
          var text2_a = hm[2];
          var text2_b = hm[3];
          var mid_common = hm[4];
          var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
          var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
          return diffs_a.concat(
            [new diff_match_patch.Diff(DIFF_EQUAL, mid_common)],
            diffs_b
          );
        }
        if (checklines && text1.length > 100 && text2.length > 100) {
          return this.diff_lineMode_(text1, text2, deadline);
        }
        return this.diff_bisect_(text1, text2, deadline);
      };
      diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
        var a = this.diff_linesToChars_(text1, text2);
        text1 = a.chars1;
        text2 = a.chars2;
        var linearray = a.lineArray;
        var diffs = this.diff_main(text1, text2, false, deadline);
        this.diff_charsToLines_(diffs, linearray);
        this.diff_cleanupSemantic(diffs);
        diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, ""));
        var pointer = 0;
        var count_delete = 0;
        var count_insert = 0;
        var text_delete = "";
        var text_insert = "";
        while (pointer < diffs.length) {
          switch (diffs[pointer][0]) {
            case DIFF_INSERT:
              count_insert++;
              text_insert += diffs[pointer][1];
              break;
            case DIFF_DELETE:
              count_delete++;
              text_delete += diffs[pointer][1];
              break;
            case DIFF_EQUAL:
              if (count_delete >= 1 && count_insert >= 1) {
                diffs.splice(
                  pointer - count_delete - count_insert,
                  count_delete + count_insert
                );
                pointer = pointer - count_delete - count_insert;
                var subDiff = this.diff_main(text_delete, text_insert, false, deadline);
                for (var j = subDiff.length - 1; j >= 0; j--) {
                  diffs.splice(pointer, 0, subDiff[j]);
                }
                pointer = pointer + subDiff.length;
              }
              count_insert = 0;
              count_delete = 0;
              text_delete = "";
              text_insert = "";
              break;
          }
          pointer++;
        }
        diffs.pop();
        return diffs;
      };
      diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
        var text1_length = text1.length;
        var text2_length = text2.length;
        var max_d = Math.ceil((text1_length + text2_length) / 2);
        var v_offset = max_d;
        var v_length = 2 * max_d;
        var v1 = new Array(v_length);
        var v2 = new Array(v_length);
        for (var x = 0; x < v_length; x++) {
          v1[x] = -1;
          v2[x] = -1;
        }
        v1[v_offset + 1] = 0;
        v2[v_offset + 1] = 0;
        var delta = text1_length - text2_length;
        var front = delta % 2 != 0;
        var k1start = 0;
        var k1end = 0;
        var k2start = 0;
        var k2end = 0;
        for (var d = 0; d < max_d; d++) {
          if ((/* @__PURE__ */ new Date()).getTime() > deadline) {
            break;
          }
          for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
            var k1_offset = v_offset + k1;
            var x1;
            if (k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
              x1 = v1[k1_offset + 1];
            } else {
              x1 = v1[k1_offset - 1] + 1;
            }
            var y1 = x1 - k1;
            while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text2.charAt(y1)) {
              x1++;
              y1++;
            }
            v1[k1_offset] = x1;
            if (x1 > text1_length) {
              k1end += 2;
            } else if (y1 > text2_length) {
              k1start += 2;
            } else if (front) {
              var k2_offset = v_offset + delta - k1;
              if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                var x2 = text1_length - v2[k2_offset];
                if (x1 >= x2) {
                  return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                }
              }
            }
          }
          for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
            var k2_offset = v_offset + k2;
            var x2;
            if (k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
              x2 = v2[k2_offset + 1];
            } else {
              x2 = v2[k2_offset - 1] + 1;
            }
            var y2 = x2 - k2;
            while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) == text2.charAt(text2_length - y2 - 1)) {
              x2++;
              y2++;
            }
            v2[k2_offset] = x2;
            if (x2 > text1_length) {
              k2end += 2;
            } else if (y2 > text2_length) {
              k2start += 2;
            } else if (!front) {
              var k1_offset = v_offset + delta - k2;
              if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                var x1 = v1[k1_offset];
                var y1 = v_offset + x1 - k1_offset;
                x2 = text1_length - x2;
                if (x1 >= x2) {
                  return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                }
              }
            }
          }
        }
        return [
          new diff_match_patch.Diff(DIFF_DELETE, text1),
          new diff_match_patch.Diff(DIFF_INSERT, text2)
        ];
      };
      diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y, deadline) {
        var text1a = text1.substring(0, x);
        var text2a = text2.substring(0, y);
        var text1b = text1.substring(x);
        var text2b = text2.substring(y);
        var diffs = this.diff_main(text1a, text2a, false, deadline);
        var diffsb = this.diff_main(text1b, text2b, false, deadline);
        return diffs.concat(diffsb);
      };
      diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
        var lineArray = [];
        var lineHash = {};
        lineArray[0] = "";
        function diff_linesToCharsMunge_(text) {
          var chars = "";
          var lineStart = 0;
          var lineEnd = -1;
          var lineArrayLength = lineArray.length;
          while (lineEnd < text.length - 1) {
            lineEnd = text.indexOf("\n", lineStart);
            if (lineEnd == -1) {
              lineEnd = text.length - 1;
            }
            var line = text.substring(lineStart, lineEnd + 1);
            if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== void 0) {
              chars += String.fromCharCode(lineHash[line]);
            } else {
              if (lineArrayLength == maxLines) {
                line = text.substring(lineStart);
                lineEnd = text.length;
              }
              chars += String.fromCharCode(lineArrayLength);
              lineHash[line] = lineArrayLength;
              lineArray[lineArrayLength++] = line;
            }
            lineStart = lineEnd + 1;
          }
          return chars;
        }
        var maxLines = 4e4;
        var chars1 = diff_linesToCharsMunge_(text1);
        maxLines = 65535;
        var chars2 = diff_linesToCharsMunge_(text2);
        return { chars1, chars2, lineArray };
      };
      diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
        for (var i = 0; i < diffs.length; i++) {
          var chars = diffs[i][1];
          var text = [];
          for (var j = 0; j < chars.length; j++) {
            text[j] = lineArray[chars.charCodeAt(j)];
          }
          diffs[i][1] = text.join("");
        }
      };
      diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
        if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
          return 0;
        }
        var pointermin = 0;
        var pointermax = Math.min(text1.length, text2.length);
        var pointermid = pointermax;
        var pointerstart = 0;
        while (pointermin < pointermid) {
          if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
            pointermin = pointermid;
            pointerstart = pointermin;
          } else {
            pointermax = pointermid;
          }
          pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
        }
        return pointermid;
      };
      diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
        if (!text1 || !text2 || text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
          return 0;
        }
        var pointermin = 0;
        var pointermax = Math.min(text1.length, text2.length);
        var pointermid = pointermax;
        var pointerend = 0;
        while (pointermin < pointermid) {
          if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
            pointermin = pointermid;
            pointerend = pointermin;
          } else {
            pointermax = pointermid;
          }
          pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
        }
        return pointermid;
      };
      diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
        var text1_length = text1.length;
        var text2_length = text2.length;
        if (text1_length == 0 || text2_length == 0) {
          return 0;
        }
        if (text1_length > text2_length) {
          text1 = text1.substring(text1_length - text2_length);
        } else if (text1_length < text2_length) {
          text2 = text2.substring(0, text1_length);
        }
        var text_length = Math.min(text1_length, text2_length);
        if (text1 == text2) {
          return text_length;
        }
        var best = 0;
        var length = 1;
        while (true) {
          var pattern = text1.substring(text_length - length);
          var found = text2.indexOf(pattern);
          if (found == -1) {
            return best;
          }
          length += found;
          if (found == 0 || text1.substring(text_length - length) == text2.substring(0, length)) {
            best = length;
            length++;
          }
        }
      };
      diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
        if (this.Diff_Timeout <= 0) {
          return null;
        }
        var longtext = text1.length > text2.length ? text1 : text2;
        var shorttext = text1.length > text2.length ? text2 : text1;
        if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
          return null;
        }
        var dmp2 = this;
        function diff_halfMatchI_(longtext2, shorttext2, i) {
          var seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4));
          var j = -1;
          var best_common = "";
          var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
          while ((j = shorttext2.indexOf(seed, j + 1)) != -1) {
            var prefixLength = dmp2.diff_commonPrefix(
              longtext2.substring(i),
              shorttext2.substring(j)
            );
            var suffixLength = dmp2.diff_commonSuffix(
              longtext2.substring(0, i),
              shorttext2.substring(0, j)
            );
            if (best_common.length < suffixLength + prefixLength) {
              best_common = shorttext2.substring(j - suffixLength, j) + shorttext2.substring(j, j + prefixLength);
              best_longtext_a = longtext2.substring(0, i - suffixLength);
              best_longtext_b = longtext2.substring(i + prefixLength);
              best_shorttext_a = shorttext2.substring(0, j - suffixLength);
              best_shorttext_b = shorttext2.substring(j + prefixLength);
            }
          }
          if (best_common.length * 2 >= longtext2.length) {
            return [
              best_longtext_a,
              best_longtext_b,
              best_shorttext_a,
              best_shorttext_b,
              best_common
            ];
          } else {
            return null;
          }
        }
        var hm1 = diff_halfMatchI_(
          longtext,
          shorttext,
          Math.ceil(longtext.length / 4)
        );
        var hm2 = diff_halfMatchI_(
          longtext,
          shorttext,
          Math.ceil(longtext.length / 2)
        );
        var hm;
        if (!hm1 && !hm2) {
          return null;
        } else if (!hm2) {
          hm = hm1;
        } else if (!hm1) {
          hm = hm2;
        } else {
          hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
        }
        var text1_a, text1_b, text2_a, text2_b;
        if (text1.length > text2.length) {
          text1_a = hm[0];
          text1_b = hm[1];
          text2_a = hm[2];
          text2_b = hm[3];
        } else {
          text2_a = hm[0];
          text2_b = hm[1];
          text1_a = hm[2];
          text1_b = hm[3];
        }
        var mid_common = hm[4];
        return [text1_a, text1_b, text2_a, text2_b, mid_common];
      };
      diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
        var changes = false;
        var equalities = [];
        var equalitiesLength = 0;
        var lastEquality = null;
        var pointer = 0;
        var length_insertions1 = 0;
        var length_deletions1 = 0;
        var length_insertions2 = 0;
        var length_deletions2 = 0;
        while (pointer < diffs.length) {
          if (diffs[pointer][0] == DIFF_EQUAL) {
            equalities[equalitiesLength++] = pointer;
            length_insertions1 = length_insertions2;
            length_deletions1 = length_deletions2;
            length_insertions2 = 0;
            length_deletions2 = 0;
            lastEquality = diffs[pointer][1];
          } else {
            if (diffs[pointer][0] == DIFF_INSERT) {
              length_insertions2 += diffs[pointer][1].length;
            } else {
              length_deletions2 += diffs[pointer][1].length;
            }
            if (lastEquality && lastEquality.length <= Math.max(length_insertions1, length_deletions1) && lastEquality.length <= Math.max(
              length_insertions2,
              length_deletions2
            )) {
              diffs.splice(
                equalities[equalitiesLength - 1],
                0,
                new diff_match_patch.Diff(DIFF_DELETE, lastEquality)
              );
              diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
              equalitiesLength--;
              equalitiesLength--;
              pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
              length_insertions1 = 0;
              length_deletions1 = 0;
              length_insertions2 = 0;
              length_deletions2 = 0;
              lastEquality = null;
              changes = true;
            }
          }
          pointer++;
        }
        if (changes) {
          this.diff_cleanupMerge(diffs);
        }
        this.diff_cleanupSemanticLossless(diffs);
        pointer = 1;
        while (pointer < diffs.length) {
          if (diffs[pointer - 1][0] == DIFF_DELETE && diffs[pointer][0] == DIFF_INSERT) {
            var deletion = diffs[pointer - 1][1];
            var insertion = diffs[pointer][1];
            var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
            var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
            if (overlap_length1 >= overlap_length2) {
              if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
                diffs.splice(pointer, 0, new diff_match_patch.Diff(
                  DIFF_EQUAL,
                  insertion.substring(0, overlap_length1)
                ));
                diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
                diffs[pointer + 1][1] = insertion.substring(overlap_length1);
                pointer++;
              }
            } else {
              if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
                diffs.splice(pointer, 0, new diff_match_patch.Diff(
                  DIFF_EQUAL,
                  deletion.substring(0, overlap_length2)
                ));
                diffs[pointer - 1][0] = DIFF_INSERT;
                diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
                diffs[pointer + 1][0] = DIFF_DELETE;
                diffs[pointer + 1][1] = deletion.substring(overlap_length2);
                pointer++;
              }
            }
            pointer++;
          }
          pointer++;
        }
      };
      diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
        function diff_cleanupSemanticScore_(one, two) {
          if (!one || !two) {
            return 6;
          }
          var char1 = one.charAt(one.length - 1);
          var char2 = two.charAt(0);
          var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
          var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
          var whitespace1 = nonAlphaNumeric1 && char1.match(diff_match_patch.whitespaceRegex_);
          var whitespace2 = nonAlphaNumeric2 && char2.match(diff_match_patch.whitespaceRegex_);
          var lineBreak1 = whitespace1 && char1.match(diff_match_patch.linebreakRegex_);
          var lineBreak2 = whitespace2 && char2.match(diff_match_patch.linebreakRegex_);
          var blankLine1 = lineBreak1 && one.match(diff_match_patch.blanklineEndRegex_);
          var blankLine2 = lineBreak2 && two.match(diff_match_patch.blanklineStartRegex_);
          if (blankLine1 || blankLine2) {
            return 5;
          } else if (lineBreak1 || lineBreak2) {
            return 4;
          } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
            return 3;
          } else if (whitespace1 || whitespace2) {
            return 2;
          } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
            return 1;
          }
          return 0;
        }
        var pointer = 1;
        while (pointer < diffs.length - 1) {
          if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
            var equality1 = diffs[pointer - 1][1];
            var edit = diffs[pointer][1];
            var equality2 = diffs[pointer + 1][1];
            var commonOffset = this.diff_commonSuffix(equality1, edit);
            if (commonOffset) {
              var commonString = edit.substring(edit.length - commonOffset);
              equality1 = equality1.substring(0, equality1.length - commonOffset);
              edit = commonString + edit.substring(0, edit.length - commonOffset);
              equality2 = commonString + equality2;
            }
            var bestEquality1 = equality1;
            var bestEdit = edit;
            var bestEquality2 = equality2;
            var bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
            while (edit.charAt(0) === equality2.charAt(0)) {
              equality1 += edit.charAt(0);
              edit = edit.substring(1) + equality2.charAt(0);
              equality2 = equality2.substring(1);
              var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
              if (score >= bestScore) {
                bestScore = score;
                bestEquality1 = equality1;
                bestEdit = edit;
                bestEquality2 = equality2;
              }
            }
            if (diffs[pointer - 1][1] != bestEquality1) {
              if (bestEquality1) {
                diffs[pointer - 1][1] = bestEquality1;
              } else {
                diffs.splice(pointer - 1, 1);
                pointer--;
              }
              diffs[pointer][1] = bestEdit;
              if (bestEquality2) {
                diffs[pointer + 1][1] = bestEquality2;
              } else {
                diffs.splice(pointer + 1, 1);
                pointer--;
              }
            }
          }
          pointer++;
        }
      };
      diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
      diff_match_patch.whitespaceRegex_ = /\s/;
      diff_match_patch.linebreakRegex_ = /[\r\n]/;
      diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
      diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;
      diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
        var changes = false;
        var equalities = [];
        var equalitiesLength = 0;
        var lastEquality = null;
        var pointer = 0;
        var pre_ins = false;
        var pre_del = false;
        var post_ins = false;
        var post_del = false;
        while (pointer < diffs.length) {
          if (diffs[pointer][0] == DIFF_EQUAL) {
            if (diffs[pointer][1].length < this.Diff_EditCost && (post_ins || post_del)) {
              equalities[equalitiesLength++] = pointer;
              pre_ins = post_ins;
              pre_del = post_del;
              lastEquality = diffs[pointer][1];
            } else {
              equalitiesLength = 0;
              lastEquality = null;
            }
            post_ins = post_del = false;
          } else {
            if (diffs[pointer][0] == DIFF_DELETE) {
              post_del = true;
            } else {
              post_ins = true;
            }
            if (lastEquality && (pre_ins && pre_del && post_ins && post_del || lastEquality.length < this.Diff_EditCost / 2 && pre_ins + pre_del + post_ins + post_del == 3)) {
              diffs.splice(
                equalities[equalitiesLength - 1],
                0,
                new diff_match_patch.Diff(DIFF_DELETE, lastEquality)
              );
              diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
              equalitiesLength--;
              lastEquality = null;
              if (pre_ins && pre_del) {
                post_ins = post_del = true;
                equalitiesLength = 0;
              } else {
                equalitiesLength--;
                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                post_ins = post_del = false;
              }
              changes = true;
            }
          }
          pointer++;
        }
        if (changes) {
          this.diff_cleanupMerge(diffs);
        }
      };
      diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
        diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, ""));
        var pointer = 0;
        var count_delete = 0;
        var count_insert = 0;
        var text_delete = "";
        var text_insert = "";
        var commonlength;
        while (pointer < diffs.length) {
          switch (diffs[pointer][0]) {
            case DIFF_INSERT:
              count_insert++;
              text_insert += diffs[pointer][1];
              pointer++;
              break;
            case DIFF_DELETE:
              count_delete++;
              text_delete += diffs[pointer][1];
              pointer++;
              break;
            case DIFF_EQUAL:
              if (count_delete + count_insert > 1) {
                if (count_delete !== 0 && count_insert !== 0) {
                  commonlength = this.diff_commonPrefix(text_insert, text_delete);
                  if (commonlength !== 0) {
                    if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] == DIFF_EQUAL) {
                      diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                    } else {
                      diffs.splice(0, 0, new diff_match_patch.Diff(
                        DIFF_EQUAL,
                        text_insert.substring(0, commonlength)
                      ));
                      pointer++;
                    }
                    text_insert = text_insert.substring(commonlength);
                    text_delete = text_delete.substring(commonlength);
                  }
                  commonlength = this.diff_commonSuffix(text_insert, text_delete);
                  if (commonlength !== 0) {
                    diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                    text_insert = text_insert.substring(0, text_insert.length - commonlength);
                    text_delete = text_delete.substring(0, text_delete.length - commonlength);
                  }
                }
                pointer -= count_delete + count_insert;
                diffs.splice(pointer, count_delete + count_insert);
                if (text_delete.length) {
                  diffs.splice(
                    pointer,
                    0,
                    new diff_match_patch.Diff(DIFF_DELETE, text_delete)
                  );
                  pointer++;
                }
                if (text_insert.length) {
                  diffs.splice(
                    pointer,
                    0,
                    new diff_match_patch.Diff(DIFF_INSERT, text_insert)
                  );
                  pointer++;
                }
                pointer++;
              } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
                diffs[pointer - 1][1] += diffs[pointer][1];
                diffs.splice(pointer, 1);
              } else {
                pointer++;
              }
              count_insert = 0;
              count_delete = 0;
              text_delete = "";
              text_insert = "";
              break;
          }
        }
        if (diffs[diffs.length - 1][1] === "") {
          diffs.pop();
        }
        var changes = false;
        pointer = 1;
        while (pointer < diffs.length - 1) {
          if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
            if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
              diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
              diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
              diffs.splice(pointer - 1, 1);
              changes = true;
            } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
              diffs[pointer - 1][1] += diffs[pointer + 1][1];
              diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
              diffs.splice(pointer + 1, 1);
              changes = true;
            }
          }
          pointer++;
        }
        if (changes) {
          this.diff_cleanupMerge(diffs);
        }
      };
      diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
        var chars1 = 0;
        var chars2 = 0;
        var last_chars1 = 0;
        var last_chars2 = 0;
        var x;
        for (x = 0; x < diffs.length; x++) {
          if (diffs[x][0] !== DIFF_INSERT) {
            chars1 += diffs[x][1].length;
          }
          if (diffs[x][0] !== DIFF_DELETE) {
            chars2 += diffs[x][1].length;
          }
          if (chars1 > loc) {
            break;
          }
          last_chars1 = chars1;
          last_chars2 = chars2;
        }
        if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
          return last_chars2;
        }
        return last_chars2 + (loc - last_chars1);
      };
      diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
        var html = [];
        var pattern_amp = /&/g;
        var pattern_lt = /</g;
        var pattern_gt = />/g;
        var pattern_para = /\n/g;
        for (var x = 0; x < diffs.length; x++) {
          var op = diffs[x][0];
          var data = diffs[x][1];
          var text = data.replace(pattern_amp, "&amp;").replace(pattern_lt, "&lt;").replace(pattern_gt, "&gt;").replace(pattern_para, "&para;<br>");
          switch (op) {
            case DIFF_INSERT:
              html[x] = '<ins style="background:#e6ffe6;">' + text + "</ins>";
              break;
            case DIFF_DELETE:
              html[x] = '<del style="background:#ffe6e6;">' + text + "</del>";
              break;
            case DIFF_EQUAL:
              html[x] = "<span>" + text + "</span>";
              break;
          }
        }
        return html.join("");
      };
      diff_match_patch.prototype.diff_text1 = function(diffs) {
        var text = [];
        for (var x = 0; x < diffs.length; x++) {
          if (diffs[x][0] !== DIFF_INSERT) {
            text[x] = diffs[x][1];
          }
        }
        return text.join("");
      };
      diff_match_patch.prototype.diff_text2 = function(diffs) {
        var text = [];
        for (var x = 0; x < diffs.length; x++) {
          if (diffs[x][0] !== DIFF_DELETE) {
            text[x] = diffs[x][1];
          }
        }
        return text.join("");
      };
      diff_match_patch.prototype.diff_levenshtein = function(diffs) {
        var levenshtein = 0;
        var insertions = 0;
        var deletions = 0;
        for (var x = 0; x < diffs.length; x++) {
          var op = diffs[x][0];
          var data = diffs[x][1];
          switch (op) {
            case DIFF_INSERT:
              insertions += data.length;
              break;
            case DIFF_DELETE:
              deletions += data.length;
              break;
            case DIFF_EQUAL:
              levenshtein += Math.max(insertions, deletions);
              insertions = 0;
              deletions = 0;
              break;
          }
        }
        levenshtein += Math.max(insertions, deletions);
        return levenshtein;
      };
      diff_match_patch.prototype.diff_toDelta = function(diffs) {
        var text = [];
        for (var x = 0; x < diffs.length; x++) {
          switch (diffs[x][0]) {
            case DIFF_INSERT:
              text[x] = "+" + encodeURI(diffs[x][1]);
              break;
            case DIFF_DELETE:
              text[x] = "-" + diffs[x][1].length;
              break;
            case DIFF_EQUAL:
              text[x] = "=" + diffs[x][1].length;
              break;
          }
        }
        return text.join("	").replace(/%20/g, " ");
      };
      diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
        var diffs = [];
        var diffsLength = 0;
        var pointer = 0;
        var tokens = delta.split(/\t/g);
        for (var x = 0; x < tokens.length; x++) {
          var param = tokens[x].substring(1);
          switch (tokens[x].charAt(0)) {
            case "+":
              try {
                diffs[diffsLength++] = new diff_match_patch.Diff(DIFF_INSERT, decodeURI(param));
              } catch (ex) {
                throw new Error("Illegal escape in diff_fromDelta: " + param);
              }
              break;
            case "-":
            // Fall through.
            case "=":
              var n = parseInt(param, 10);
              if (isNaN(n) || n < 0) {
                throw new Error("Invalid number in diff_fromDelta: " + param);
              }
              var text = text1.substring(pointer, pointer += n);
              if (tokens[x].charAt(0) == "=") {
                diffs[diffsLength++] = new diff_match_patch.Diff(DIFF_EQUAL, text);
              } else {
                diffs[diffsLength++] = new diff_match_patch.Diff(DIFF_DELETE, text);
              }
              break;
            default:
              if (tokens[x]) {
                throw new Error("Invalid diff operation in diff_fromDelta: " + tokens[x]);
              }
          }
        }
        if (pointer != text1.length) {
          throw new Error("Delta length (" + pointer + ") does not equal source text length (" + text1.length + ").");
        }
        return diffs;
      };
      diff_match_patch.prototype.match_main = function(text, pattern, loc) {
        if (text == null || pattern == null || loc == null) {
          throw new Error("Null input. (match_main)");
        }
        loc = Math.max(0, Math.min(loc, text.length));
        if (text == pattern) {
          return 0;
        } else if (!text.length) {
          return -1;
        } else if (text.substring(loc, loc + pattern.length) == pattern) {
          return loc;
        } else {
          return this.match_bitap_(text, pattern, loc);
        }
      };
      diff_match_patch.prototype.match_bitap_ = function(text, pattern, loc) {
        if (pattern.length > this.Match_MaxBits) {
          throw new Error("Pattern too long for this browser.");
        }
        var s = this.match_alphabet_(pattern);
        var dmp2 = this;
        function match_bitapScore_(e, x) {
          var accuracy = e / pattern.length;
          var proximity = Math.abs(loc - x);
          if (!dmp2.Match_Distance) {
            return proximity ? 1 : accuracy;
          }
          return accuracy + proximity / dmp2.Match_Distance;
        }
        var score_threshold = this.Match_Threshold;
        var best_loc = text.indexOf(pattern, loc);
        if (best_loc != -1) {
          score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
          best_loc = text.lastIndexOf(pattern, loc + pattern.length);
          if (best_loc != -1) {
            score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
          }
        }
        var matchmask = 1 << pattern.length - 1;
        best_loc = -1;
        var bin_min, bin_mid;
        var bin_max = pattern.length + text.length;
        var last_rd;
        for (var d = 0; d < pattern.length; d++) {
          bin_min = 0;
          bin_mid = bin_max;
          while (bin_min < bin_mid) {
            if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
              bin_min = bin_mid;
            } else {
              bin_max = bin_mid;
            }
            bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
          }
          bin_max = bin_mid;
          var start = Math.max(1, loc - bin_mid + 1);
          var finish = Math.min(loc + bin_mid, text.length) + pattern.length;
          var rd = Array(finish + 2);
          rd[finish + 1] = (1 << d) - 1;
          for (var j = finish; j >= start; j--) {
            var charMatch = s[text.charAt(j - 1)];
            if (d === 0) {
              rd[j] = (rd[j + 1] << 1 | 1) & charMatch;
            } else {
              rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((last_rd[j + 1] | last_rd[j]) << 1 | 1) | last_rd[j + 1];
            }
            if (rd[j] & matchmask) {
              var score = match_bitapScore_(d, j - 1);
              if (score <= score_threshold) {
                score_threshold = score;
                best_loc = j - 1;
                if (best_loc > loc) {
                  start = Math.max(1, 2 * loc - best_loc);
                } else {
                  break;
                }
              }
            }
          }
          if (match_bitapScore_(d + 1, loc) > score_threshold) {
            break;
          }
          last_rd = rd;
        }
        return best_loc;
      };
      diff_match_patch.prototype.match_alphabet_ = function(pattern) {
        var s = {};
        for (var i = 0; i < pattern.length; i++) {
          s[pattern.charAt(i)] = 0;
        }
        for (var i = 0; i < pattern.length; i++) {
          s[pattern.charAt(i)] |= 1 << pattern.length - i - 1;
        }
        return s;
      };
      diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
        if (text.length == 0) {
          return;
        }
        if (patch.start2 === null) {
          throw Error("patch not initialized");
        }
        var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
        var padding = 0;
        while (text.indexOf(pattern) != text.lastIndexOf(pattern) && pattern.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin) {
          padding += this.Patch_Margin;
          pattern = text.substring(
            patch.start2 - padding,
            patch.start2 + patch.length1 + padding
          );
        }
        padding += this.Patch_Margin;
        var prefix = text.substring(patch.start2 - padding, patch.start2);
        if (prefix) {
          patch.diffs.unshift(new diff_match_patch.Diff(DIFF_EQUAL, prefix));
        }
        var suffix = text.substring(
          patch.start2 + patch.length1,
          patch.start2 + patch.length1 + padding
        );
        if (suffix) {
          patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, suffix));
        }
        patch.start1 -= prefix.length;
        patch.start2 -= prefix.length;
        patch.length1 += prefix.length + suffix.length;
        patch.length2 += prefix.length + suffix.length;
      };
      diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
        var text1, diffs;
        if (typeof a == "string" && typeof opt_b == "string" && typeof opt_c == "undefined") {
          text1 = /** @type {string} */
          a;
          diffs = this.diff_main(
            text1,
            /** @type {string} */
            opt_b,
            true
          );
          if (diffs.length > 2) {
            this.diff_cleanupSemantic(diffs);
            this.diff_cleanupEfficiency(diffs);
          }
        } else if (a && typeof a == "object" && typeof opt_b == "undefined" && typeof opt_c == "undefined") {
          diffs = /** @type {!Array.<!diff_match_patch.Diff>} */
          a;
          text1 = this.diff_text1(diffs);
        } else if (typeof a == "string" && opt_b && typeof opt_b == "object" && typeof opt_c == "undefined") {
          text1 = /** @type {string} */
          a;
          diffs = /** @type {!Array.<!diff_match_patch.Diff>} */
          opt_b;
        } else if (typeof a == "string" && typeof opt_b == "string" && opt_c && typeof opt_c == "object") {
          text1 = /** @type {string} */
          a;
          diffs = /** @type {!Array.<!diff_match_patch.Diff>} */
          opt_c;
        } else {
          throw new Error("Unknown call format to patch_make.");
        }
        if (diffs.length === 0) {
          return [];
        }
        var patches = [];
        var patch = new diff_match_patch.patch_obj();
        var patchDiffLength = 0;
        var char_count1 = 0;
        var char_count2 = 0;
        var prepatch_text = text1;
        var postpatch_text = text1;
        for (var x = 0; x < diffs.length; x++) {
          var diff_type = diffs[x][0];
          var diff_text = diffs[x][1];
          if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
            patch.start1 = char_count1;
            patch.start2 = char_count2;
          }
          switch (diff_type) {
            case DIFF_INSERT:
              patch.diffs[patchDiffLength++] = diffs[x];
              patch.length2 += diff_text.length;
              postpatch_text = postpatch_text.substring(0, char_count2) + diff_text + postpatch_text.substring(char_count2);
              break;
            case DIFF_DELETE:
              patch.length1 += diff_text.length;
              patch.diffs[patchDiffLength++] = diffs[x];
              postpatch_text = postpatch_text.substring(0, char_count2) + postpatch_text.substring(char_count2 + diff_text.length);
              break;
            case DIFF_EQUAL:
              if (diff_text.length <= 2 * this.Patch_Margin && patchDiffLength && diffs.length != x + 1) {
                patch.diffs[patchDiffLength++] = diffs[x];
                patch.length1 += diff_text.length;
                patch.length2 += diff_text.length;
              } else if (diff_text.length >= 2 * this.Patch_Margin) {
                if (patchDiffLength) {
                  this.patch_addContext_(patch, prepatch_text);
                  patches.push(patch);
                  patch = new diff_match_patch.patch_obj();
                  patchDiffLength = 0;
                  prepatch_text = postpatch_text;
                  char_count1 = char_count2;
                }
              }
              break;
          }
          if (diff_type !== DIFF_INSERT) {
            char_count1 += diff_text.length;
          }
          if (diff_type !== DIFF_DELETE) {
            char_count2 += diff_text.length;
          }
        }
        if (patchDiffLength) {
          this.patch_addContext_(patch, prepatch_text);
          patches.push(patch);
        }
        return patches;
      };
      diff_match_patch.prototype.patch_deepCopy = function(patches) {
        var patchesCopy = [];
        for (var x = 0; x < patches.length; x++) {
          var patch = patches[x];
          var patchCopy = new diff_match_patch.patch_obj();
          patchCopy.diffs = [];
          for (var y = 0; y < patch.diffs.length; y++) {
            patchCopy.diffs[y] = new diff_match_patch.Diff(patch.diffs[y][0], patch.diffs[y][1]);
          }
          patchCopy.start1 = patch.start1;
          patchCopy.start2 = patch.start2;
          patchCopy.length1 = patch.length1;
          patchCopy.length2 = patch.length2;
          patchesCopy[x] = patchCopy;
        }
        return patchesCopy;
      };
      diff_match_patch.prototype.patch_apply = function(patches, text) {
        if (patches.length == 0) {
          return [text, []];
        }
        patches = this.patch_deepCopy(patches);
        var nullPadding = this.patch_addPadding(patches);
        text = nullPadding + text + nullPadding;
        this.patch_splitMax(patches);
        var delta = 0;
        var results = [];
        for (var x = 0; x < patches.length; x++) {
          var expected_loc = patches[x].start2 + delta;
          var text1 = this.diff_text1(patches[x].diffs);
          var start_loc;
          var end_loc = -1;
          if (text1.length > this.Match_MaxBits) {
            start_loc = this.match_main(
              text,
              text1.substring(0, this.Match_MaxBits),
              expected_loc
            );
            if (start_loc != -1) {
              end_loc = this.match_main(
                text,
                text1.substring(text1.length - this.Match_MaxBits),
                expected_loc + text1.length - this.Match_MaxBits
              );
              if (end_loc == -1 || start_loc >= end_loc) {
                start_loc = -1;
              }
            }
          } else {
            start_loc = this.match_main(text, text1, expected_loc);
          }
          if (start_loc == -1) {
            results[x] = false;
            delta -= patches[x].length2 - patches[x].length1;
          } else {
            results[x] = true;
            delta = start_loc - expected_loc;
            var text2;
            if (end_loc == -1) {
              text2 = text.substring(start_loc, start_loc + text1.length);
            } else {
              text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
            }
            if (text1 == text2) {
              text = text.substring(0, start_loc) + this.diff_text2(patches[x].diffs) + text.substring(start_loc + text1.length);
            } else {
              var diffs = this.diff_main(text1, text2, false);
              if (text1.length > this.Match_MaxBits && this.diff_levenshtein(diffs) / text1.length > this.Patch_DeleteThreshold) {
                results[x] = false;
              } else {
                this.diff_cleanupSemanticLossless(diffs);
                var index1 = 0;
                var index2;
                for (var y = 0; y < patches[x].diffs.length; y++) {
                  var mod = patches[x].diffs[y];
                  if (mod[0] !== DIFF_EQUAL) {
                    index2 = this.diff_xIndex(diffs, index1);
                  }
                  if (mod[0] === DIFF_INSERT) {
                    text = text.substring(0, start_loc + index2) + mod[1] + text.substring(start_loc + index2);
                  } else if (mod[0] === DIFF_DELETE) {
                    text = text.substring(0, start_loc + index2) + text.substring(start_loc + this.diff_xIndex(
                      diffs,
                      index1 + mod[1].length
                    ));
                  }
                  if (mod[0] !== DIFF_DELETE) {
                    index1 += mod[1].length;
                  }
                }
              }
            }
          }
        }
        text = text.substring(nullPadding.length, text.length - nullPadding.length);
        return [text, results];
      };
      diff_match_patch.prototype.patch_addPadding = function(patches) {
        var paddingLength = this.Patch_Margin;
        var nullPadding = "";
        for (var x = 1; x <= paddingLength; x++) {
          nullPadding += String.fromCharCode(x);
        }
        for (var x = 0; x < patches.length; x++) {
          patches[x].start1 += paddingLength;
          patches[x].start2 += paddingLength;
        }
        var patch = patches[0];
        var diffs = patch.diffs;
        if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
          diffs.unshift(new diff_match_patch.Diff(DIFF_EQUAL, nullPadding));
          patch.start1 -= paddingLength;
          patch.start2 -= paddingLength;
          patch.length1 += paddingLength;
          patch.length2 += paddingLength;
        } else if (paddingLength > diffs[0][1].length) {
          var extraLength = paddingLength - diffs[0][1].length;
          diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
          patch.start1 -= extraLength;
          patch.start2 -= extraLength;
          patch.length1 += extraLength;
          patch.length2 += extraLength;
        }
        patch = patches[patches.length - 1];
        diffs = patch.diffs;
        if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
          diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, nullPadding));
          patch.length1 += paddingLength;
          patch.length2 += paddingLength;
        } else if (paddingLength > diffs[diffs.length - 1][1].length) {
          var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
          diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
          patch.length1 += extraLength;
          patch.length2 += extraLength;
        }
        return nullPadding;
      };
      diff_match_patch.prototype.patch_splitMax = function(patches) {
        var patch_size = this.Match_MaxBits;
        for (var x = 0; x < patches.length; x++) {
          if (patches[x].length1 <= patch_size) {
            continue;
          }
          var bigpatch = patches[x];
          patches.splice(x--, 1);
          var start1 = bigpatch.start1;
          var start2 = bigpatch.start2;
          var precontext = "";
          while (bigpatch.diffs.length !== 0) {
            var patch = new diff_match_patch.patch_obj();
            var empty = true;
            patch.start1 = start1 - precontext.length;
            patch.start2 = start2 - precontext.length;
            if (precontext !== "") {
              patch.length1 = patch.length2 = precontext.length;
              patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, precontext));
            }
            while (bigpatch.diffs.length !== 0 && patch.length1 < patch_size - this.Patch_Margin) {
              var diff_type = bigpatch.diffs[0][0];
              var diff_text = bigpatch.diffs[0][1];
              if (diff_type === DIFF_INSERT) {
                patch.length2 += diff_text.length;
                start2 += diff_text.length;
                patch.diffs.push(bigpatch.diffs.shift());
                empty = false;
              } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 && patch.diffs[0][0] == DIFF_EQUAL && diff_text.length > 2 * patch_size) {
                patch.length1 += diff_text.length;
                start1 += diff_text.length;
                empty = false;
                patch.diffs.push(new diff_match_patch.Diff(diff_type, diff_text));
                bigpatch.diffs.shift();
              } else {
                diff_text = diff_text.substring(
                  0,
                  patch_size - patch.length1 - this.Patch_Margin
                );
                patch.length1 += diff_text.length;
                start1 += diff_text.length;
                if (diff_type === DIFF_EQUAL) {
                  patch.length2 += diff_text.length;
                  start2 += diff_text.length;
                } else {
                  empty = false;
                }
                patch.diffs.push(new diff_match_patch.Diff(diff_type, diff_text));
                if (diff_text == bigpatch.diffs[0][1]) {
                  bigpatch.diffs.shift();
                } else {
                  bigpatch.diffs[0][1] = bigpatch.diffs[0][1].substring(diff_text.length);
                }
              }
            }
            precontext = this.diff_text2(patch.diffs);
            precontext = precontext.substring(precontext.length - this.Patch_Margin);
            var postcontext = this.diff_text1(bigpatch.diffs).substring(0, this.Patch_Margin);
            if (postcontext !== "") {
              patch.length1 += postcontext.length;
              patch.length2 += postcontext.length;
              if (patch.diffs.length !== 0 && patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
                patch.diffs[patch.diffs.length - 1][1] += postcontext;
              } else {
                patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, postcontext));
              }
            }
            if (!empty) {
              patches.splice(++x, 0, patch);
            }
          }
        }
      };
      diff_match_patch.prototype.patch_toText = function(patches) {
        var text = [];
        for (var x = 0; x < patches.length; x++) {
          text[x] = patches[x];
        }
        return text.join("");
      };
      diff_match_patch.prototype.patch_fromText = function(textline) {
        var patches = [];
        if (!textline) {
          return patches;
        }
        var text = textline.split("\n");
        var textPointer = 0;
        var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
        while (textPointer < text.length) {
          var m = text[textPointer].match(patchHeader);
          if (!m) {
            throw new Error("Invalid patch string: " + text[textPointer]);
          }
          var patch = new diff_match_patch.patch_obj();
          patches.push(patch);
          patch.start1 = parseInt(m[1], 10);
          if (m[2] === "") {
            patch.start1--;
            patch.length1 = 1;
          } else if (m[2] == "0") {
            patch.length1 = 0;
          } else {
            patch.start1--;
            patch.length1 = parseInt(m[2], 10);
          }
          patch.start2 = parseInt(m[3], 10);
          if (m[4] === "") {
            patch.start2--;
            patch.length2 = 1;
          } else if (m[4] == "0") {
            patch.length2 = 0;
          } else {
            patch.start2--;
            patch.length2 = parseInt(m[4], 10);
          }
          textPointer++;
          while (textPointer < text.length) {
            var sign = text[textPointer].charAt(0);
            try {
              var line = decodeURI(text[textPointer].substring(1));
            } catch (ex) {
              throw new Error("Illegal escape in patch_fromText: " + line);
            }
            if (sign == "-") {
              patch.diffs.push(new diff_match_patch.Diff(DIFF_DELETE, line));
            } else if (sign == "+") {
              patch.diffs.push(new diff_match_patch.Diff(DIFF_INSERT, line));
            } else if (sign == " ") {
              patch.diffs.push(new diff_match_patch.Diff(DIFF_EQUAL, line));
            } else if (sign == "@") {
              break;
            } else if (sign === "") {
            } else {
              throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
            }
            textPointer++;
          }
        }
        return patches;
      };
      diff_match_patch.patch_obj = function() {
        this.diffs = [];
        this.start1 = null;
        this.start2 = null;
        this.length1 = 0;
        this.length2 = 0;
      };
      diff_match_patch.patch_obj.prototype.toString = function() {
        var coords1, coords2;
        if (this.length1 === 0) {
          coords1 = this.start1 + ",0";
        } else if (this.length1 == 1) {
          coords1 = this.start1 + 1;
        } else {
          coords1 = this.start1 + 1 + "," + this.length1;
        }
        if (this.length2 === 0) {
          coords2 = this.start2 + ",0";
        } else if (this.length2 == 1) {
          coords2 = this.start2 + 1;
        } else {
          coords2 = this.start2 + 1 + "," + this.length2;
        }
        var text = ["@@ -" + coords1 + " +" + coords2 + " @@\n"];
        var op;
        for (var x = 0; x < this.diffs.length; x++) {
          switch (this.diffs[x][0]) {
            case DIFF_INSERT:
              op = "+";
              break;
            case DIFF_DELETE:
              op = "-";
              break;
            case DIFF_EQUAL:
              op = " ";
              break;
          }
          text[x + 1] = op + encodeURI(this.diffs[x][1]) + "\n";
        }
        return text.join("").replace(/%20/g, " ");
      };
      module.exports = diff_match_patch;
      module.exports["diff_match_patch"] = diff_match_patch;
      module.exports["DIFF_DELETE"] = DIFF_DELETE;
      module.exports["DIFF_INSERT"] = DIFF_INSERT;
      module.exports["DIFF_EQUAL"] = DIFF_EQUAL;
    }
  });

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    DOM_RULES: () => DOM_RULES,
    createCompare: () => createCompare,
    diffTrees: () => diffTrees,
    ensureUiStyle: () => ensureUiStyle,
    getMessages: () => getMessages,
    messages: () => messages,
    mountChangeList: () => mountChangeList,
    mountLayout: () => mountLayout,
    mountToolbar: () => mountToolbar,
    mountViewer: () => mountViewer,
    safeUrl: () => safeUrl,
    snapshot: () => snapshot,
    version: () => version
  });

  // src/snapshot.js
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "HEAD", "OBJECT"]);
  var DEFAULT_ATTRS = ["src", "href", "alt", "colspan", "rowspan", "type"];
  var DEFAULT_ANCHORS = "p,li,tr,h1,h2,h3,h4,h5,h6,dt,dd,pre,blockquote,figcaption,caption,img,[data-sgc-key]";
  var KEY_ATTRS = ["data-sgc-key", "data-key"];
  function hashStr(str, seed = 0) {
    let h1 = 3735928559 ^ seed, h2 = 1103547991 ^ seed, h3 = 2654435769 ^ seed;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
      h3 = Math.imul(h3 ^ ch, 2246822507) ^ h3 >>> 15;
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    h3 = Math.imul(h3 ^ h3 >>> 16, 3266489909) ^ str.length;
    return String.fromCharCode(h1 & 65535, h1 >>> 16, h2 & 65535, h2 >>> 16, h3 & 65535, h3 >>> 16);
  }
  function frameBody(el) {
    try {
      const d = el.contentDocument;
      return d && d.body && d.readyState !== "loading" ? d.body : null;
    } catch {
      return null;
    }
  }
  var normText = (s) => s.replace(/\s+/g, " ").trim();
  function snapshot(root, opt = {}) {
    const it = walk(root, opt);
    let r = it.next();
    while (!r.done) r = it.next();
    return r.value;
  }
  async function snapshotAsync(root, opt = {}, sliceMs = 8) {
    const it = walk(root, opt);
    let t = performance.now();
    for (let r = it.next(); ; r = it.next()) {
      if (r.done) return r.value;
      if (performance.now() - t > sliceMs) {
        await yieldToBrowser();
        t = performance.now();
      }
    }
  }
  var chan = null;
  var waiters = [];
  function yieldToBrowser() {
    const s = globalThis.scheduler;
    if (s && typeof s.yield === "function") return s.yield();
    if (typeof MessageChannel === "undefined") return new Promise((res) => setTimeout(res, 0));
    if (!chan) {
      chan = new MessageChannel();
      chan.port1.onmessage = () => {
        var _a;
        return (_a = waiters.shift()) == null ? void 0 : _a();
      };
    }
    return new Promise((res) => {
      waiters.push(res);
      chan.port2.postMessage(0);
    });
  }
  function* walk(root, opt) {
    var _a, _b, _c, _d, _e;
    const attrs = (_a = opt.attrs) != null ? _a : DEFAULT_ATTRS;
    const ignoreSel = ["[data-sgc-ignore]", "[hidden]", opt.ignore].filter(Boolean).join(",");
    const anchorSel = (_b = opt.anchors) != null ? _b : DEFAULT_ANCHORS;
    const keyAttrs = (_c = opt.keyAttrs) != null ? _c : KEY_ATTRS;
    const flattenSel = opt.flatten || "";
    const visibleOnly = !!opt.visibleOnly;
    const frames = [];
    let frameDepth = 0;
    const nodes = [];
    const anchors = [], anchorHashes = [];
    const flat = [];
    let count = 0;
    const cellOut = /* @__PURE__ */ new Map();
    const spans = /* @__PURE__ */ new Map();
    function layoutRow(tr, kids) {
      const group = tr.parentElement;
      let pend = spans.get(group);
      if (!pend) spans.set(group, pend = []);
      const old = new Set(pend.filter((b) => b && b.left > 0));
      const out = [];
      let col = 0;
      const emitPending = () => {
        for (; ; ) {
          const b = pend[col];
          if (!b || !old.has(b) || b.left <= 0) return;
          if (b.start === col) out.push({ virt: b.cell });
          col += b.cs;
        }
      };
      for (const k of kids) {
        if (k.nodeType === 1 && (k.tagName === "TD" || k.tagName === "TH")) {
          emitPending();
          const cs = Math.max(1, k.colSpan || 1), rs = k.rowSpan === 0 ? 1e6 : Math.max(1, k.rowSpan || 1);
          if (rs > 1) {
            const b = { cell: k, left: rs - 1, cs, start: col };
            for (let c = col; c < col + cs; c++) pend[c] = b;
          } else for (let c = col; c < col + cs; c++) if (pend[c] && !old.has(pend[c])) pend[c] = void 0;
          else if (pend[c] && old.has(pend[c]) && pend[c].left <= 0) pend[c] = void 0;
          out.push(k);
          col += cs;
        } else out.push(k);
      }
      for (; col < pend.length; ) {
        const before = col;
        emitPending();
        if (col === before) col++;
      }
      for (const b of old) b.left--;
      return out;
    }
    function open(e, parent) {
      var _a2, _b2;
      const i = nodes.length;
      nodes.push(e);
      const n = e.localName;
      const out = { n, c: [], h: "", i };
      let sig = n;
      const a = {};
      let hasA = false;
      for (const name of attrs) {
        const v = e.getAttribute(name);
        if (v !== null) {
          a[name] = v;
          hasA = true;
          sig += `${name}=${v}`;
        }
      }
      const tag = e.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        const t = e.type;
        const v = t === "checkbox" || t === "radio" ? e.checked ? "on" : "off" : tag === "SELECT" ? Array.from((_a2 = e.selectedOptions) != null ? _a2 : [], (o) => o.text).join(", ") : (_b2 = e.value) != null ? _b2 : "";
        a.value = v;
        hasA = true;
        sig += `value=${v}`;
      }
      if (hasA) out.a = a;
      for (const ka of keyAttrs) {
        const k = e.getAttribute(ka);
        if (k) {
          out.k = k;
          sig += `${k}`;
          break;
        }
      }
      const rec = { n, p: parent, h: "" };
      if (hasA) rec.a = a;
      if (out.k) rec.k = out.k;
      flat[i] = rec;
      const ai = anchorSel && !frameDepth && e.matches(anchorSel) ? anchors.push(i) - 1 : -1;
      let kids = tag === "TEXTAREA" || tag === "SELECT" ? [] : Array.from(e.childNodes);
      let isFrame = false;
      if (tag === "IFRAME" || tag === "FRAME") {
        const body = opt.frames === false ? null : frameBody(e);
        kids = body ? Array.from(body.childNodes) : [];
        if (body) {
          frames.push(e);
          isFrame = true;
          frameDepth++;
        }
      } else if (e.hasAttribute("data-sgc-frame")) {
        isFrame = true;
        frameDepth++;
      }
      if (e.shadowRoot && e.shadowRoot.mode === "open") kids = kids.concat(Array.from(e.shadowRoot.children));
      if (tag === "TD" || tag === "TH") cellOut.set(e, out);
      else if (tag === "TR") kids = layoutRow(e, kids);
      return { out, sig, kids, x: 0, ai, rec, isFrame };
    }
    const rootEl = resolveRoot(root);
    const top = open(rootEl, -1);
    const stack = [top];
    while (stack.length) {
      const fr = stack[stack.length - 1];
      const f = (_d = fr.into) != null ? _d : fr;
      if (fr.x < fr.kids.length) {
        const ch = fr.kids[fr.x++];
        if (++count % 512 === 0) yield;
        if (ch.virt) {
          const o = cellOut.get(ch.virt);
          if (!o) continue;
          const vi = nodes.length;
          nodes.push(ch.virt);
          const vo = { n: o.n, c: o.c, h: o.h, i: vi, virt: 1 };
          if (o.a) vo.a = o.a;
          f.out.c.push(vo);
          flat[vi] = { ref: o.i, n: o.n, h: o.h, p: f.out.i, virt: 1, ...o.a ? { a: o.a } : {} };
          f.sig += "" + o.h;
          continue;
        }
        const t = ch.nodeType;
        if (t === 3) {
          const v = normText(ch.data);
          if (!v) continue;
          const ti = nodes.length;
          nodes.push(ch);
          const h2 = hashStr(v);
          f.out.c.push({ v, h: h2, i: ti });
          flat[ti] = { v, h: h2, p: f.out.i };
          f.sig += "" + h2;
        } else if (t === 1) {
          if (SKIP_TAGS.has(ch.tagName) || ignoreSel && ch.matches(ignoreSel)) continue;
          if (visibleOnly && ch.ownerDocument.defaultView.getComputedStyle(ch).display === "none") continue;
          if (flattenSel && ch.matches(flattenSel)) {
            stack.push({ into: f, kids: Array.from(ch.childNodes), x: 0 });
            continue;
          }
          const sub = open(ch, f.out.i);
          f.out.c.push(sub.out);
          stack.push(sub);
        }
        continue;
      }
      if (fr.into) {
        stack.pop();
        continue;
      }
      if (f.isFrame) frameDepth--;
      f.out.h = f.rec.h = hashStr(f.sig);
      if (f.ai >= 0) anchorHashes[f.ai] = f.out.h;
      stack.pop();
      if (stack.length) {
        const pf = stack[stack.length - 1];
        ((_e = pf.into) != null ? _e : pf).sig += "" + f.out.h;
      }
    }
    return { tree: top.out, nodes, anchors, anchorHashes, flat, frames };
  }
  function resolveRoot(src) {
    if (!src) throw new Error("[sg-compare] \uBE44\uAD50\uD560 \uD654\uBA74\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
    if (src.tagName === "IFRAME") {
      const d = src.contentDocument;
      if (!d) throw new Error("[sg-compare] iframe \uC548\uC744 \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4 (\uB2E4\uB978 \uB3C4\uBA54\uC778\uC774\uBA74 \uAC19\uC740 \uB3C4\uBA54\uC778 \uC8FC\uC18C\uB85C \uC5F4\uC5B4\uC57C \uD569\uB2C8\uB2E4)");
      return d.body;
    }
    if (src.nodeType === 9) return src.body;
    return src;
  }
  function locate(tree, raw) {
    let cur = tree, node = tree;
    let rest = [];
    for (let k = 0; k < raw.length; k++) {
      const seg = raw[k];
      const next = cur == null ? void 0 : cur[seg];
      if (next === void 0) {
        rest = raw.slice(k);
        break;
      }
      cur = next;
      if (cur && typeof cur === "object" && !Array.isArray(cur) && typeof cur.i === "number") {
        node = cur;
        rest = [];
      } else rest.push(seg);
    }
    return { node, rest };
  }

  // ../compare-core/src/path.js
  var esc = (s) => String(s).replace(/[\\[\]]/g, (m) => "\\" + m);
  function toPath(segs) {
    let out = "";
    for (const s of segs) {
      if ("i" in s) out += `[${esc(s.i)}]`;
      else out += (out ? "." : "") + s.k;
    }
    return out;
  }
  function toPattern(segs) {
    return segs.map((s) => "i" in s ? "*" : s.k).join(".");
  }
  function matchParts(pat, pi, parts, xi) {
    if (pi === pat.length) return xi === parts.length;
    const p = pat[pi];
    if (p === "**") {
      for (let k = xi; k <= parts.length; k++) if (matchParts(pat, pi + 1, parts, k)) return true;
      return false;
    }
    if (xi === parts.length) return false;
    if (p !== "*" && p !== parts[xi]) return false;
    return matchParts(pat, pi + 1, parts, xi + 1);
  }
  function makeMatcher(spec) {
    if (!spec) return () => void 0;
    const list = typeof spec === "string" ? [[spec, true]] : Array.isArray(spec) ? spec.map((p) => [p, true]) : Object.entries(spec);
    const rules = list.map(([p, v]) => [p.split("."), v]);
    const cache = /* @__PURE__ */ new Map();
    return (pattern) => {
      if (cache.has(pattern)) return cache.get(pattern);
      const parts = pattern === "" ? [] : pattern.split(".");
      let found;
      for (const [pat, v] of rules) {
        if (matchParts(pat, 0, parts, 0)) {
          found = v;
          break;
        }
      }
      cache.set(pattern, found);
      return found;
    };
  }
  function stableHash(v, skip) {
    return JSON.stringify(sortDeep(v, skip, []));
  }
  function sortDeep(v, skip, segs) {
    if (Array.isArray(v)) return v.map((x, i) => sortDeep(x, skip, [...segs, { i: String(i) }]));
    if (v && typeof v === "object") {
      const out = {};
      for (const k of Object.keys(v).sort()) {
        const next = [...segs, { k }];
        if (skip && skip(toPattern(next))) continue;
        out[k] = sortDeep(v[k], skip, next);
      }
      return out;
    }
    return v;
  }

  // ../compare-core/src/match.js
  var import_diff_match_patch = __toESM(require_diff_match_patch(), 1);
  var myers = new import_diff_match_patch.default();
  myers.Diff_Timeout = 0;
  function anchorsByMyers(hl, hr, pre, n, m) {
    const out = [];
    patience(hl, pre, n, hr, pre, m, out, 0);
    return out;
  }
  function patience(hl, a0, n, hr, b0, m, out, depth) {
    if (n <= 0 || m <= 0) return;
    let p = 0;
    while (p < n && p < m && hl[a0 + p] === hr[b0 + p]) {
      out.push([a0 + p, b0 + p]);
      p++;
    }
    let s = 0;
    while (s < n - p && s < m - p && hl[a0 + n - 1 - s] === hr[b0 + m - 1 - s]) s++;
    const tail = [];
    for (let k = s; k > 0; k--) tail.push([a0 + n - k, b0 + m - k]);
    a0 += p;
    b0 += p;
    n -= p + s;
    m -= p + s;
    if (n > 0 && m > 0) {
      if (n + m <= 3e3 || depth > 8) myersRange(hl, a0, n, hr, b0, m, out);
      else {
        const cnt = /* @__PURE__ */ new Map();
        for (let i = 0; i < n; i++) {
          const h2 = hl[a0 + i];
          const c = cnt.get(h2);
          if (c) {
            c.l++;
          } else cnt.set(h2, { l: 1, r: 0, li: a0 + i, ri: -1 });
        }
        for (let j = 0; j < m; j++) {
          const c = cnt.get(hr[b0 + j]);
          if (c) {
            c.r++;
            c.ri = b0 + j;
          }
        }
        const uniq = [];
        for (let i = 0; i < n; i++) {
          const c = cnt.get(hl[a0 + i]);
          if (c.l === 1 && c.r === 1) uniq.push(c);
        }
        const lis2 = longestIncreasing(uniq);
        if (!lis2.length) myersRange(hl, a0, n, hr, b0, m, out);
        else {
          let pa = a0, pb = b0;
          for (const u of lis2) {
            patience(hl, pa, u.li - pa, hr, pb, u.ri - pb, out, depth + 1);
            out.push([u.li, u.ri]);
            pa = u.li + 1;
            pb = u.ri + 1;
          }
          patience(hl, pa, a0 + n - pa, hr, pb, b0 + m - pb, out, depth + 1);
        }
      }
    }
    for (const t of tail) out.push(t);
  }
  function longestIncreasing(arr) {
    const tails = [], prev = new Int32Array(arr.length), idx = [];
    for (let k2 = 0; k2 < arr.length; k2++) {
      const v = arr[k2].ri;
      let lo = 0, hi = tails.length;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (arr[tails[mid]].ri < v) lo = mid + 1;
        else hi = mid;
      }
      prev[k2] = lo > 0 ? tails[lo - 1] : -1;
      tails[lo] = k2;
    }
    let k = tails.length ? tails[tails.length - 1] : -1;
    while (k >= 0) {
      idx.push(arr[k]);
      k = prev[k];
    }
    return idx.reverse();
  }
  function myersRange(hl, a0, n, hr, b0, m, out) {
    const code2 = /* @__PURE__ */ new Map();
    const enc = (h2) => {
      let c = code2.get(h2);
      if (c === void 0) {
        c = code2.size + 1;
        if (c >= 55296) c += 2048;
        code2.set(h2, c);
      }
      return c;
    };
    const a = [], b = [];
    for (let i2 = 0; i2 < n; i2++) a.push(enc(hl[a0 + i2]));
    for (let j2 = 0; j2 < m; j2++) b.push(enc(hr[b0 + j2]));
    if (code2.size > 63e3) return;
    const d = myers.diff_main(chunked(a), chunked(b), false);
    let i = 0, j = 0;
    for (const [op, t] of d) {
      if (op === 0) {
        for (let k = 0; k < t.length; k++) out.push([a0 + i + k, b0 + j + k]);
        i += t.length;
        j += t.length;
      } else if (op === -1) i += t.length;
      else j += t.length;
    }
  }
  function chunked(arr) {
    let s = "";
    for (let i = 0; i < arr.length; i += 8192) s += String.fromCharCode(...arr.slice(i, i + 8192));
    return s;
  }
  function alignSequences(hl, hr) {
    const pairs = matchKeyless(hl, hr, (x) => x);
    const out = [];
    for (const p of pairs) if (p.hasL && p.hasR && hl[p.li] === hr[p.ri]) out.push([p.li, p.ri]);
    return out;
  }
  function uniqueIds(arr, keyOf) {
    const seen = /* @__PURE__ */ new Map();
    return arr.map((item, idx) => {
      var _a, _b;
      const base = String((_a = keyOf(item, idx)) != null ? _a : "");
      const n = ((_b = seen.get(base)) != null ? _b : 0) + 1;
      seen.set(base, n);
      return n === 1 ? base : `${base}#${n}`;
    });
  }
  function matchKeyed(L, R, keyOf, detectMoves = true) {
    const lid = uniqueIds(L, keyOf);
    const rid = uniqueIds(R, keyOf);
    const lpos = new Map(lid.map((id, i) => [id, i]));
    const rset = new Set(rid);
    const moved = /* @__PURE__ */ new Set();
    if (detectMoves) {
      const common = rid.filter((id) => lpos.has(id));
      const keep = lis(common.map((id) => lpos.get(id)));
      common.forEach((id, i) => {
        if (!keep.has(i)) moved.add(id);
      });
    }
    const out = [];
    let li = 0;
    const flushLeftOnly = (until) => {
      while (li < L.length && lid[li] !== until) {
        if (!rset.has(lid[li])) out.push({ id: lid[li], hasL: true, hasR: false, l: L[li], r: void 0, li, ri: -1, moved: false });
        li++;
      }
      if (li < L.length && lid[li] === until) li++;
    };
    rid.forEach((id, ri) => {
      if (lpos.has(id)) {
        if (!moved.has(id)) flushLeftOnly(id);
        const i = lpos.get(id);
        out.push({ id, hasL: true, hasR: true, l: L[i], r: R[ri], li: i, ri, moved: moved.has(id) });
      } else {
        out.push({ id, hasL: false, hasR: true, l: void 0, r: R[ri], li: -1, ri, moved: false });
      }
    });
    flushLeftOnly(void 0);
    return out;
  }
  function lis(seq2) {
    var _a;
    const tails = [], prev = new Array(seq2.length), idxAt = [];
    seq2.forEach((v, i) => {
      let lo = 0, hi = tails.length;
      while (lo < hi) {
        const m = lo + hi >> 1;
        if (tails[m] < v) lo = m + 1;
        else hi = m;
      }
      tails[lo] = v;
      idxAt[lo] = i;
      prev[i] = lo > 0 ? idxAt[lo - 1] : -1;
    });
    const keep = /* @__PURE__ */ new Set();
    for (let i = (_a = idxAt[tails.length - 1]) != null ? _a : -1; i >= 0; i = prev[i]) keep.add(i);
    return keep;
  }
  var LCS_LIMIT = 4e6;
  function matchKeyless(L, R, hashOf, similar = null) {
    const hl = L.map((x, i) => hashOf(x, "l", i));
    const hr = R.map((x, i) => hashOf(x, "r", i));
    let pre = 0;
    while (pre < L.length && pre < R.length && hl[pre] === hr[pre]) pre++;
    let suf = 0;
    while (suf < L.length - pre && suf < R.length - pre && hl[L.length - 1 - suf] === hr[R.length - 1 - suf]) suf++;
    const n = L.length - pre - suf, m = R.length - pre - suf;
    const anchors = [];
    for (let i = 0; i < pre; i++) anchors.push([i, i]);
    const big = n > 0 && m > 0 && (n + 1) * (m + 1) > LCS_LIMIT ? anchorsByMyers(hl, hr, pre, n, m) : null;
    if (big) for (const x of big) anchors.push(x);
    else if (n > 0 && m > 0 && (n + 1) * (m + 1) <= LCS_LIMIT) {
      const W = m + 1, dp = new Uint32Array((n + 1) * W);
      for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
          dp[i * W + j] = hl[pre + i] === hr[pre + j] ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
        }
      }
      for (let i = 0, j = 0; i < n && j < m; ) {
        if (hl[pre + i] === hr[pre + j]) {
          anchors.push([pre + i, pre + j]);
          i++;
          j++;
        } else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++;
        else j++;
      }
    }
    for (let k = suf; k > 0; k--) anchors.push([L.length - k, R.length - k]);
    anchors.push([L.length, R.length]);
    const out = [];
    const add = (li, ri) => out.push({
      id: ri >= 0 ? `#${ri}` : `#~${li}`,
      hasL: li >= 0,
      hasR: ri >= 0,
      l: li >= 0 ? L[li] : void 0,
      r: ri >= 0 ? R[ri] : void 0,
      li,
      ri,
      moved: false
    });
    let pl = 0, pr = 0;
    for (const [al, ar] of anchors) {
      const gl = al - pl, gr = ar - pr;
      if (similar && gl > 0 && gr > 0 && gl * gr <= GAP_LIMIT) {
        for (const [a, b] of alignGap(L, R, pl, gl, pr, gr, similar)) add(a, b);
      } else {
        const both = Math.min(gl, gr);
        for (let k = 0; k < both; k++) add(pl + k, pr + k);
        for (let k = both; k < gl; k++) add(pl + k, -1);
        for (let k = both; k < gr; k++) add(-1, pr + k);
      }
      if (al < L.length) add(al, ar);
      pl = al + 1;
      pr = ar + 1;
    }
    return out;
  }
  var GAP_LIMIT = 25e4;
  var SIM_MIN = 0.5;
  function alignGap(L, R, pl, gl, pr, gr, similar) {
    const W = gr + 1;
    const sim = new Float64Array(gl * gr);
    for (let i2 = 0; i2 < gl; i2++) for (let j2 = 0; j2 < gr; j2++) {
      const s = Number(similar(L[pl + i2], R[pr + j2])) || 0;
      sim[i2 * gr + j2] = s >= SIM_MIN ? s : -1;
    }
    const dp = new Float64Array((gl + 1) * W);
    for (let i2 = gl - 1; i2 >= 0; i2--) for (let j2 = gr - 1; j2 >= 0; j2--) {
      const s = sim[i2 * gr + j2];
      dp[i2 * W + j2] = Math.max(dp[(i2 + 1) * W + j2], dp[i2 * W + j2 + 1], s >= 0 ? s + dp[(i2 + 1) * W + j2 + 1] : -1);
    }
    const out = [];
    let i = 0, j = 0;
    while (i < gl && j < gr) {
      const s = sim[i * gr + j];
      if (s >= 0 && dp[i * W + j] === s + dp[(i + 1) * W + j + 1]) {
        out.push([pl + i, pr + j]);
        i++;
        j++;
      } else if (dp[i * W + j] === dp[(i + 1) * W + j]) {
        out.push([pl + i, -1]);
        i++;
      } else {
        out.push([-1, pr + j]);
        j++;
      }
    }
    for (; i < gl; i++) out.push([pl + i, -1]);
    for (; j < gr; j++) out.push([-1, pr + j]);
    return out;
  }

  // ../compare-core/src/text.js
  var import_diff_match_patch2 = __toESM(require_diff_match_patch(), 1);
  var dmp = new import_diff_match_patch2.default();
  function textDiff(a, b, longMin = 20) {
    const d = dmp.diff_main(String(a), String(b));
    if (Math.max(String(a).length, String(b).length) >= longMin) dmp.diff_cleanupSemantic(d);
    else dmp.diff_cleanupEfficiency(d);
    return d.map(([op, t]) => [op, t]);
  }

  // ../compare-core/src/compare.js
  var isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  var hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  var AUTO_KEYS = ["id", "key", "uuid", "code"];
  var TITLE_FIELDS = ["title", "name", "label", "heading"];
  var RANK = { child: 1, moved: 2, modified: 3, added: 4, deleted: 4 };
  function compare(left, right, rules = {}) {
    const opt = { textMin: 20, detectMoves: true, numeric: false, whitespace: false, ...rules };
    const find = {
      keys: makeMatcher(opt.keys),
      ignore: makeMatcher(opt.ignore),
      titles: makeMatcher(opt.titles),
      labels: makeMatcher(opt.labels),
      equals: makeMatcher(opt.equals),
      similar: makeMatcher(opt.similar),
      identity: makeMatcher(opt.identity),
      units: makeMatcher(opt.countBy)
    };
    const ignored = (pat) => !!find.ignore(pat);
    const changes = [];
    const nodes = /* @__PURE__ */ new Map();
    const paths = /* @__PURE__ */ new WeakMap();
    const remember = (v, path) => {
      if (v && typeof v === "object") paths.set(v, path);
    };
    const itemIds = /* @__PURE__ */ new WeakMap();
    const setNode = (path, status, own) => {
      const cur = nodes.get(path);
      if (!cur || RANK[status] > RANK[cur.status] || own && !cur.own && RANK[status] >= RANK[cur.status]) nodes.set(path, { status, own });
    };
    function keyRule(pat, L, R) {
      const rule = find.keys(pat);
      if (rule === false) return null;
      if (typeof rule === "function") {
        const ok = [L, R].every((arr) => arr.every((x, i) => {
          const k = rule(x, i);
          return k !== null && k !== void 0;
        }));
        return ok ? rule : null;
      }
      if (typeof rule === "string" || Array.isArray(rule)) {
        const fields = Array.isArray(rule) ? rule : [rule];
        return (item, idx) => {
          if (!isObj(item)) return String(item);
          for (const f of fields) if (item[f] !== void 0 && item[f] !== null && item[f] !== "") return String(item[f]);
          return `#${idx}`;
        };
      }
      const all = [...L, ...R];
      if (!all.length || !all.every(isObj)) return null;
      for (const f of AUTO_KEYS) {
        const ok = [L, R].every((arr) => {
          const seen = /* @__PURE__ */ new Set();
          return arr.every((x) => x[f] !== void 0 && x[f] !== null && !seen.has(x[f]) && seen.add(x[f]));
        });
        if (ok) return (item) => String(item[f]);
      }
      return null;
    }
    function hashFn(itemPat) {
      const id = find.identity(itemPat);
      const full = (x) => stableHash(x, (p) => ignored(`${itemPat}${p ? "." + p : ""}`));
      if (typeof id !== "function") return full;
      return (x) => {
        const h2 = id(x);
        return h2 === void 0 || h2 === null ? full(x) : "id:" + h2;
      };
    }
    function similarFn(itemPat) {
      const rule = find.similar(itemPat);
      return typeof rule === "function" ? rule : null;
    }
    function titleOf(item, pat, id) {
      var _a;
      const rule = find.titles(pat);
      if (typeof rule === "function") return String((_a = rule(item)) != null ? _a : id);
      if (typeof rule === "string" && isObj(item) && item[rule] != null) return String(item[rule]);
      if (isObj(item)) {
        for (const f of TITLE_FIELDS) if (typeof item[f] === "string" && item[f]) return item[f];
      }
      return isObj(item) || Array.isArray(item) ? id : String(item);
    }
    function labelOf(pat, segs, fallback, change) {
      const rule = find.labels(pat);
      if (typeof rule === "function") return String(rule(change));
      if (typeof rule === "string") return rule;
      const last = segs[segs.length - 1];
      return fallback != null ? fallback : last ? "k" in last ? last.k : last.i : "";
    }
    function equalLeaf(a, b, pat) {
      const rule = find.equals(pat);
      if (typeof rule === "function") return !!rule(a, b);
      if (Object.is(a, b)) return true;
      if (opt.numeric && a !== "" && b !== "" && a !== null && b !== null && !isNaN(Number(a)) && !isNaN(Number(b))) return Number(a) === Number(b);
      if (opt.whitespace && typeof a === "string" && typeof b === "string") return a.trim().replace(/\s+/g, " ") === b.trim().replace(/\s+/g, " ");
      return false;
    }
    function registerTree(v, segs, status) {
      var _a;
      const path = toPath(segs);
      remember(v, path);
      setNode(path, status, false);
      const pat = toPattern(segs);
      if (Array.isArray(v)) {
        const keyOf = (_a = keyRule(pat, v, [])) != null ? _a : ((_x, i) => status === "deleted" ? `#~${i}` : `#${i}`);
        const ids = /* @__PURE__ */ new Map(), list = [];
        v.forEach((x, i) => {
          var _a2;
          let id = String(keyOf(x, i));
          const n = ((_a2 = ids.get(id)) != null ? _a2 : 0) + 1;
          ids.set(id, n);
          if (n > 1) id += `#${n}`;
          list.push(id);
          registerTree(x, [...segs, { i: id }], status);
        });
        itemIds.set(v, list);
      } else if (isObj(v)) {
        for (const k of Object.keys(v)) if (!ignored(toPattern([...segs, { k }]))) registerTree(v[k], [...segs, { k }], status);
      }
    }
    function visit(l, r, hasL, hasR, segs, crumbs, anc, lr, rr, gap) {
      const path = toPath(segs), pattern = toPattern(segs);
      const base = { path, pattern, crumbs: crumbs.slice(), ancestors: anc.map((a) => a.path), ancestorPatterns: anc.map((a) => a.pattern) };
      if (opt.raw) base.at = { left: hasL ? lr : null, right: hasR ? rr : null, ...gap ? { gap } : {} };
      const push = (c) => {
        const ch = { ...base, ...c };
        ch.label = labelOf(pattern, segs, c.label, ch);
        changes.push(ch);
        setNode(path, ch.type, true);
      };
      if (!hasL && !hasR) return void 0;
      if (!hasL) {
        registerTree(r, segs, "added");
        push({ type: "added", kind: kindOf(r), left: void 0, right: r, diffs: null });
        return r;
      }
      if (!hasR) {
        registerTree(l, segs, "deleted");
        push({ type: "deleted", kind: kindOf(l), left: l, right: void 0, diffs: null });
        return l;
      }
      remember(l, path);
      remember(r, path);
      const idf = find.identity(pattern);
      if (typeof idf === "function" && l && r && typeof l === "object" && typeof r === "object") {
        const a = idf(l);
        if (a !== void 0 && a !== null && a === idf(r)) return r;
      }
      if (Array.isArray(l) && Array.isArray(r)) {
        const keyOf = keyRule(pattern, l, r);
        const pairs = keyOf ? matchKeyed(l, r, keyOf, opt.detectMoves) : matchKeyless(l, r, hashFn(pattern ? `${pattern}.*` : "*"), similarFn(pattern ? `${pattern}.*` : "*"));
        const merged2 = [];
        const itemPat = pattern ? `${pattern}.*` : "*";
        const lIds = new Array(l.length), rIds = new Array(r.length), mIds = [];
        const nextR = new Array(pairs.length), nextL = new Array(pairs.length);
        if (opt.raw) {
          for (let k = pairs.length - 1, n = r.length; k >= 0; k--) {
            nextR[k] = n;
            if (pairs[k].hasR) n = pairs[k].ri;
          }
          for (let k = pairs.length - 1, n = l.length; k >= 0; k--) {
            nextL[k] = n;
            if (pairs[k].hasL && !pairs[k].moved) n = pairs[k].li;
          }
        }
        let pk = -1;
        for (const p of pairs) {
          pk++;
          if (p.hasL) lIds[p.li] = p.id;
          if (p.hasR) rIds[p.ri] = p.id;
          mIds.push(p.id);
          const item = p.hasR ? p.r : p.l;
          const seg = { i: p.id };
          const nextSegs = [...segs, seg];
          const title = titleOf(item, itemPat, p.id);
          const nextAnc = [...anc, { path, pattern }];
          if (p.moved) {
            const ipath = toPath(nextSegs);
            const mc = {
              path: ipath,
              pattern: itemPat,
              crumbs: [...crumbs, title],
              ancestors: nextAnc.map((a) => a.path),
              ancestorPatterns: nextAnc.map((a) => a.pattern),
              type: "moved",
              kind: "node",
              label: title,
              left: p.li + 1,
              right: p.ri + 1,
              diffs: null
            };
            if (opt.raw) mc.at = { left: [...lr, p.li], right: [...rr, p.ri] };
            changes.push(mc);
            setNode(ipath, "moved", true);
          }
          const m = visit(
            p.l,
            p.r,
            p.hasL,
            p.hasR,
            nextSegs,
            [...crumbs, title],
            nextAnc,
            opt.raw && p.hasL ? [...lr, p.li] : null,
            opt.raw && p.hasR ? [...rr, p.ri] : null,
            !opt.raw ? null : !p.hasR ? { side: "right", parent: rr, index: nextR[pk] } : !p.hasL ? { side: "left", parent: lr, index: nextL[pk] } : null
          );
          if (m && typeof m === "object") remember(m, toPath(nextSegs));
          merged2.push(m);
        }
        itemIds.set(l, lIds);
        itemIds.set(r, rIds);
        itemIds.set(merged2, mIds);
        return merged2;
      }
      if (isObj(l) && isObj(r)) {
        const merged2 = {};
        const keys = [...Object.keys(r), ...Object.keys(l).filter((k) => !hasOwn(r, k))];
        for (const k of keys) {
          const nextSegs = [...segs, { k }];
          if (ignored(toPattern(nextSegs))) {
            merged2[k] = hasOwn(r, k) ? r[k] : l[k];
            continue;
          }
          const m = visit(
            l[k],
            r[k],
            hasOwn(l, k),
            hasOwn(r, k),
            nextSegs,
            crumbs,
            [...anc, { path, pattern }],
            opt.raw ? [...lr, k] : null,
            opt.raw ? [...rr, k] : null,
            null
          );
          if (m && typeof m === "object") remember(m, toPath(nextSegs));
          merged2[k] = m;
        }
        return merged2;
      }
      if (equalLeaf(l, r, pattern)) return r;
      const prim = (v) => v === null || ["string", "number", "boolean"].includes(typeof v);
      const diffs = prim(l) && prim(r) && l !== null && r !== null ? textDiff(String(l), String(r), opt.textMin) : null;
      push({ type: "modified", kind: prim(l) && prim(r) ? "value" : "node", left: l, right: r, diffs });
      return r;
    }
    const merged = visit(left, right, left !== void 0, right !== void 0, [], [], [], [], [], null);
    for (const c of changes) for (const a of c.ancestors) setNode(a, "child", false);
    const result = {
      stats: countChanges(changes, find.units),
      changes,
      nodes: Object.fromEntries(nodes),
      merged,
      pathOf: (target, field) => {
        var _a;
        const p = typeof target === "string" ? target : paths.get(target);
        if (p === void 0) return null;
        if (field === void 0) return p;
        if (typeof field === "number") {
          const id = Array.isArray(target) ? (_a = itemIds.get(target)) == null ? void 0 : _a[field] : void 0;
          return id === void 0 ? null : `${p}[${String(id).replace(/[\\[\]]/g, (m) => "\\" + m)}]`;
        }
        return `${p}${p ? "." : ""}${field}`;
      },
      statusOf: (target, field) => {
        const p = result.pathOf(target, field);
        const n = p === null ? void 0 : nodes.get(p);
        return n ? n.status : null;
      },
      changesAt: (target, field) => {
        const p = result.pathOf(target, field);
        return p === null ? [] : changes.filter((c) => c.path === p);
      }
    };
    return result;
  }
  function kindOf(v) {
    return v !== null && typeof v === "object" ? "node" : "value";
  }
  function countChanges(changes, unitOf) {
    const stats = { added: 0, modified: 0, deleted: 0, moved: 0 };
    const units = /* @__PURE__ */ new Map();
    for (const c of changes) {
      let unit = c.path, isSelf = true;
      if (unitOf(c.pattern) === void 0) {
        unit = null;
        for (let i = c.ancestors.length - 1; i >= 0; i--) {
          if (unitOf(c.ancestorPatterns[i]) !== void 0) {
            unit = c.ancestors[i];
            isSelf = false;
            break;
          }
        }
        if (unit === null) {
          unit = c.path;
          isSelf = true;
        }
      }
      const t = isSelf ? c.type : "modified";
      const prev = units.get(unit);
      if (!prev || RANK[t] > RANK[prev]) units.set(unit, t);
    }
    for (const t of units.values()) stats[t]++;
    return stats;
  }

  // src/engine.js
  var bigramCache = /* @__PURE__ */ new WeakMap();
  var textCache = /* @__PURE__ */ new WeakMap();
  function textOf(n) {
    if (n.v !== void 0) return n.v;
    let t = textCache.get(n);
    if (t === void 0) {
      t = "";
      for (const c of n.c) {
        t += (t ? " " : "") + textOf(c);
        if (t.length > 2e3) break;
      }
      textCache.set(n, t);
    }
    return t;
  }
  function bigrams(n) {
    var _a;
    let b = bigramCache.get(n);
    if (!b) {
      const t = textOf(n).slice(0, 600);
      b = /* @__PURE__ */ new Map();
      for (let i = 0; i < t.length - 1; i++) {
        const g = t.substr(i, 2);
        b.set(g, ((_a = b.get(g)) != null ? _a : 0) + 1);
      }
      bigramCache.set(n, b);
    }
    return b;
  }
  function similarity(a, b) {
    const ta = a.v !== void 0, tb = b.v !== void 0;
    if (ta !== tb) return 0;
    if (!ta && a.n !== b.n) return 0;
    if (!ta && a.k && b.k) return a.k === b.k ? 1 : 0;
    const lead = !ta && a.c.length > 1 && b.c.length > 1 && a.c[0].h === b.c[0].h ? 0.75 : 0;
    const A = bigrams(a), B = bigrams(b);
    if (!A.size && !B.size) return ta ? a.v === b.v ? 1 : 0.55 : 0.75;
    if (!A.size || !B.size) return Math.max(lead, 0.55);
    let inter = 0, na = 0, nb = 0;
    for (const v of A.values()) na += v;
    for (const v of B.values()) nb += v;
    for (const [g, v] of A) {
      const w = B.get(g);
      if (w) inter += Math.min(v, w);
    }
    const dice = 2 * inter / (na + nb);
    const short = textOf(a).length <= 24 && textOf(b).length <= 24 ? 0.55 : 0;
    if (ta) return Math.max(dice, short);
    return Math.max(0.3 + 0.7 * dice, short, lead);
  }
  var DOM_RULES = {
    identity: { "**": (n) => n && typeof n === "object" && !Array.isArray(n) ? n.h : void 0 },
    ignore: ["**.h", "**.i", "**.k", "**.virt"],
    keys: { "**.c": (n) => n && n.k ? n.n + "#" + n.k : null },
    similar: { "**.c.*": similarity },
    raw: true,
    textMin: 12,
    detectMoves: true
  };
  function diffTrees(job) {
    var _a;
    const t0 = now();
    const r = compare(job.left, job.right, { ...DOM_RULES, ...(_a = job.options) != null ? _a : {} });
    const changes = r.changes.map((c) => ({
      type: c.type,
      kind: c.kind,
      path: c.path,
      at: c.at,
      diffs: c.diffs,
      // 덩어리 값은 화면 쪽에서 DOM 으로 다시 읽으므로 보내지 않는다 (큰 문서에서 전송량 절약)
      left: c.left !== null && typeof c.left === "object" ? null : c.left,
      right: c.right !== null && typeof c.right === "object" ? null : c.right
    }));
    const t1 = now();
    const pairs = job.leftAnchors && job.rightAnchors ? alignSequences(job.leftAnchors, job.rightAnchors) : [];
    const anchorPairs = new Int32Array(pairs.length * 2);
    pairs.forEach(([a, b], k) => {
      anchorPairs[2 * k] = a;
      anchorPairs[2 * k + 1] = b;
    });
    return { changes, stats: r.stats, anchorPairs, ms: { compare: t1 - t0, anchors: now() - t1 } };
  }
  function now() {
    return (typeof performance !== "undefined" ? performance : Date).now();
  }

  // blob-spawn:/home/user/silvergate-homepage/packages/compare-dom/src/spawn.js
  var code = '(()=>{var Ve=Object.create;var Ee=Object.defineProperty;var Ge=Object.getOwnPropertyDescriptor;var Je=Object.getOwnPropertyNames;var Xe=Object.getPrototypeOf,Ye=Object.prototype.hasOwnProperty;var Qe=(e,n)=>()=>{try{return n||e((n={exports:{}}).exports,n),n.exports}catch(t){throw n=0,t}};var Ze=(e,n,t,s)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of Je(n))!Ye.call(e,r)&&r!==t&&Ee(e,r,{get:()=>n[r],enumerable:!(s=Ge(n,r))||s.enumerable});return e};var Ie=(e,n,t)=>(t=e!=null?Ve(Xe(e)):{},Ze(n||!e||!e.__esModule?Ee(t,"default",{value:e,enumerable:!0}):t,e));var ce=Qe((gn,Z)=>{var d=function(){this.Diff_Timeout=1,this.Diff_EditCost=4,this.Match_Threshold=.5,this.Match_Distance=1e3,this.Patch_DeleteThreshold=.5,this.Patch_Margin=4,this.Match_MaxBits=32},O=-1,N=1,S=0;d.Diff=function(e,n){return[e,n]};d.prototype.diff_main=function(e,n,t,s){typeof s=="undefined"&&(this.Diff_Timeout<=0?s=Number.MAX_VALUE:s=new Date().getTime()+this.Diff_Timeout*1e3);var r=s;if(e==null||n==null)throw new Error("Null input. (diff_main)");if(e==n)return e?[new d.Diff(S,e)]:[];typeof t=="undefined"&&(t=!0);var i=t,a=this.diff_commonPrefix(e,n),f=e.substring(0,a);e=e.substring(a),n=n.substring(a),a=this.diff_commonSuffix(e,n);var o=e.substring(e.length-a);e=e.substring(0,e.length-a),n=n.substring(0,n.length-a);var l=this.diff_compute_(e,n,i,r);return f&&l.unshift(new d.Diff(S,f)),o&&l.push(new d.Diff(S,o)),this.diff_cleanupMerge(l),l};d.prototype.diff_compute_=function(e,n,t,s){var r;if(!e)return[new d.Diff(N,n)];if(!n)return[new d.Diff(O,e)];var i=e.length>n.length?e:n,a=e.length>n.length?n:e,f=i.indexOf(a);if(f!=-1)return r=[new d.Diff(N,i.substring(0,f)),new d.Diff(S,a),new d.Diff(N,i.substring(f+a.length))],e.length>n.length&&(r[0][0]=r[2][0]=O),r;if(a.length==1)return[new d.Diff(O,e),new d.Diff(N,n)];var o=this.diff_halfMatch_(e,n);if(o){var l=o[0],h=o[1],p=o[2],v=o[3],m=o[4],c=this.diff_main(l,p,t,s),b=this.diff_main(h,v,t,s);return c.concat([new d.Diff(S,m)],b)}return t&&e.length>100&&n.length>100?this.diff_lineMode_(e,n,s):this.diff_bisect_(e,n,s)};d.prototype.diff_lineMode_=function(e,n,t){var s=this.diff_linesToChars_(e,n);e=s.chars1,n=s.chars2;var r=s.lineArray,i=this.diff_main(e,n,!1,t);this.diff_charsToLines_(i,r),this.diff_cleanupSemantic(i),i.push(new d.Diff(S,""));for(var a=0,f=0,o=0,l="",h="";a<i.length;){switch(i[a][0]){case N:o++,h+=i[a][1];break;case O:f++,l+=i[a][1];break;case S:if(f>=1&&o>=1){i.splice(a-f-o,f+o),a=a-f-o;for(var p=this.diff_main(l,h,!1,t),v=p.length-1;v>=0;v--)i.splice(a,0,p[v]);a=a+p.length}o=0,f=0,l="",h="";break}a++}return i.pop(),i};d.prototype.diff_bisect_=function(e,n,t){for(var s=e.length,r=n.length,i=Math.ceil((s+r)/2),a=i,f=2*i,o=new Array(f),l=new Array(f),h=0;h<f;h++)o[h]=-1,l[h]=-1;o[a+1]=0,l[a+1]=0;for(var p=s-r,v=p%2!=0,m=0,c=0,b=0,w=0,y=0;y<i&&!(new Date().getTime()>t);y++){for(var A=-y+m;A<=y-c;A+=2){var k=a+A,E;A==-y||A!=y&&o[k-1]<o[k+1]?E=o[k+1]:E=o[k-1]+1;for(var T=E-A;E<s&&T<r&&e.charAt(E)==n.charAt(T);)E++,T++;if(o[k]=E,E>s)c+=2;else if(T>r)m+=2;else if(v){var u=a+p-A;if(u>=0&&u<f&&l[u]!=-1){var g=s-l[u];if(E>=g)return this.diff_bisectSplit_(e,n,E,T,t)}}}for(var M=-y+b;M<=y-w;M+=2){var u=a+M,g;M==-y||M!=y&&l[u-1]<l[u+1]?g=l[u+1]:g=l[u-1]+1;for(var _=g-M;g<s&&_<r&&e.charAt(s-g-1)==n.charAt(r-_-1);)g++,_++;if(l[u]=g,g>s)w+=2;else if(_>r)b+=2;else if(!v){var k=a+p-M;if(k>=0&&k<f&&o[k]!=-1){var E=o[k],T=a+E-k;if(g=s-g,E>=g)return this.diff_bisectSplit_(e,n,E,T,t)}}}}return[new d.Diff(O,e),new d.Diff(N,n)]};d.prototype.diff_bisectSplit_=function(e,n,t,s,r){var i=e.substring(0,t),a=n.substring(0,s),f=e.substring(t),o=n.substring(s),l=this.diff_main(i,a,!1,r),h=this.diff_main(f,o,!1,r);return l.concat(h)};d.prototype.diff_linesToChars_=function(e,n){var t=[],s={};t[0]="";function r(o){for(var l="",h=0,p=-1,v=t.length;p<o.length-1;){p=o.indexOf(`\n`,h),p==-1&&(p=o.length-1);var m=o.substring(h,p+1);(s.hasOwnProperty?s.hasOwnProperty(m):s[m]!==void 0)?l+=String.fromCharCode(s[m]):(v==i&&(m=o.substring(h),p=o.length),l+=String.fromCharCode(v),s[m]=v,t[v++]=m),h=p+1}return l}var i=4e4,a=r(e);i=65535;var f=r(n);return{chars1:a,chars2:f,lineArray:t}};d.prototype.diff_charsToLines_=function(e,n){for(var t=0;t<e.length;t++){for(var s=e[t][1],r=[],i=0;i<s.length;i++)r[i]=n[s.charCodeAt(i)];e[t][1]=r.join("")}};d.prototype.diff_commonPrefix=function(e,n){if(!e||!n||e.charAt(0)!=n.charAt(0))return 0;for(var t=0,s=Math.min(e.length,n.length),r=s,i=0;t<r;)e.substring(i,r)==n.substring(i,r)?(t=r,i=t):s=r,r=Math.floor((s-t)/2+t);return r};d.prototype.diff_commonSuffix=function(e,n){if(!e||!n||e.charAt(e.length-1)!=n.charAt(n.length-1))return 0;for(var t=0,s=Math.min(e.length,n.length),r=s,i=0;t<r;)e.substring(e.length-r,e.length-i)==n.substring(n.length-r,n.length-i)?(t=r,i=t):s=r,r=Math.floor((s-t)/2+t);return r};d.prototype.diff_commonOverlap_=function(e,n){var t=e.length,s=n.length;if(t==0||s==0)return 0;t>s?e=e.substring(t-s):t<s&&(n=n.substring(0,t));var r=Math.min(t,s);if(e==n)return r;for(var i=0,a=1;;){var f=e.substring(r-a),o=n.indexOf(f);if(o==-1)return i;a+=o,(o==0||e.substring(r-a)==n.substring(0,a))&&(i=a,a++)}};d.prototype.diff_halfMatch_=function(e,n){if(this.Diff_Timeout<=0)return null;var t=e.length>n.length?e:n,s=e.length>n.length?n:e;if(t.length<4||s.length*2<t.length)return null;var r=this;function i(c,b,w){for(var y=c.substring(w,w+Math.floor(c.length/4)),A=-1,k="",E,T,u,g;(A=b.indexOf(y,A+1))!=-1;){var M=r.diff_commonPrefix(c.substring(w),b.substring(A)),_=r.diff_commonSuffix(c.substring(0,w),b.substring(0,A));k.length<_+M&&(k=b.substring(A-_,A)+b.substring(A,A+M),E=c.substring(0,w-_),T=c.substring(w+M),u=b.substring(0,A-_),g=b.substring(A+M))}return k.length*2>=c.length?[E,T,u,g,k]:null}var a=i(t,s,Math.ceil(t.length/4)),f=i(t,s,Math.ceil(t.length/2)),o;if(!a&&!f)return null;f?a?o=a[4].length>f[4].length?a:f:o=f:o=a;var l,h,p,v;e.length>n.length?(l=o[0],h=o[1],p=o[2],v=o[3]):(p=o[0],v=o[1],l=o[2],h=o[3]);var m=o[4];return[l,h,p,v,m]};d.prototype.diff_cleanupSemantic=function(e){for(var n=!1,t=[],s=0,r=null,i=0,a=0,f=0,o=0,l=0;i<e.length;)e[i][0]==S?(t[s++]=i,a=o,f=l,o=0,l=0,r=e[i][1]):(e[i][0]==N?o+=e[i][1].length:l+=e[i][1].length,r&&r.length<=Math.max(a,f)&&r.length<=Math.max(o,l)&&(e.splice(t[s-1],0,new d.Diff(O,r)),e[t[s-1]+1][0]=N,s--,s--,i=s>0?t[s-1]:-1,a=0,f=0,o=0,l=0,r=null,n=!0)),i++;for(n&&this.diff_cleanupMerge(e),this.diff_cleanupSemanticLossless(e),i=1;i<e.length;){if(e[i-1][0]==O&&e[i][0]==N){var h=e[i-1][1],p=e[i][1],v=this.diff_commonOverlap_(h,p),m=this.diff_commonOverlap_(p,h);v>=m?(v>=h.length/2||v>=p.length/2)&&(e.splice(i,0,new d.Diff(S,p.substring(0,v))),e[i-1][1]=h.substring(0,h.length-v),e[i+1][1]=p.substring(v),i++):(m>=h.length/2||m>=p.length/2)&&(e.splice(i,0,new d.Diff(S,h.substring(0,m))),e[i-1][0]=N,e[i-1][1]=p.substring(0,p.length-m),e[i+1][0]=O,e[i+1][1]=h.substring(m),i++),i++}i++}};d.prototype.diff_cleanupSemanticLossless=function(e){function n(m,c){if(!m||!c)return 6;var b=m.charAt(m.length-1),w=c.charAt(0),y=b.match(d.nonAlphaNumericRegex_),A=w.match(d.nonAlphaNumericRegex_),k=y&&b.match(d.whitespaceRegex_),E=A&&w.match(d.whitespaceRegex_),T=k&&b.match(d.linebreakRegex_),u=E&&w.match(d.linebreakRegex_),g=T&&m.match(d.blanklineEndRegex_),M=u&&c.match(d.blanklineStartRegex_);return g||M?5:T||u?4:y&&!k&&E?3:k||E?2:y||A?1:0}for(var t=1;t<e.length-1;){if(e[t-1][0]==S&&e[t+1][0]==S){var s=e[t-1][1],r=e[t][1],i=e[t+1][1],a=this.diff_commonSuffix(s,r);if(a){var f=r.substring(r.length-a);s=s.substring(0,s.length-a),r=f+r.substring(0,r.length-a),i=f+i}for(var o=s,l=r,h=i,p=n(s,r)+n(r,i);r.charAt(0)===i.charAt(0);){s+=r.charAt(0),r=r.substring(1)+i.charAt(0),i=i.substring(1);var v=n(s,r)+n(r,i);v>=p&&(p=v,o=s,l=r,h=i)}e[t-1][1]!=o&&(o?e[t-1][1]=o:(e.splice(t-1,1),t--),e[t][1]=l,h?e[t+1][1]=h:(e.splice(t+1,1),t--))}t++}};d.nonAlphaNumericRegex_=/[^a-zA-Z0-9]/;d.whitespaceRegex_=/\\s/;d.linebreakRegex_=/[\\r\\n]/;d.blanklineEndRegex_=/\\n\\r?\\n$/;d.blanklineStartRegex_=/^\\r?\\n\\r?\\n/;d.prototype.diff_cleanupEfficiency=function(e){for(var n=!1,t=[],s=0,r=null,i=0,a=!1,f=!1,o=!1,l=!1;i<e.length;)e[i][0]==S?(e[i][1].length<this.Diff_EditCost&&(o||l)?(t[s++]=i,a=o,f=l,r=e[i][1]):(s=0,r=null),o=l=!1):(e[i][0]==O?l=!0:o=!0,r&&(a&&f&&o&&l||r.length<this.Diff_EditCost/2&&a+f+o+l==3)&&(e.splice(t[s-1],0,new d.Diff(O,r)),e[t[s-1]+1][0]=N,s--,r=null,a&&f?(o=l=!0,s=0):(s--,i=s>0?t[s-1]:-1,o=l=!1),n=!0)),i++;n&&this.diff_cleanupMerge(e)};d.prototype.diff_cleanupMerge=function(e){e.push(new d.Diff(S,""));for(var n=0,t=0,s=0,r="",i="",a;n<e.length;)switch(e[n][0]){case N:s++,i+=e[n][1],n++;break;case O:t++,r+=e[n][1],n++;break;case S:t+s>1?(t!==0&&s!==0&&(a=this.diff_commonPrefix(i,r),a!==0&&(n-t-s>0&&e[n-t-s-1][0]==S?e[n-t-s-1][1]+=i.substring(0,a):(e.splice(0,0,new d.Diff(S,i.substring(0,a))),n++),i=i.substring(a),r=r.substring(a)),a=this.diff_commonSuffix(i,r),a!==0&&(e[n][1]=i.substring(i.length-a)+e[n][1],i=i.substring(0,i.length-a),r=r.substring(0,r.length-a))),n-=t+s,e.splice(n,t+s),r.length&&(e.splice(n,0,new d.Diff(O,r)),n++),i.length&&(e.splice(n,0,new d.Diff(N,i)),n++),n++):n!==0&&e[n-1][0]==S?(e[n-1][1]+=e[n][1],e.splice(n,1)):n++,s=0,t=0,r="",i="";break}e[e.length-1][1]===""&&e.pop();var f=!1;for(n=1;n<e.length-1;)e[n-1][0]==S&&e[n+1][0]==S&&(e[n][1].substring(e[n][1].length-e[n-1][1].length)==e[n-1][1]?(e[n][1]=e[n-1][1]+e[n][1].substring(0,e[n][1].length-e[n-1][1].length),e[n+1][1]=e[n-1][1]+e[n+1][1],e.splice(n-1,1),f=!0):e[n][1].substring(0,e[n+1][1].length)==e[n+1][1]&&(e[n-1][1]+=e[n+1][1],e[n][1]=e[n][1].substring(e[n+1][1].length)+e[n+1][1],e.splice(n+1,1),f=!0)),n++;f&&this.diff_cleanupMerge(e)};d.prototype.diff_xIndex=function(e,n){var t=0,s=0,r=0,i=0,a;for(a=0;a<e.length&&(e[a][0]!==N&&(t+=e[a][1].length),e[a][0]!==O&&(s+=e[a][1].length),!(t>n));a++)r=t,i=s;return e.length!=a&&e[a][0]===O?i:i+(n-r)};d.prototype.diff_prettyHtml=function(e){for(var n=[],t=/&/g,s=/</g,r=/>/g,i=/\\n/g,a=0;a<e.length;a++){var f=e[a][0],o=e[a][1],l=o.replace(t,"&amp;").replace(s,"&lt;").replace(r,"&gt;").replace(i,"&para;<br>");switch(f){case N:n[a]=\'<ins style="background:#e6ffe6;">\'+l+"</ins>";break;case O:n[a]=\'<del style="background:#ffe6e6;">\'+l+"</del>";break;case S:n[a]="<span>"+l+"</span>";break}}return n.join("")};d.prototype.diff_text1=function(e){for(var n=[],t=0;t<e.length;t++)e[t][0]!==N&&(n[t]=e[t][1]);return n.join("")};d.prototype.diff_text2=function(e){for(var n=[],t=0;t<e.length;t++)e[t][0]!==O&&(n[t]=e[t][1]);return n.join("")};d.prototype.diff_levenshtein=function(e){for(var n=0,t=0,s=0,r=0;r<e.length;r++){var i=e[r][0],a=e[r][1];switch(i){case N:t+=a.length;break;case O:s+=a.length;break;case S:n+=Math.max(t,s),t=0,s=0;break}}return n+=Math.max(t,s),n};d.prototype.diff_toDelta=function(e){for(var n=[],t=0;t<e.length;t++)switch(e[t][0]){case N:n[t]="+"+encodeURI(e[t][1]);break;case O:n[t]="-"+e[t][1].length;break;case S:n[t]="="+e[t][1].length;break}return n.join("	").replace(/%20/g," ")};d.prototype.diff_fromDelta=function(e,n){for(var t=[],s=0,r=0,i=n.split(/\\t/g),a=0;a<i.length;a++){var f=i[a].substring(1);switch(i[a].charAt(0)){case"+":try{t[s++]=new d.Diff(N,decodeURI(f))}catch{throw new Error("Illegal escape in diff_fromDelta: "+f)}break;case"-":case"=":var o=parseInt(f,10);if(isNaN(o)||o<0)throw new Error("Invalid number in diff_fromDelta: "+f);var l=e.substring(r,r+=o);i[a].charAt(0)=="="?t[s++]=new d.Diff(S,l):t[s++]=new d.Diff(O,l);break;default:if(i[a])throw new Error("Invalid diff operation in diff_fromDelta: "+i[a])}}if(r!=e.length)throw new Error("Delta length ("+r+") does not equal source text length ("+e.length+").");return t};d.prototype.match_main=function(e,n,t){if(e==null||n==null||t==null)throw new Error("Null input. (match_main)");return t=Math.max(0,Math.min(t,e.length)),e==n?0:e.length?e.substring(t,t+n.length)==n?t:this.match_bitap_(e,n,t):-1};d.prototype.match_bitap_=function(e,n,t){if(n.length>this.Match_MaxBits)throw new Error("Pattern too long for this browser.");var s=this.match_alphabet_(n),r=this;function i(E,T){var u=E/n.length,g=Math.abs(t-T);return r.Match_Distance?u+g/r.Match_Distance:g?1:u}var a=this.Match_Threshold,f=e.indexOf(n,t);f!=-1&&(a=Math.min(i(0,f),a),f=e.lastIndexOf(n,t+n.length),f!=-1&&(a=Math.min(i(0,f),a)));var o=1<<n.length-1;f=-1;for(var l,h,p=n.length+e.length,v,m=0;m<n.length;m++){for(l=0,h=p;l<h;)i(m,t+h)<=a?l=h:p=h,h=Math.floor((p-l)/2+l);p=h;var c=Math.max(1,t-h+1),b=Math.min(t+h,e.length)+n.length,w=Array(b+2);w[b+1]=(1<<m)-1;for(var y=b;y>=c;y--){var A=s[e.charAt(y-1)];if(m===0?w[y]=(w[y+1]<<1|1)&A:w[y]=(w[y+1]<<1|1)&A|((v[y+1]|v[y])<<1|1)|v[y+1],w[y]&o){var k=i(m,y-1);if(k<=a)if(a=k,f=y-1,f>t)c=Math.max(1,2*t-f);else break}}if(i(m+1,t)>a)break;v=w}return f};d.prototype.match_alphabet_=function(e){for(var n={},t=0;t<e.length;t++)n[e.charAt(t)]=0;for(var t=0;t<e.length;t++)n[e.charAt(t)]|=1<<e.length-t-1;return n};d.prototype.patch_addContext_=function(e,n){if(n.length!=0){if(e.start2===null)throw Error("patch not initialized");for(var t=n.substring(e.start2,e.start2+e.length1),s=0;n.indexOf(t)!=n.lastIndexOf(t)&&t.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)s+=this.Patch_Margin,t=n.substring(e.start2-s,e.start2+e.length1+s);s+=this.Patch_Margin;var r=n.substring(e.start2-s,e.start2);r&&e.diffs.unshift(new d.Diff(S,r));var i=n.substring(e.start2+e.length1,e.start2+e.length1+s);i&&e.diffs.push(new d.Diff(S,i)),e.start1-=r.length,e.start2-=r.length,e.length1+=r.length+i.length,e.length2+=r.length+i.length}};d.prototype.patch_make=function(e,n,t){var s,r;if(typeof e=="string"&&typeof n=="string"&&typeof t=="undefined")s=e,r=this.diff_main(s,n,!0),r.length>2&&(this.diff_cleanupSemantic(r),this.diff_cleanupEfficiency(r));else if(e&&typeof e=="object"&&typeof n=="undefined"&&typeof t=="undefined")r=e,s=this.diff_text1(r);else if(typeof e=="string"&&n&&typeof n=="object"&&typeof t=="undefined")s=e,r=n;else if(typeof e=="string"&&typeof n=="string"&&t&&typeof t=="object")s=e,r=t;else throw new Error("Unknown call format to patch_make.");if(r.length===0)return[];for(var i=[],a=new d.patch_obj,f=0,o=0,l=0,h=s,p=s,v=0;v<r.length;v++){var m=r[v][0],c=r[v][1];switch(!f&&m!==S&&(a.start1=o,a.start2=l),m){case N:a.diffs[f++]=r[v],a.length2+=c.length,p=p.substring(0,l)+c+p.substring(l);break;case O:a.length1+=c.length,a.diffs[f++]=r[v],p=p.substring(0,l)+p.substring(l+c.length);break;case S:c.length<=2*this.Patch_Margin&&f&&r.length!=v+1?(a.diffs[f++]=r[v],a.length1+=c.length,a.length2+=c.length):c.length>=2*this.Patch_Margin&&f&&(this.patch_addContext_(a,h),i.push(a),a=new d.patch_obj,f=0,h=p,o=l);break}m!==N&&(o+=c.length),m!==O&&(l+=c.length)}return f&&(this.patch_addContext_(a,h),i.push(a)),i};d.prototype.patch_deepCopy=function(e){for(var n=[],t=0;t<e.length;t++){var s=e[t],r=new d.patch_obj;r.diffs=[];for(var i=0;i<s.diffs.length;i++)r.diffs[i]=new d.Diff(s.diffs[i][0],s.diffs[i][1]);r.start1=s.start1,r.start2=s.start2,r.length1=s.length1,r.length2=s.length2,n[t]=r}return n};d.prototype.patch_apply=function(e,n){if(e.length==0)return[n,[]];e=this.patch_deepCopy(e);var t=this.patch_addPadding(e);n=t+n+t,this.patch_splitMax(e);for(var s=0,r=[],i=0;i<e.length;i++){var a=e[i].start2+s,f=this.diff_text1(e[i].diffs),o,l=-1;if(f.length>this.Match_MaxBits?(o=this.match_main(n,f.substring(0,this.Match_MaxBits),a),o!=-1&&(l=this.match_main(n,f.substring(f.length-this.Match_MaxBits),a+f.length-this.Match_MaxBits),(l==-1||o>=l)&&(o=-1))):o=this.match_main(n,f,a),o==-1)r[i]=!1,s-=e[i].length2-e[i].length1;else{r[i]=!0,s=o-a;var h;if(l==-1?h=n.substring(o,o+f.length):h=n.substring(o,l+this.Match_MaxBits),f==h)n=n.substring(0,o)+this.diff_text2(e[i].diffs)+n.substring(o+f.length);else{var p=this.diff_main(f,h,!1);if(f.length>this.Match_MaxBits&&this.diff_levenshtein(p)/f.length>this.Patch_DeleteThreshold)r[i]=!1;else{this.diff_cleanupSemanticLossless(p);for(var v=0,m,c=0;c<e[i].diffs.length;c++){var b=e[i].diffs[c];b[0]!==S&&(m=this.diff_xIndex(p,v)),b[0]===N?n=n.substring(0,o+m)+b[1]+n.substring(o+m):b[0]===O&&(n=n.substring(0,o+m)+n.substring(o+this.diff_xIndex(p,v+b[1].length))),b[0]!==O&&(v+=b[1].length)}}}}}return n=n.substring(t.length,n.length-t.length),[n,r]};d.prototype.patch_addPadding=function(e){for(var n=this.Patch_Margin,t="",s=1;s<=n;s++)t+=String.fromCharCode(s);for(var s=0;s<e.length;s++)e[s].start1+=n,e[s].start2+=n;var r=e[0],i=r.diffs;if(i.length==0||i[0][0]!=S)i.unshift(new d.Diff(S,t)),r.start1-=n,r.start2-=n,r.length1+=n,r.length2+=n;else if(n>i[0][1].length){var a=n-i[0][1].length;i[0][1]=t.substring(i[0][1].length)+i[0][1],r.start1-=a,r.start2-=a,r.length1+=a,r.length2+=a}if(r=e[e.length-1],i=r.diffs,i.length==0||i[i.length-1][0]!=S)i.push(new d.Diff(S,t)),r.length1+=n,r.length2+=n;else if(n>i[i.length-1][1].length){var a=n-i[i.length-1][1].length;i[i.length-1][1]+=t.substring(0,a),r.length1+=a,r.length2+=a}return t};d.prototype.patch_splitMax=function(e){for(var n=this.Match_MaxBits,t=0;t<e.length;t++)if(!(e[t].length1<=n)){var s=e[t];e.splice(t--,1);for(var r=s.start1,i=s.start2,a="";s.diffs.length!==0;){var f=new d.patch_obj,o=!0;for(f.start1=r-a.length,f.start2=i-a.length,a!==""&&(f.length1=f.length2=a.length,f.diffs.push(new d.Diff(S,a)));s.diffs.length!==0&&f.length1<n-this.Patch_Margin;){var l=s.diffs[0][0],h=s.diffs[0][1];l===N?(f.length2+=h.length,i+=h.length,f.diffs.push(s.diffs.shift()),o=!1):l===O&&f.diffs.length==1&&f.diffs[0][0]==S&&h.length>2*n?(f.length1+=h.length,r+=h.length,o=!1,f.diffs.push(new d.Diff(l,h)),s.diffs.shift()):(h=h.substring(0,n-f.length1-this.Patch_Margin),f.length1+=h.length,r+=h.length,l===S?(f.length2+=h.length,i+=h.length):o=!1,f.diffs.push(new d.Diff(l,h)),h==s.diffs[0][1]?s.diffs.shift():s.diffs[0][1]=s.diffs[0][1].substring(h.length))}a=this.diff_text2(f.diffs),a=a.substring(a.length-this.Patch_Margin);var p=this.diff_text1(s.diffs).substring(0,this.Patch_Margin);p!==""&&(f.length1+=p.length,f.length2+=p.length,f.diffs.length!==0&&f.diffs[f.diffs.length-1][0]===S?f.diffs[f.diffs.length-1][1]+=p:f.diffs.push(new d.Diff(S,p))),o||e.splice(++t,0,f)}}};d.prototype.patch_toText=function(e){for(var n=[],t=0;t<e.length;t++)n[t]=e[t];return n.join("")};d.prototype.patch_fromText=function(e){var n=[];if(!e)return n;for(var t=e.split(`\n`),s=0,r=/^@@ -(\\d+),?(\\d*) \\+(\\d+),?(\\d*) @@$/;s<t.length;){var i=t[s].match(r);if(!i)throw new Error("Invalid patch string: "+t[s]);var a=new d.patch_obj;for(n.push(a),a.start1=parseInt(i[1],10),i[2]===""?(a.start1--,a.length1=1):i[2]=="0"?a.length1=0:(a.start1--,a.length1=parseInt(i[2],10)),a.start2=parseInt(i[3],10),i[4]===""?(a.start2--,a.length2=1):i[4]=="0"?a.length2=0:(a.start2--,a.length2=parseInt(i[4],10)),s++;s<t.length;){var f=t[s].charAt(0);try{var o=decodeURI(t[s].substring(1))}catch{throw new Error("Illegal escape in patch_fromText: "+o)}if(f=="-")a.diffs.push(new d.Diff(O,o));else if(f=="+")a.diffs.push(new d.Diff(N,o));else if(f==" ")a.diffs.push(new d.Diff(S,o));else{if(f=="@")break;if(f!=="")throw new Error(\'Invalid patch mode "\'+f+\'" in: \'+o)}s++}}return n};d.patch_obj=function(){this.diffs=[],this.start1=null,this.start2=null,this.length1=0,this.length2=0};d.patch_obj.prototype.toString=function(){var e,n;this.length1===0?e=this.start1+",0":this.length1==1?e=this.start1+1:e=this.start1+1+","+this.length1,this.length2===0?n=this.start2+",0":this.length2==1?n=this.start2+1:n=this.start2+1+","+this.length2;for(var t=["@@ -"+e+" +"+n+` @@\n`],s,r=0;r<this.diffs.length;r++){switch(this.diffs[r][0]){case N:s="+";break;case O:s="-";break;case S:s=" ";break}t[r+1]=s+encodeURI(this.diffs[r][1])+`\n`}return t.join("").replace(/%20/g," ")};Z.exports=d;Z.exports.diff_match_patch=d;Z.exports.DIFF_DELETE=O;Z.exports.DIFF_INSERT=N;Z.exports.DIFF_EQUAL=S});var qe=e=>String(e).replace(/[\\\\[\\]]/g,n=>"\\\\"+n);function G(e){let n="";for(let t of e)"i"in t?n+=`[${qe(t.i)}]`:n+=(n?".":"")+t.k;return n}function J(e){return e.map(n=>"i"in n?"*":n.k).join(".")}function he(e,n,t,s){if(n===e.length)return s===t.length;let r=e[n];if(r==="**"){for(let i=s;i<=t.length;i++)if(he(e,n+1,t,i))return!0;return!1}return s===t.length||r!=="*"&&r!==t[s]?!1:he(e,n+1,t,s+1)}function z(e){if(!e)return()=>{};let t=(typeof e=="string"?[[e,!0]]:Array.isArray(e)?e.map(r=>[r,!0]):Object.entries(e)).map(([r,i])=>[r.split("."),i]),s=new Map;return r=>{if(s.has(r))return s.get(r);let i=r===""?[]:r.split("."),a;for(let[f,o]of t)if(he(f,0,i,0)){a=o;break}return s.set(r,a),a}}function Pe(e,n){return JSON.stringify(ue(e,n,[]))}function ue(e,n,t){if(Array.isArray(e))return e.map((s,r)=>ue(s,n,[...t,{i:String(r)}]));if(e&&typeof e=="object"){let s={};for(let r of Object.keys(e).sort()){let i=[...t,{k:r}];n&&n(J(i))||(s[r]=ue(e[r],n,i))}return s}return e}var Ce=Ie(ce(),1),$e=new Ce.default;$e.Diff_Timeout=0;function xe(e,n,t,s,r){let i=[];return ge(e,t,s,n,t,r,i,0),i}function ge(e,n,t,s,r,i,a,f){if(t<=0||i<=0)return;let o=0;for(;o<t&&o<i&&e[n+o]===s[r+o];)a.push([n+o,r+o]),o++;let l=0;for(;l<t-o&&l<i-o&&e[n+t-1-l]===s[r+i-1-l];)l++;let h=[];for(let p=l;p>0;p--)h.push([n+t-p,r+i-p]);if(n+=o,r+=o,t-=o+l,i-=o+l,t>0&&i>0)if(t+i<=3e3||f>8)Oe(e,n,t,s,r,i,a);else{let p=new Map;for(let c=0;c<t;c++){let b=e[n+c],w=p.get(b);w?w.l++:p.set(b,{l:1,r:0,li:n+c,ri:-1})}for(let c=0;c<i;c++){let b=p.get(s[r+c]);b&&(b.r++,b.ri=r+c)}let v=[];for(let c=0;c<t;c++){let b=p.get(e[n+c]);b.l===1&&b.r===1&&v.push(b)}let m=en(v);if(!m.length)Oe(e,n,t,s,r,i,a);else{let c=n,b=r;for(let w of m)ge(e,c,w.li-c,s,b,w.ri-b,a,f+1),a.push([w.li,w.ri]),c=w.li+1,b=w.ri+1;ge(e,c,n+t-c,s,b,r+i-b,a,f+1)}}for(let p of h)a.push(p)}function en(e){let n=[],t=new Int32Array(e.length),s=[];for(let i=0;i<e.length;i++){let a=e[i].ri,f=0,o=n.length;for(;f<o;){let l=f+o>>1;e[n[l]].ri<a?f=l+1:o=l}t[i]=f>0?n[f-1]:-1,n[f]=i}let r=n.length?n[n.length-1]:-1;for(;r>=0;)s.push(e[r]),r=t[r];return s.reverse()}function Oe(e,n,t,s,r,i,a){let f=new Map,o=c=>{let b=f.get(c);return b===void 0&&(b=f.size+1,b>=55296&&(b+=2048),f.set(c,b)),b},l=[],h=[];for(let c=0;c<t;c++)l.push(o(e[n+c]));for(let c=0;c<i;c++)h.push(o(s[r+c]));if(f.size>63e3)return;let p=$e.diff_main(Ne(l),Ne(h),!1),v=0,m=0;for(let[c,b]of p)if(c===0){for(let w=0;w<b.length;w++)a.push([n+v+w,r+m+w]);v+=b.length,m+=b.length}else c===-1?v+=b.length:m+=b.length}function Ne(e){let n="";for(let t=0;t<e.length;t+=8192)n+=String.fromCharCode(...e.slice(t,t+8192));return n}function pe(e,n){let t=ve(e,n,r=>r),s=[];for(let r of t)r.hasL&&r.hasR&&e[r.li]===n[r.ri]&&s.push([r.li,r.ri]);return s}function Re(e,n){let t=new Map;return e.map((s,r)=>{var f,o;let i=String((f=n(s,r))!=null?f:""),a=((o=t.get(i))!=null?o:0)+1;return t.set(i,a),a===1?i:`${i}#${a}`})}function Fe(e,n,t,s=!0){let r=Re(e,t),i=Re(n,t),a=new Map(r.map((v,m)=>[v,m])),f=new Set(i),o=new Set;if(s){let v=i.filter(c=>a.has(c)),m=nn(v.map(c=>a.get(c)));v.forEach((c,b)=>{m.has(b)||o.add(c)})}let l=[],h=0,p=v=>{for(;h<e.length&&r[h]!==v;)f.has(r[h])||l.push({id:r[h],hasL:!0,hasR:!1,l:e[h],r:void 0,li:h,ri:-1,moved:!1}),h++;h<e.length&&r[h]===v&&h++};return i.forEach((v,m)=>{if(a.has(v)){o.has(v)||p(v);let c=a.get(v);l.push({id:v,hasL:!0,hasR:!0,l:e[c],r:n[m],li:c,ri:m,moved:o.has(v)})}else l.push({id:v,hasL:!1,hasR:!0,l:void 0,r:n[m],li:-1,ri:m,moved:!1})}),p(void 0),l}function nn(e){var i;let n=[],t=new Array(e.length),s=[];e.forEach((a,f)=>{let o=0,l=n.length;for(;o<l;){let h=o+l>>1;n[h]<a?o=h+1:l=h}n[o]=a,s[o]=f,t[f]=o>0?s[o-1]:-1});let r=new Set;for(let a=(i=s[n.length-1])!=null?i:-1;a>=0;a=t[a])r.add(a);return r}var je=4e6;function ve(e,n,t,s=null){let r=e.map((w,y)=>t(w,"l",y)),i=n.map((w,y)=>t(w,"r",y)),a=0;for(;a<e.length&&a<n.length&&r[a]===i[a];)a++;let f=0;for(;f<e.length-a&&f<n.length-a&&r[e.length-1-f]===i[n.length-1-f];)f++;let o=e.length-a-f,l=n.length-a-f,h=[];for(let w=0;w<a;w++)h.push([w,w]);let p=o>0&&l>0&&(o+1)*(l+1)>je?xe(r,i,a,o,l):null;if(p)for(let w of p)h.push(w);else if(o>0&&l>0&&(o+1)*(l+1)<=je){let w=l+1,y=new Uint32Array((o+1)*w);for(let A=o-1;A>=0;A--)for(let k=l-1;k>=0;k--)y[A*w+k]=r[a+A]===i[a+k]?y[(A+1)*w+k+1]+1:Math.max(y[(A+1)*w+k],y[A*w+k+1]);for(let A=0,k=0;A<o&&k<l;)r[a+A]===i[a+k]?(h.push([a+A,a+k]),A++,k++):y[(A+1)*w+k]>=y[A*w+k+1]?A++:k++}for(let w=f;w>0;w--)h.push([e.length-w,n.length-w]);h.push([e.length,n.length]);let v=[],m=(w,y)=>v.push({id:y>=0?`#${y}`:`#~${w}`,hasL:w>=0,hasR:y>=0,l:w>=0?e[w]:void 0,r:y>=0?n[y]:void 0,li:w,ri:y,moved:!1}),c=0,b=0;for(let[w,y]of h){let A=w-c,k=y-b;if(s&&A>0&&k>0&&A*k<=tn)for(let[E,T]of sn(e,n,c,A,b,k,s))m(E,T);else{let E=Math.min(A,k);for(let T=0;T<E;T++)m(c+T,b+T);for(let T=E;T<A;T++)m(c+T,-1);for(let T=E;T<k;T++)m(-1,b+T)}w<e.length&&m(w,y),c=w+1,b=y+1}return v}var tn=25e4,rn=.5;function sn(e,n,t,s,r,i,a){let f=i+1,o=new Float64Array(s*i);for(let m=0;m<s;m++)for(let c=0;c<i;c++){let b=Number(a(e[t+m],n[r+c]))||0;o[m*i+c]=b>=rn?b:-1}let l=new Float64Array((s+1)*f);for(let m=s-1;m>=0;m--)for(let c=i-1;c>=0;c--){let b=o[m*i+c];l[m*f+c]=Math.max(l[(m+1)*f+c],l[m*f+c+1],b>=0?b+l[(m+1)*f+c+1]:-1)}let h=[],p=0,v=0;for(;p<s&&v<i;){let m=o[p*i+v];m>=0&&l[p*f+v]===m+l[(p+1)*f+v+1]?(h.push([t+p,r+v]),p++,v++):l[p*f+v]===l[(p+1)*f+v]?(h.push([t+p,-1]),p++):(h.push([-1,r+v]),v++)}for(;p<s;p++)h.push([t+p,-1]);for(;v<i;v++)h.push([-1,r+v]);return h}var Le=Ie(ce(),1),de=new Le.default;function me(e,n,t=20){let s=de.diff_main(String(e),String(n));return Math.max(String(e).length,String(n).length)>=t?de.diff_cleanupSemantic(s):de.diff_cleanupEfficiency(s),s.map(([r,i])=>[r,i])}var K=e=>e!==null&&typeof e=="object"&&!Array.isArray(e),te=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),an=["id","key","uuid","code"],on=["title","name","label","heading"],q={child:1,moved:2,modified:3,added:4,deleted:4};function be(e,n,t={}){let s={textMin:20,detectMoves:!0,numeric:!1,whitespace:!1,...t},r={keys:z(s.keys),ignore:z(s.ignore),titles:z(s.titles),labels:z(s.labels),equals:z(s.equals),similar:z(s.similar),identity:z(s.identity),units:z(s.countBy)},i=u=>!!r.ignore(u),a=[],f=new Map,o=new WeakMap,l=(u,g)=>{u&&typeof u=="object"&&o.set(u,g)},h=new WeakMap,p=(u,g,M)=>{let _=f.get(u);(!_||q[g]>q[_.status]||M&&!_.own&&q[g]>=q[_.status])&&f.set(u,{status:g,own:M})};function v(u,g,M){let _=r.keys(u);if(_===!1)return null;if(typeof _=="function")return[g,M].every(R=>R.every((B,$)=>{let U=_(B,$);return U!=null}))?_:null;if(typeof _=="string"||Array.isArray(_)){let P=Array.isArray(_)?_:[_];return(R,B)=>{if(!K(R))return String(R);for(let $ of P)if(R[$]!==void 0&&R[$]!==null&&R[$]!=="")return String(R[$]);return`#${B}`}}let I=[...g,...M];if(!I.length||!I.every(K))return null;for(let P of an)if([g,M].every(B=>{let $=new Set;return B.every(U=>U[P]!==void 0&&U[P]!==null&&!$.has(U[P])&&$.add(U[P]))}))return B=>String(B[P]);return null}function m(u){let g=r.identity(u),M=_=>Pe(_,I=>i(`${u}${I?"."+I:""}`));return typeof g!="function"?M:_=>{let I=g(_);return I==null?M(_):"id:"+I}}function c(u){let g=r.similar(u);return typeof g=="function"?g:null}function b(u,g,M){var I;let _=r.titles(g);if(typeof _=="function")return String((I=_(u))!=null?I:M);if(typeof _=="string"&&K(u)&&u[_]!=null)return String(u[_]);if(K(u)){for(let P of on)if(typeof u[P]=="string"&&u[P])return u[P]}return K(u)||Array.isArray(u)?M:String(u)}function w(u,g,M,_){let I=r.labels(u);if(typeof I=="function")return String(I(_));if(typeof I=="string")return I;let P=g[g.length-1];return M!=null?M:P?"k"in P?P.k:P.i:""}function y(u,g,M){let _=r.equals(M);return typeof _=="function"?!!_(u,g):Object.is(u,g)?!0:s.numeric&&u!==""&&g!==""&&u!==null&&g!==null&&!isNaN(Number(u))&&!isNaN(Number(g))?Number(u)===Number(g):s.whitespace&&typeof u=="string"&&typeof g=="string"?u.trim().replace(/\\s+/g," ")===g.trim().replace(/\\s+/g," "):!1}function A(u,g,M){var P;let _=G(g);l(u,_),p(_,M,!1);let I=J(g);if(Array.isArray(u)){let R=(P=v(I,u,[]))!=null?P:((U,H)=>M==="deleted"?`#~${H}`:`#${H}`),B=new Map,$=[];u.forEach((U,H)=>{var Y;let C=String(R(U,H)),X=((Y=B.get(C))!=null?Y:0)+1;B.set(C,X),X>1&&(C+=`#${X}`),$.push(C),A(U,[...g,{i:C}],M)}),h.set(u,$)}else if(K(u))for(let R of Object.keys(u))i(J([...g,{k:R}]))||A(u[R],[...g,{k:R}],M)}function k(u,g,M,_,I,P,R,B,$,U){let H=G(I),C=J(I),X={path:H,pattern:C,crumbs:P.slice(),ancestors:R.map(j=>j.path),ancestorPatterns:R.map(j=>j.pattern)};s.raw&&(X.at={left:M?B:null,right:_?$:null,...U?{gap:U}:{}});let Y=j=>{let L={...X,...j};L.label=w(C,I,j.label,L),a.push(L),p(H,L.type,!0)};if(!M&&!_)return;if(!M)return A(g,I,"added"),Y({type:"added",kind:Be(g),left:void 0,right:g,diffs:null}),g;if(!_)return A(u,I,"deleted"),Y({type:"deleted",kind:Be(u),left:u,right:void 0,diffs:null}),u;l(u,H),l(g,H);let ie=r.identity(C);if(typeof ie=="function"&&u&&g&&typeof u=="object"&&typeof g=="object"){let j=ie(u);if(j!=null&&j===ie(g))return g}if(Array.isArray(u)&&Array.isArray(g)){let j=v(C,u,g),L=j?Fe(u,g,j,s.detectMoves):ve(u,g,m(C?`${C}.*`:"*"),c(C?`${C}.*`:"*")),F=[],Q=C?`${C}.*`:"*",W=new Array(u.length),Me=new Array(g.length),Ae=[],ke=new Array(L.length),Se=new Array(L.length);if(s.raw){for(let D=L.length-1,V=g.length;D>=0;D--)ke[D]=V,L[D].hasR&&(V=L[D].ri);for(let D=L.length-1,V=u.length;D>=0;D--)Se[D]=V,L[D].hasL&&!L[D].moved&&(V=L[D].li)}let se=-1;for(let D of L){se++,D.hasL&&(W[D.li]=D.id),D.hasR&&(Me[D.ri]=D.id),Ae.push(D.id);let V=D.hasR?D.r:D.l,We={i:D.id},ae=[...I,We],oe=b(V,Q,D.id),fe=[...R,{path:H,pattern:C}];if(D.moved){let De=G(ae),Te={path:De,pattern:Q,crumbs:[...P,oe],ancestors:fe.map(le=>le.path),ancestorPatterns:fe.map(le=>le.pattern),type:"moved",kind:"node",label:oe,left:D.li+1,right:D.ri+1,diffs:null};s.raw&&(Te.at={left:[...B,D.li],right:[...$,D.ri]}),a.push(Te),p(De,"moved",!0)}let ne=k(D.l,D.r,D.hasL,D.hasR,ae,[...P,oe],fe,s.raw&&D.hasL?[...B,D.li]:null,s.raw&&D.hasR?[...$,D.ri]:null,s.raw?D.hasR?D.hasL?null:{side:"left",parent:B,index:Se[se]}:{side:"right",parent:$,index:ke[se]}:null);ne&&typeof ne=="object"&&l(ne,G(ae)),F.push(ne)}return h.set(u,W),h.set(g,Me),h.set(F,Ae),F}if(K(u)&&K(g)){let j={},L=[...Object.keys(g),...Object.keys(u).filter(F=>!te(g,F))];for(let F of L){let Q=[...I,{k:F}];if(i(J(Q))){j[F]=te(g,F)?g[F]:u[F];continue}let W=k(u[F],g[F],te(u,F),te(g,F),Q,P,[...R,{path:H,pattern:C}],s.raw?[...B,F]:null,s.raw?[...$,F]:null,null);W&&typeof W=="object"&&l(W,G(Q)),j[F]=W}return j}if(y(u,g,C))return g;let ee=j=>j===null||["string","number","boolean"].includes(typeof j),Ke=ee(u)&&ee(g)&&u!==null&&g!==null?me(String(u),String(g),s.textMin):null;return Y({type:"modified",kind:ee(u)&&ee(g)?"value":"node",left:u,right:g,diffs:Ke}),g}let E=k(e,n,e!==void 0,n!==void 0,[],[],[],[],[],null);for(let u of a)for(let g of u.ancestors)p(g,"child",!1);let T={stats:fn(a,r.units),changes:a,nodes:Object.fromEntries(f),merged:E,pathOf:(u,g)=>{var _;let M=typeof u=="string"?u:o.get(u);if(M===void 0)return null;if(g===void 0)return M;if(typeof g=="number"){let I=Array.isArray(u)?(_=h.get(u))==null?void 0:_[g]:void 0;return I===void 0?null:`${M}[${String(I).replace(/[\\\\[\\]]/g,P=>"\\\\"+P)}]`}return`${M}${M?".":""}${g}`},statusOf:(u,g)=>{let M=T.pathOf(u,g),_=M===null?void 0:f.get(M);return _?_.status:null},changesAt:(u,g)=>{let M=T.pathOf(u,g);return M===null?[]:a.filter(_=>_.path===M)}};return T}function Be(e){return e!==null&&typeof e=="object"?"node":"value"}function fn(e,n){let t={added:0,modified:0,deleted:0,moved:0},s=new Map;for(let r of e){let i=r.path,a=!0;if(n(r.pattern)===void 0){i=null;for(let l=r.ancestors.length-1;l>=0;l--)if(n(r.ancestorPatterns[l])!==void 0){i=r.ancestors[l],a=!1;break}i===null&&(i=r.path,a=!0)}let f=a?r.type:"modified",o=s.get(i);(!o||q[f]>q[o])&&s.set(i,f)}for(let r of s.values())t[r]++;return t}var Ue=new WeakMap,He=new WeakMap;function re(e){if(e.v!==void 0)return e.v;let n=He.get(e);if(n===void 0){n="";for(let t of e.c)if(n+=(n?" ":"")+re(t),n.length>2e3)break;He.set(e,n)}return n}function ze(e){var t;let n=Ue.get(e);if(!n){let s=re(e).slice(0,600);n=new Map;for(let r=0;r<s.length-1;r++){let i=s.substr(r,2);n.set(i,((t=n.get(i))!=null?t:0)+1)}Ue.set(e,n)}return n}function ln(e,n){let t=e.v!==void 0,s=n.v!==void 0;if(t!==s||!t&&e.n!==n.n)return 0;if(!t&&e.k&&n.k)return e.k===n.k?1:0;let r=!t&&e.c.length>1&&n.c.length>1&&e.c[0].h===n.c[0].h?.75:0,i=ze(e),a=ze(n);if(!i.size&&!a.size)return t?e.v===n.v?1:.55:.75;if(!i.size||!a.size)return Math.max(r,.55);let f=0,o=0,l=0;for(let v of i.values())o+=v;for(let v of a.values())l+=v;for(let[v,m]of i){let c=a.get(v);c&&(f+=Math.min(m,c))}let h=2*f/(o+l),p=re(e).length<=24&&re(n).length<=24?.55:0;return t?Math.max(h,p):Math.max(.3+.7*h,p,r)}var hn={identity:{"**":e=>e&&typeof e=="object"&&!Array.isArray(e)?e.h:void 0},ignore:["**.h","**.i","**.k","**.virt"],keys:{"**.c":e=>e&&e.k?e.n+"#"+e.k:null},similar:{"**.c.*":ln},raw:!0,textMin:12,detectMoves:!0};function _e(e){var f;let n=we(),t=be(e.left,e.right,{...hn,...(f=e.options)!=null?f:{}}),s=t.changes.map(o=>({type:o.type,kind:o.kind,path:o.path,at:o.at,diffs:o.diffs,left:o.left!==null&&typeof o.left=="object"?null:o.left,right:o.right!==null&&typeof o.right=="object"?null:o.right})),r=we(),i=e.leftAnchors&&e.rightAnchors?pe(e.leftAnchors,e.rightAnchors):[],a=new Int32Array(i.length*2);return i.forEach(([o,l],h)=>{a[2*h]=o,a[2*h+1]=l}),{changes:s,stats:t.stats,anchorPairs:a,ms:{compare:r-n,anchors:we()-r}}}function we(){return(typeof performance!="undefined"?performance:Date).now()}function ye(e){let n=new Array(e.length);for(let t=0;t<e.length;t++){let s=e[t],r=s.ref!==void 0?{n:s.n,c:n[s.ref].c,h:s.h,i:t,virt:1}:s.v!==void 0?{v:s.v,h:s.h,i:t}:{n:s.n,c:[],h:s.h,i:t};s.a&&(r.a=s.a),s.k&&(r.k=s.k),n[t]=r,s.p>=0&&n[s.p].c.push(r)}return n[0]}var x=new Map;self.onmessage=e=>{var t,s;let n=e.data;try{if(n.cancel){x.delete(n.id);return}if(n.part){let r=x.get(n.id);r||(r={left:[],right:[]},x.set(n.id,r));let i=r[n.part];for(let a=0;a<n.recs.length;a++)i[n.at+a]=n.recs[a];return}if(n.go){let r=(t=x.get(n.id))!=null?t:{left:[],right:[]};x.delete(n.id);let i=_e({left:ye(r.left),right:ye(r.right),leftAnchors:n.leftAnchors,rightAnchors:n.rightAnchors,options:n.options});self.postMessage({id:n.id,ok:!0,out:i},[i.anchorPairs.buffer]);return}n.job&&self.postMessage({id:n.id,ok:!0,out:_e(n.job)})}catch(r){x.delete(n.id),self.postMessage({id:n.id,ok:!1,error:String((s=r==null?void 0:r.stack)!=null?s:r)})}};})();\n';
  var url = null;
  function spawnWorker() {
    if (!url) url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
    return new Worker(url);
  }

  // src/marks.js
  function normIndexMap(s) {
    const map = [];
    let i = 0;
    while (i < s.length && /\s/.test(s[i])) i++;
    let ws = false;
    for (; i < s.length; i++) {
      if (/\s/.test(s[i])) {
        if (!ws) {
          map.push(i);
          ws = true;
        }
      } else {
        map.push(i);
        ws = false;
      }
    }
    if (ws) map.pop();
    return map;
  }
  function sideSpans(diffs, side) {
    const want = side === "left" ? -1 : 1;
    const out = [];
    let pos = 0;
    for (const [op, t] of diffs) {
      if (op === 0) pos += t.length;
      else if (op === want) {
        out.push([pos, pos + t.length]);
        pos += t.length;
      }
    }
    return out;
  }
  var BLOCK = "p,li,td,th,dt,dd,h1,h2,h3,h4,h5,h6,pre,blockquote,figcaption,caption,label,button,summary";
  function blockOf(node) {
    var _a;
    const el = node.nodeType === 1 ? node : node.parentElement;
    return (_a = el == null ? void 0 : el.closest(BLOCK)) != null ? _a : el;
  }
  var hasHighlightApi = (win) => !!(win && win.CSS && win.CSS.highlights && win.Highlight);
  function makeRange(node, start, end) {
    const win = node.ownerDocument.defaultView;
    if (win.StaticRange) return new win.StaticRange({ startContainer: node, startOffset: start, endContainer: node, endOffset: end });
    const r = node.ownerDocument.createRange();
    r.setStart(node, start);
    r.setEnd(node, end);
    return r;
  }
  var wholeRange = (textNode) => makeRange(textNode, 0, textNode.data.length);
  var SideMarks = class {
    constructor(name) {
      this.name = name;
      this.attrs = [];
      this.ranges = { add: [], ins: [], del: [], focus: [] };
      this.wins = /* @__PURE__ */ new Set();
      this.docs = /* @__PURE__ */ new Set();
    }
    /** 이 문서에 표시용 CSS 가 있게 (안쪽 iframe 문서에 처음 표시할 때) */
    useDoc(doc) {
      if (!doc || this.docs.has(doc)) return;
      this.docs.add(doc);
      ensureMarkStyle(doc, this.name);
      if (doc.defaultView) this.wins.add(doc.defaultView);
    }
    attr(el, name, value) {
      if (!el || el.nodeType !== 1) return;
      const cur = el.getAttribute(name);
      if (cur && rank(cur) >= rank(value)) return;
      this.useDoc(el.ownerDocument);
      el.setAttribute(name, value);
      this.attrs.push([el, name]);
    }
    textRange(textNode, start, end, kind) {
      const map = normIndexMap(textNode.data);
      if (!map.length) return null;
      const s = map[Math.min(start, map.length - 1)];
      const e = end > start ? map[Math.min(end, map.length) - 1] + 1 : s;
      const r = makeRange(textNode, s, Math.max(s, Math.min(e, textNode.data.length)));
      this.ranges[kind].push(r);
      this.useDoc(textNode.ownerDocument);
      return r;
    }
    wholeText(textNode, kind) {
      this.ranges[kind].push(wholeRange(textNode));
      this.useDoc(textNode.ownerDocument);
    }
    flush() {
      for (const win of this.wins) {
        if (!hasHighlightApi(win)) continue;
        for (const kind of ["add", "ins", "del", "focus"]) {
          const key = `${this.name}-${kind}`;
          const list = this.ranges[kind].filter((r) => r.startContainer.ownerDocument.defaultView === win);
          if (list.length) win.CSS.highlights.set(key, new win.Highlight(...list));
          else win.CSS.highlights.delete(key);
        }
      }
    }
    setFocus(ranges) {
      this.ranges.focus = ranges;
      for (const r of ranges) this.useDoc(r.startContainer.ownerDocument);
      this.flush();
    }
    clear() {
      for (const [el, name] of this.attrs) el.removeAttribute(name);
      this.attrs = [];
      this.ranges = { add: [], ins: [], del: [], focus: [] };
      for (const win of this.wins) {
        if (!hasHighlightApi(win)) continue;
        for (const kind of ["add", "ins", "del", "focus"]) win.CSS.highlights.delete(`${this.name}-${kind}`);
      }
    }
  };
  var RANKS = { added: 4, deleted: 4, modified: 3, moved: 2, before: 1, end: 1 };
  var rank = (v) => {
    var _a;
    return (_a = RANKS[v]) != null ? _a : 0;
  };
  var styleConfig = { nonce: null };
  function applyNonce(st) {
    if (styleConfig.nonce) {
      st.nonce = styleConfig.nonce;
      st.setAttribute("nonce", styleConfig.nonce);
    }
  }
  function ensureMarkStyle(doc, name) {
    var _a;
    if (!doc) return;
    let st = doc.getElementById("sgc-mark-style");
    if (!st) {
      st = doc.createElement("style");
      st.id = "sgc-mark-style";
      applyNonce(st);
      st.textContent = MARK_CSS;
      ((_a = doc.head) != null ? _a : doc.documentElement).appendChild(st);
    }
    if (!st.dataset[name]) {
      st.dataset[name] = "1";
      st.textContent += highlightCss(name);
    }
  }
  var highlightCss = (n) => `
::highlight(${n}-add){color:var(--sgc-add-fg,#15803d);background-color:var(--sgc-add-bg,rgba(22,163,74,.1))}
::highlight(${n}-ins){color:var(--sgc-ins-fg,#1d4ed8);background-color:var(--sgc-ins-bg,rgba(37,99,235,.08));text-decoration:underline;text-decoration-color:var(--sgc-ins-fg,#1d4ed8);text-decoration-thickness:1px}
::highlight(${n}-del){color:var(--sgc-del-fg,#b91c1c);background-color:var(--sgc-del-bg,rgba(220,38,38,.07));text-decoration:line-through;text-decoration-color:var(--sgc-del-fg,#b91c1c);text-decoration-thickness:1px}
::highlight(${n}-focus){background-color:var(--sgc-focus-bg,rgba(250,204,21,.35))}
`;
  var MARK_CSS = `
[data-sgc-line]{box-shadow:-6px 0 0 -4px var(--sgc-line-color,rgba(202,138,4,.7))}
[data-sgc-line="added"]{--sgc-line-color:var(--sgc-ins-line,rgba(22,163,74,.7))}
[data-sgc-line="deleted"]{--sgc-line-color:var(--sgc-del-line,rgba(220,38,38,.7))}
[data-sgc-line="modified"]{--sgc-line-color:var(--sgc-mod-line,rgba(202,138,4,.7))}
[data-sgc="added"]{background-color:var(--sgc-add-block,rgba(22,163,74,.08))!important;color:var(--sgc-add-fg,#15803d)}
[data-sgc="deleted"]{background-color:var(--sgc-del-block,rgba(220,38,38,.05))!important;color:var(--sgc-del-fg,#b91c1c);text-decoration:line-through;text-decoration-color:var(--sgc-del-fg,#b91c1c);text-decoration-thickness:1px}
[data-sgc="modified"]{background-color:var(--sgc-mod-block,rgba(37,99,235,.06))!important}
[data-sgc="moved"]{box-shadow:inset 3px 0 0 var(--sgc-mov-line,rgba(99,102,241,.7))!important}
[data-sgc-gap="before"]{box-shadow:0 -2px 0 0 var(--sgc-gap-line,rgba(220,38,38,.55))}
[data-sgc-gap="end"]{box-shadow:0 2px 0 0 var(--sgc-gap-line,rgba(220,38,38,.55))}
[data-sgc-gap][data-sgc-side="left"]{--sgc-gap-line:rgba(22,163,74,.6)}
@property --sgc-flash{syntax:'<number>';inherits:false;initial-value:0}
[data-sgc-focus]{--sgc-flash:.5;--sgc-flash-rgb:var(--sgc-focus-rgb,250 204 21);background-image:linear-gradient(rgb(var(--sgc-flash-rgb) / calc(var(--sgc-flash) * .42)),rgb(var(--sgc-flash-rgb) / calc(var(--sgc-flash) * .42)))!important;animation:sgc-flash 1.6s ease-in-out 1 both;border-radius:3px}
@keyframes sgc-flash{0%{--sgc-flash:0}14%{--sgc-flash:1}36%{--sgc-flash:.2}56%{--sgc-flash:.85}100%{--sgc-flash:0}}
@media (prefers-reduced-motion:reduce){[data-sgc-focus]{animation:sgc-flash-soft 1.6s ease-out 1 both}}
@keyframes sgc-flash-soft{0%{--sgc-flash:.7}100%{--sgc-flash:0}}
ins.sgc-add{background:var(--sgc-add-bg,rgba(22,163,74,.1));color:var(--sgc-add-fg,#15803d);text-decoration:none}
ins.sgc-ins{background:var(--sgc-ins-bg,rgba(37,99,235,.08));color:var(--sgc-ins-fg,#1d4ed8);text-decoration:underline;text-decoration-thickness:1px}
del.sgc-del{background:var(--sgc-del-bg,rgba(220,38,38,.07));color:var(--sgc-del-fg,#b91c1c);text-decoration:line-through;text-decoration-thickness:1px}
.sgc-spacer{display:block;box-sizing:border-box;position:relative;margin:0;padding:0;list-style:none;background:repeating-linear-gradient(135deg,rgba(100,116,139,.09) 0 6px,transparent 6px 12px);border:1px dashed rgba(100,116,139,.4);border-radius:3px}
.sgc-spacer::after,.sgc-spacer>td::after{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:11px/1.2 system-ui,sans-serif;color:rgba(71,85,105,.8);pointer-events:none}
tr.sgc-spacer{display:table-row;background:none;border:0}
tr.sgc-spacer>td{position:relative;padding:0!important;background:repeating-linear-gradient(135deg,rgba(100,116,139,.09) 0 6px,transparent 6px 12px);border:1px dashed rgba(100,116,139,.4)}
tr.sgc-spacer::after{content:none}
[data-sgc-noscrollbar]{scrollbar-color:transparent transparent}
[data-sgc-noscrollbar]::-webkit-scrollbar-thumb,[data-sgc-noscrollbar]::-webkit-scrollbar-track{background:transparent}
@media print{[data-sgc-focus]{background-image:none!important}}
`;

  // src/scroll.js
  function makeScroller(root, given) {
    const doc = root.ownerDocument;
    const win = doc.defaultView;
    let el = given != null ? given : null;
    if (!el) {
      for (let p = root; p && p.nodeType === 1; p = p.parentElement) {
        const oy = win.getComputedStyle(p).overflowY;
        if ((oy === "auto" || oy === "scroll" || oy === "overlay") && p !== doc.body && p !== doc.documentElement) {
          el = p;
          break;
        }
      }
    }
    if (el && el !== win && el !== doc.scrollingElement && el.nodeType === 1) {
      return {
        target: el,
        doc: el.ownerDocument,
        get top() {
          return el.scrollTop;
        },
        set top(v) {
          el.scrollTop = v;
        },
        viewTop: () => el.getBoundingClientRect().top,
        height: () => el.clientHeight,
        max: () => el.scrollHeight - el.clientHeight
      };
    }
    const se = () => {
      var _a;
      return (_a = doc.scrollingElement) != null ? _a : doc.documentElement;
    };
    return {
      target: win,
      doc,
      get top() {
        return se().scrollTop;
      },
      set top(v) {
        se().scrollTop = v;
      },
      viewTop: () => 0,
      height: () => win.innerHeight,
      max: () => se().scrollHeight - win.innerHeight
    };
  }
  function topIn(el, doc) {
    let top = el.getBoundingClientRect().top;
    let w = el.ownerDocument.defaultView;
    while (w && w.document !== doc && w.frameElement) {
      const f = w.frameElement;
      const cs = f.ownerDocument.defaultView.getComputedStyle(f);
      top += f.getBoundingClientRect().top + (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.paddingTop) || 0);
      w = w.parent;
    }
    return top;
  }
  function scrollIntoScroller(sc, el, ratio = 0.3, smooth = true) {
    const top = sc.top + (topIn(el, sc.doc) - sc.viewTop()) - sc.height() * ratio;
    const t = sc.target;
    const v = Math.max(0, Math.min(top, sc.max()));
    if (t.scrollTo) t.scrollTo({ top: v, behavior: smooth ? "smooth" : "instant" });
    else sc.top = v;
  }
  function linkScroll(A, B, getAnchors) {
    if (A.target === B.target) return { destroy() {
    }, enabled: true, pause() {
    } };
    const lockUntil = /* @__PURE__ */ new Map();
    let enabled = true, pausedUntil = 0;
    const now2 = () => performance.now();
    function search(list, top, lo, hi) {
      let ans = -1;
      while (lo <= hi) {
        const m = lo + hi >> 1;
        const r = list[m].getBoundingClientRect();
        if (r.bottom > top) {
          ans = m;
          hi = m - 1;
        } else lo = m + 1;
      }
      return ans;
    }
    function firstVisible(side, sc) {
      const top = sc.viewTop() + 1;
      const list = side.els;
      if (side.pages && side.pages.length && side.start) {
        const p = search(side.pages, top, 0, side.pages.length - 1);
        if (p >= 0) {
          const a = side.start[p], b = side.start[p + 1] - 1;
          if (b >= a) {
            const k = search(list, top, a, b);
            return k >= 0 ? k : Math.min(b + 1, list.length - 1);
          }
          return Math.min(a, list.length - 1);
        }
      }
      return search(list, top, 0, list.length - 1);
    }
    function syncPages(from, to, fromSide, toSide) {
      const top = from.viewTop() + 1;
      const p = search(fromSide.pages, top, 0, fromSide.pages.length - 1);
      if (p < 0) return proportional(from, to);
      const q = fromSide.pagePair[p];
      const a = fromSide.pages[p].getBoundingClientRect();
      const b = toSide.pages[q].getBoundingClientRect();
      const frac = a.height ? (from.viewTop() - a.top) / a.height : 0;
      const want = b.top + frac * b.height - to.viewTop() - (a.top + frac * a.height - from.viewTop());
      move(to, to.top + want);
    }
    function sync(from, to, fromSide, toSide, pair) {
      var _a;
      if (fromSide.pagePair && ((_a = toSide.pages) == null ? void 0 : _a.length)) return syncPages(from, to, fromSide, toSide);
      const fromList = fromSide.els, toList = toSide.els;
      if (!fromList.length) return proportional(from, to);
      let k = firstVisible(fromSide, from);
      if (k < 0) k = fromList.length - 1;
      let j = k;
      while (j >= 0 && pair[j] < 0 && k - j < 400) j--;
      if (j < 0 || pair[j] < 0) {
        j = k;
        while (j < fromList.length && pair[j] < 0 && j - k < 400) j++;
      }
      if (j >= fromList.length || pair[j] < 0) return proportional(from, to);
      const a = fromList[j], b = toList[pair[j]];
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      if (!ra.height && !rb.height) return proportional(from, to);
      const into = ra.height ? Math.max(0, Math.min(1, (from.viewTop() - ra.top) / ra.height)) : 0;
      const pointA = ra.top + into * ra.height - from.viewTop();
      const pointB = rb.top + into * rb.height - to.viewTop();
      const want = pointB - pointA;
      move(to, to.top + want);
    }
    function proportional(from, to) {
      const fm = from.max(), tm = to.max();
      move(to, fm > 0 ? from.top / fm * tm : 0);
    }
    function move(sc, v) {
      v = Math.max(0, Math.min(Math.round(v), sc.max()));
      if (Math.abs(v - sc.top) < 1) return;
      lockUntil.set(sc.target, now2() + 80);
      const t = sc.target;
      if (t.scrollTo) t.scrollTo({ top: v, behavior: "instant" });
      else sc.top = v;
    }
    function onScroll(from) {
      return () => {
        var _a;
        if (!enabled || now2() < pausedUntil) return;
        if (((_a = lockUntil.get(from.target)) != null ? _a : 0) > now2()) return;
        const a = getAnchors();
        if (from === A) sync(A, B, a.left, a.right, a.pairL);
        else sync(B, A, a.right, a.left, a.pairR);
      };
    }
    const ha = onScroll(A), hb = onScroll(B);
    A.target.addEventListener("scroll", ha, { passive: true });
    B.target.addEventListener("scroll", hb, { passive: true });
    return {
      get enabled() {
        return enabled;
      },
      set enabled(v) {
        enabled = !!v;
      },
      /** 변경 위치로 이동하는 동안은 맞춤을 잠시 끈다 */
      pause(ms = 900) {
        pausedUntil = now2() + ms;
      },
      destroy() {
        A.target.removeEventListener("scroll", ha);
        B.target.removeEventListener("scroll", hb);
      }
    };
  }

  // src/messages.js
  var messages = {
    ko: {
      added: "\uCD94\uAC00",
      modified: "\uC218\uC815",
      deleted: "\uC0AD\uC81C",
      moved: "\uC774\uB3D9",
      changes: "\uBCC0\uACBD \uBAA9\uB85D",
      noChanges: "\uBC14\uB010 \uACF3 \uC5C6\uC74C",
      running: "\uBE44\uAD50\uD558\uB294 \uC911\u2026",
      empty: "(\uBE48 \uCE78)",
      before: "\uC774\uC804",
      after: "\uC0C8 \uBC84\uC804",
      side: "\uB098\uB780\uD788",
      redline: "\uD55C \uC7A5 \uBCF4\uAE30",
      sync: "\uC2A4\uD06C\uB864 \uB9DE\uCDA4",
      prev: "\uC774\uC804 \uBCC0\uACBD",
      next: "\uB2E4\uC74C \uBCC0\uACBD",
      filterHint: "\uB20C\uB7EC\uC11C \uC774 \uC885\uB958\uB9CC \uBCF4\uAE30",
      gapAdded: "\uC0C8 \uBC84\uC804\uC5D0\uC11C \uCD94\uAC00\uB428",
      gapDeleted: "\uC0C8 \uBC84\uC804\uC5D0\uC11C \uC0AD\uC81C\uB428",
      column: (n) => `\uD45C \uC5F4 ${n}\uCE78`,
      attrNames: { colspan: "\uAC00\uB85C \uBCD1\uD569(colspan)", rowspan: "\uC138\uB85C \uBCD1\uD569(rowspan)", value: "\uC785\uB825\uAC12", src: "\uADF8\uB9BC", href: "\uB9C1\uD06C" },
      nodes: "\uC77D\uC740 \uC694\uC18C",
      took: (s) => `\uBE44\uAD50 ${s}\uCD08`,
      page: (p) => `${p}\uCABD`,
      more: (n) => `${n.toLocaleString()}\uAC74 \uB354 \uBCF4\uAE30`
    },
    en: {
      added: "Added",
      modified: "Modified",
      deleted: "Deleted",
      moved: "Moved",
      changes: "Changes",
      noChanges: "No differences",
      running: "Comparing\u2026",
      empty: "(empty)",
      before: "Before",
      after: "After",
      side: "Side by side",
      redline: "Redline",
      sync: "Sync scroll",
      prev: "Previous change",
      next: "Next change",
      filterHint: "Show only this type",
      gapAdded: "Added in the new version",
      gapDeleted: "Removed in the new version",
      column: (n) => `Table column (${n} cells)`,
      attrNames: { colspan: "Merge (colspan)", rowspan: "Merge (rowspan)", value: "Input value", src: "Image", href: "Link" },
      nodes: "Nodes",
      took: (s) => `${s}s`,
      page: (p) => `p.${p}`,
      more: (n) => `Show ${n.toLocaleString()} more`
    }
  };
  function getMessages(locale, overrides) {
    var _a, _b;
    const base = (_b = (_a = messages[locale]) != null ? _a : messages[String(locale != null ? locale : "").slice(0, 2)]) != null ? _b : messages.ko;
    return overrides ? { ...base, ...overrides } : base;
  }

  // src/controller.js
  var seq = 0;
  var sharedWorker = null;
  var workerBroken = false;
  var jobSeq = 0;
  var waiting = /* @__PURE__ */ new Map();
  function dropWorker() {
    try {
      sharedWorker == null ? void 0 : sharedWorker.terminate();
    } catch {
    }
    sharedWorker = null;
  }
  function getWorker() {
    if (workerBroken) return null;
    if (sharedWorker) return sharedWorker;
    try {
      sharedWorker = spawnWorker();
      sharedWorker.onmessage = (e) => {
        const w = waiting.get(e.data.id);
        if (!w) return;
        waiting.delete(e.data.id);
        clearTimeout(w.timer);
        e.data.ok ? w.resolve(e.data.out) : w.fallback(new Error(e.data.error));
      };
      const broken = (e) => {
        var _a;
        workerBroken = true;
        dropWorker();
        for (const w of waiting.values()) {
          clearTimeout(w.timer);
          w.fallback();
        }
        waiting.clear();
        (_a = e == null ? void 0 : e.preventDefault) == null ? void 0 : _a.call(e);
      };
      sharedWorker.onerror = broken;
      sharedWorker.onmessageerror = broken;
      return sharedWorker;
    } catch {
      workerBroken = true;
      return null;
    }
  }
  function cancelJob(id) {
    const w = waiting.get(id);
    if (!w) return;
    waiting.delete(id);
    clearTimeout(w.timer);
    w.resolve(null);
    if (w.computing) {
      dropWorker();
      for (const [, o] of waiting) {
        clearTimeout(o.timer);
        o.fallback();
      }
      waiting.clear();
    } else {
      try {
        sharedWorker == null ? void 0 : sharedWorker.postMessage({ id, cancel: true });
      } catch {
      }
    }
  }
  async function runJob(sl, sr, extra, useWorker, handle = {}) {
    const w = useWorker ? getWorker() : null;
    const local = () => diffTrees({ left: sl.tree, right: sr.tree, leftAnchors: sl.anchorHashes, rightAnchors: sr.anchorHashes, options: extra });
    if (!w) return local();
    const id = ++jobSeq;
    handle.id = id;
    let entry;
    const done = new Promise((resolve, reject) => {
      entry = {
        resolve,
        reject,
        computing: false,
        timer: 0,
        fallback: (err) => {
          try {
            resolve(local());
          } catch (e) {
            reject(err != null ? err : e);
          }
        }
      };
      waiting.set(id, entry);
    });
    const CHUNK = 15e3;
    try {
      for (const [side, s] of [["left", sl], ["right", sr]]) {
        for (let k = 0; k < s.flat.length; k += CHUNK) {
          if (!waiting.has(id)) return done;
          w.postMessage({ id, part: side, at: k, recs: s.flat.slice(k, k + CHUNK) });
          await yieldToBrowser();
        }
      }
      if (!waiting.has(id)) return done;
      entry.computing = true;
      entry.timer = setTimeout(() => {
        if (!waiting.has(id)) return;
        waiting.delete(id);
        dropWorker();
        entry.fallback();
      }, 3e4 + (sl.flat.length + sr.flat.length) / 10);
      w.postMessage({ id, go: true, leftAnchors: sl.anchorHashes, rightAnchors: sr.anchorHashes, options: extra });
    } catch (err) {
      if (waiting.delete(id)) {
        clearTimeout(entry.timer);
        entry.fallback(err);
      }
    }
    return done;
  }
  function createCompare(options) {
    const opt = {
      attrs: DEFAULT_ATTRS,
      worker: "auto",
      watch: false,
      debounce: 300,
      syncScroll: true,
      page: null,
      align: true,
      locale: "ko",
      virtualize: false,
      frames: true,
      visibleOnly: false,
      ...options
    };
    if (opt.nonce) styleConfig.nonce = opt.nonce;
    const name = `sgc${++seq}`;
    const marks = { left: new SideMarks(name + "l"), right: new SideMarks(name + "r") };
    const listeners = /* @__PURE__ */ new Map();
    const emit = (ev, data) => {
      var _a;
      for (const f of (_a = listeners.get(ev)) != null ? _a : []) f(data);
    };
    const state = {
      changes: [],
      stats: { added: 0, modified: 0, deleted: 0, moved: 0 },
      timing: null,
      current: -1,
      filter: null,
      running: false,
      error: null,
      pages: { left: 0, right: 0 }
    };
    let snaps = null, anchors = { left: { els: [] }, right: { els: [] }, pairL: new Int32Array(0), pairR: new Int32Array(0) };
    let runId = 0, link = null, observers = [], debounceTimer = 0, destroyed = false;
    const scrollers = {};
    const root = (side) => resolveRoot(side === "left" ? opt.left : opt.right);
    const hostEl = (n, side) => {
      var _a, _b;
      let el = n ? n.nodeType === 1 ? n : n.parentElement : null;
      const d = root(side).ownerDocument;
      for (let k = 0; el && el.ownerDocument !== d && k < 20; k++) el = (_b = (_a = el.ownerDocument.defaultView) == null ? void 0 : _a.frameElement) != null ? _b : null;
      return el;
    };
    const job = { id: 0 };
    let virt = [];
    let virtToken = 0, virtBusy = false;
    const restoreVirt = ([el, cv, cis, had]) => {
      el.style.contentVisibility = cv;
      el.style.containIntrinsicSize = cis;
      if (!had && el.getAttribute("style") === "") el.removeAttribute("style");
    };
    function unvirtualize() {
      virtToken++;
      for (const v of virt) restoreVirt(v);
      virt = [];
    }
    const nextFrame = (win) => new Promise((res) => win.requestAnimationFrame(res));
    async function virtualize() {
      var _a, _b;
      if (!opt.page || !opt.virtualize || virtBusy) return;
      virtBusy = true;
      const token = virtToken;
      const alive = () => token === virtToken && !destroyed;
      try {
        const have = new Set(virt.map((v) => v[0]));
        for (const side of ["left", "right"]) {
          const r = root(side);
          const win = r.ownerDocument.defaultView;
          if (!((_b = (_a = win.CSS) == null ? void 0 : _a.supports) == null ? void 0 : _b.call(_a, "content-visibility", "auto"))) continue;
          const pages = Array.from(r.querySelectorAll(opt.page));
          if (!pages.length || opt.virtualize === "auto" && pages.length < 20) continue;
          const todo = pages.filter((p) => {
            var _a2;
            return !have.has(p) && win.getComputedStyle(p).contentVisibility === "visible" && !((_a2 = p.parentElement) == null ? void 0 : _a2.closest(opt.page));
          });
          if (!todo.length) continue;
          const px2 = (v) => parseFloat(v) || 0;
          const sizes = todo.map((p) => {
            const cs = win.getComputedStyle(p);
            const w = parseFloat(cs.width), h2 = parseFloat(cs.height);
            const pad = cs.boxSizing === "border-box";
            return [
              pad ? w - px2(cs.paddingLeft) - px2(cs.paddingRight) - px2(cs.borderLeftWidth) - px2(cs.borderRightWidth) : w,
              pad ? h2 - px2(cs.paddingTop) - px2(cs.paddingBottom) - px2(cs.borderTopWidth) - px2(cs.borderBottomWidth) : h2
            ];
          });
          if (sizes.some(([w, h2]) => !(w > 0) || !(h2 > 0))) continue;
          const pa = todo[todo.length - 1], pb = todo[Math.max(0, todo.length - 2)];
          const shape = () => {
            const a = pa.getBoundingClientRect(), b = pb.getBoundingClientRect();
            return [a.height, b.height, a.top - b.top];
          };
          const before = shape();
          const mine = [];
          let first = true;
          for (let k = todo.length; k > 0 && alive(); k -= 100) {
            for (let i = k - 1; i >= Math.max(0, k - 100); i--) {
              const p = todo[i];
              const rec = [p, p.style.contentVisibility, p.style.containIntrinsicSize, p.hasAttribute("style")];
              mine.push(rec);
              p.style.contentVisibility = "auto";
              p.style.containIntrinsicSize = `auto ${sizes[i][0]}px auto ${sizes[i][1]}px`;
            }
            if (first) {
              first = false;
              const after = shape();
              if (before.some((v, i) => Math.abs(v - after[i]) >= 1)) {
                for (const m of mine) restoreVirt(m);
                mine.length = 0;
                break;
              }
            }
            await nextFrame(win);
          }
          if (!alive()) {
            for (const m of mine) restoreVirt(m);
            return;
          }
          virt.push(...mine);
        }
      } finally {
        virtBusy = false;
      }
    }
    function setupScroll() {
      scrollers.left = makeScroller(root("left"), opt.leftScroller);
      scrollers.right = makeScroller(root("right"), opt.rightScroller);
      link == null ? void 0 : link.destroy();
      link = opt.syncScroll === false ? null : linkScroll(scrollers.left, scrollers.right, () => anchors);
      updateScrollbar();
    }
    function updateScrollbar() {
      var _a;
      const sc = scrollers.left;
      if (!sc) return;
      if (sc.target === ((_a = scrollers.right) == null ? void 0 : _a.target)) return;
      const el = sc.target.nodeType === 1 ? sc.target : sc.doc.documentElement;
      ensureMarkStyle(el.ownerDocument, name + "l");
      if (opt.scrollbars !== "both" && (link == null ? void 0 : link.enabled)) el.setAttribute("data-sgc-noscrollbar", "");
      else el.removeAttribute("data-sgc-noscrollbar");
    }
    async function run() {
      var _a, _b;
      if (destroyed) return;
      const id = ++runId;
      cancelJob(job.id);
      state.running = true;
      state.error = null;
      emit("start");
      try {
        const L = root("left"), R = root("right");
        await virtualize();
        if (id !== runId || destroyed) return;
        ensureMarkStyle(L.ownerDocument, name + "l");
        ensureMarkStyle(R.ownerDocument, name + "r");
        const t0 = performance.now();
        const sopt = { attrs: opt.attrs, ignore: opt.ignore, anchors: opt.anchors, keyAttrs: opt.keyAttrs, flatten: (_a = opt.flatten) != null ? _a : opt.page, frames: opt.frames, visibleOnly: opt.visibleOnly };
        const big = L.getElementsByTagName("*").length + R.getElementsByTagName("*").length > 6e3;
        const sl = big ? await snapshotAsync(L, sopt) : snapshot(L, sopt);
        if (id !== runId || destroyed) return;
        const sr = big ? await snapshotAsync(R, sopt) : snapshot(R, sopt);
        if (id !== runId || destroyed) return;
        const t1 = performance.now();
        const size = sl.nodes.length + sr.nodes.length;
        const useWorker = opt.worker === true || opt.worker === "auto" && size > 4e3;
        const out = await runJob(sl, sr, opt.rules, useWorker, job);
        if (!out || id !== runId || destroyed) return;
        watchFrames([...sl.frames, ...sr.frames]);
        const t2 = performance.now();
        snaps = { left: sl, right: sr };
        await apply(out, id);
        if (id !== runId || destroyed) return;
        snaps = { done: true };
        sl.tree = sr.tree = sl.flat = sr.flat = null;
        const t3 = performance.now();
        state.timing = { snapshot: t1 - t0, compare: t2 - t1, paint: t3 - t2, total: t3 - t0, nodes: size, worker: useWorker && !workerBroken, engine: out.ms };
        if (!scrollers.left) setupScroll();
        state.running = false;
        emit("update", api);
      } catch (err) {
        if (id !== runId) return;
        state.running = false;
        state.error = err;
        emit("error", err);
        if (!((_b = listeners.get("error")) == null ? void 0 : _b.length)) console.error(err);
      }
    }
    function nodeOf(side, raw) {
      if (!raw) return { node: null, rest: [] };
      const s = snaps[side];
      const { node, rest } = locate(s.tree, raw);
      return { obj: node, node: s.nodes[node.i], rest };
    }
    function pageIndex(side) {
      if (!opt.page) return null;
      const list = Array.from(root(side).querySelectorAll(opt.page));
      state.pages[side] = list.length;
      const m = new Map(list.map((el, i) => [el, i + 1]));
      return (node) => {
        var _a;
        const el = hostEl(node, side);
        const p = el == null ? void 0 : el.closest(opt.page);
        return p ? (_a = m.get(p)) != null ? _a : null : null;
      };
    }
    function slicer(id) {
      let t = performance.now();
      return async () => {
        if (performance.now() - t < 8) return true;
        await yieldToBrowser();
        t = performance.now();
        return id === runId && !destroyed;
      };
    }
    function refine(list) {
      var _a, _b, _c;
      const ids = /* @__PURE__ */ new WeakMap();
      let idn = 0;
      const idOf = (n) => {
        if (!n) return 0;
        let v = ids.get(n);
        if (!v) ids.set(n, v = ++idn);
        return v;
      };
      const seen = /* @__PURE__ */ new Set();
      list = list.filter((ch) => {
        var _a2;
        const key = [ch.type, ch.what, (_a2 = ch.attr) != null ? _a2 : "", idOf(ch.left), idOf(ch.right), ch.diffs ? JSON.stringify(ch.diffs) : ""].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      for (const ch of list) {
        if (ch.what !== "attr") continue;
        const l = ((_a = ch.left) == null ? void 0 : _a.nodeType) === 1 ? ch.left : null, r = ((_b = ch.right) == null ? void 0 : _b.nodeType) === 1 ? ch.right : null;
        if (ch.type === "added" || ch.type === "deleted" || ch.attr === "a" || ch.attr === "") {
          ch.type = "modified";
          const names = [...opt.attrs, "value"].filter((n) => {
            var _a2, _b2;
            return ((_a2 = l == null ? void 0 : l.getAttribute(n)) != null ? _a2 : null) !== ((_b2 = r == null ? void 0 : r.getAttribute(n)) != null ? _b2 : null);
          });
          ch.attr = names.join(", ") || ch.attr;
          ch.before = names.map((n) => {
            var _a2;
            return (_a2 = l == null ? void 0 : l.getAttribute(n)) != null ? _a2 : "\u2013";
          }).join(", ");
          ch.after = names.map((n) => {
            var _a2;
            return (_a2 = r == null ? void 0 : r.getAttribute(n)) != null ? _a2 : "\u2013";
          }).join(", ");
        }
      }
      const byRight = /* @__PURE__ */ new Map();
      list = list.filter((ch) => {
        var _a2, _b2;
        if (ch.type !== "modified" || !ch.right || ch.what === "moved") return true;
        const key = [ch.what, (_a2 = ch.attr) != null ? _a2 : "", idOf(ch.right), ch.diffs ? JSON.stringify(ch.diffs) : ""].join("|");
        const first = byRight.get(key);
        if (!first) {
          byRight.set(key, ch);
          return true;
        }
        if (ch.left && ch.left !== first.left) ((_b2 = first.alsoLeft) != null ? _b2 : first.alsoLeft = []).push(ch.left);
        return false;
      });
      const textOf2 = /* @__PURE__ */ new Map();
      for (const ch of list) if (ch.what === "text" && ch.right) {
        const cell = (_c = ch.right.parentElement) == null ? void 0 : _c.closest("td,th");
        if (cell) textOf2.set(cell, ch);
      }
      list = list.filter((ch) => {
        var _a2, _b2;
        if (ch.what !== "attr" || !ch.right || !/span/.test((_a2 = ch.attr) != null ? _a2 : "") && ch.attr !== "a") return true;
        const t = textOf2.get(ch.right);
        if (!t) return true;
        t.span = ch;
        if (ch.left && ch.left !== t.left) ((_b2 = t.alsoLeft) != null ? _b2 : t.alsoLeft = []).push(ch.left);
        return false;
      });
      const byHash = /* @__PURE__ */ new Map();
      for (const ch of list) if (ch.type === "deleted" && ch.what === "node" && ch.h) {
        if (!byHash.has(ch.h)) byHash.set(ch.h, []);
        byHash.get(ch.h).push(ch);
      }
      const drop = /* @__PURE__ */ new Set();
      for (const ch of list) {
        if (ch.type !== "added" || ch.what !== "node" || !ch.h) continue;
        const cand = byHash.get(ch.h);
        const del = cand == null ? void 0 : cand.shift();
        if (!del) continue;
        del.type = "moved";
        del.what = "moved";
        del.right = ch.right;
        del.gap = null;
        del.page = { left: del.page.left, right: ch.page.right };
        drop.add(ch);
      }
      let out = list.filter((ch) => !drop.has(ch));
      const groups = /* @__PURE__ */ new Map();
      for (const ch of out) {
        if (ch.type !== "added" && ch.type !== "deleted" || ch.what !== "node") continue;
        const n = ch.type === "added" ? ch.right : ch.left;
        if ((n == null ? void 0 : n.nodeType) !== 1 || n.localName !== "td" && n.localName !== "th") continue;
        const table = n.closest("table");
        if (!table) continue;
        const key = ch.type + "|" + visualCol(n);
        let byTable = groups.get(table);
        if (!byTable) groups.set(table, byTable = /* @__PURE__ */ new Map());
        if (!byTable.has(key)) byTable.set(key, []);
        byTable.get(key).push(ch);
      }
      const merged = /* @__PURE__ */ new Set();
      for (const byTable of groups.values()) for (const cells of byTable.values()) {
        if (cells.length < 2) continue;
        const head = cells[0];
        head.what = "column";
        head.extra = cells.slice(1).map((c) => ({ node: c.type === "added" ? c.right : c.left, gap: c.gap }));
        head.count = cells.length;
        for (const c of cells.slice(1)) merged.add(c);
      }
      out = out.filter((ch) => !merged.has(ch));
      out = rowMoves(out, (c) => {
        var _a2;
        return [c, ...((_a2 = c.extra) != null ? _a2 : []).map((x) => ({ ...c, [c.type === "added" ? "right" : "left"]: x.node }))];
      });
      out.forEach((ch, i) => {
        ch.index = i;
        delete ch.h;
      });
      return out;
    }
    function rowMoves(list, expand) {
      var _a, _b, _c, _d, _e, _f;
      const addedCells = /* @__PURE__ */ new Set(), deletedCells = /* @__PURE__ */ new Set();
      for (const c of list) for (const x of expand(c)) {
        if (x.type === "added" && ((_a = x.right) == null ? void 0 : _a.nodeType) === 1) addedCells.add(x.right);
        if (x.type === "deleted" && ((_b = x.left) == null ? void 0 : _b.nodeType) === 1) deletedCells.add(x.left);
      }
      const rowText = (tr, skip) => visualRow(tr).filter((td) => !skip.has(td)).map((td) => {
        var _a2;
        return normText((_a2 = td.textContent) != null ? _a2 : "");
      }).join("");
      const pairs = /* @__PURE__ */ new Map();
      for (const c of list) {
        if (c.type !== "modified" || c.what !== "text") continue;
        const lt = (_d = (_c = c.left) == null ? void 0 : _c.parentElement) == null ? void 0 : _d.closest("tr"), rt = (_f = (_e = c.right) == null ? void 0 : _e.parentElement) == null ? void 0 : _f.closest("tr");
        if (lt && rt && lt.parentElement && rt.parentElement) pairs.set(lt, rt);
      }
      if (pairs.size < 2) return list;
      const rights = /* @__PURE__ */ new Map();
      for (const rt of pairs.values()) rights.set(rowText(rt, addedCells), rt);
      const moved = /* @__PURE__ */ new Map();
      for (const [lt, rt] of pairs) {
        const t = rowText(lt, deletedCells);
        if (rowText(rt, addedCells) === t) continue;
        const real = rights.get(t);
        if (real && real !== rt) moved.set(lt, real);
      }
      if (!moved.size) return list;
      const movedRights = new Set(moved.values());
      const out = list.filter((c) => {
        var _a2, _b2, _c2, _d2;
        if (c.type !== "modified" || c.what !== "text") return true;
        const lt = (_b2 = (_a2 = c.left) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b2.closest("tr"), rt = (_d2 = (_c2 = c.right) == null ? void 0 : _c2.parentElement) == null ? void 0 : _d2.closest("tr");
        return !(moved.has(lt) || movedRights.has(rt));
      });
      for (const [lt, rt] of moved) {
        out.push({
          index: 0,
          type: "moved",
          what: "moved",
          path: "",
          diffs: null,
          left: lt,
          right: rt,
          gap: null,
          before: null,
          after: null,
          page: { left: null, right: null }
        });
      }
      const pos = (c) => {
        var _a2, _b2, _c2;
        return (_c2 = (_a2 = c.right) != null ? _a2 : c.left) != null ? _c2 : (_b2 = c.gap) == null ? void 0 : _b2.node;
      };
      out.sort((a, b) => {
        const x = pos(a), y = pos(b);
        if (!x || !y || x === y) return 0;
        return x.compareDocumentPosition(y) & 4 ? -1 : 1;
      });
      return out;
    }
    const rowCache = /* @__PURE__ */ new WeakMap();
    function visualRow(tr) {
      var _a;
      let r = rowCache.get(tr);
      if (r) return r;
      const group = tr.parentElement;
      const grid = [];
      Array.from(group.rows).forEach((row, y) => {
        var _a2, _b;
        (_a2 = grid[y]) != null ? _a2 : grid[y] = [];
        let c = 0;
        for (const td of row.cells) {
          while (grid[y][c]) c++;
          const cs = Math.max(1, td.colSpan || 1), rs = Math.max(1, td.rowSpan || 1);
          for (let yy = y; yy < y + rs; yy++) {
            (_b = grid[yy]) != null ? _b : grid[yy] = [];
            for (let x = c; x < c + cs; x++) grid[yy][x] = td;
          }
          c += cs;
        }
      });
      Array.from(group.rows).forEach((row, y) => {
        var _a2;
        return rowCache.set(row, [...new Set(((_a2 = grid[y]) != null ? _a2 : []).filter(Boolean))]);
      });
      return (_a = rowCache.get(tr)) != null ? _a : [];
    }
    const colCache = /* @__PURE__ */ new WeakMap();
    function visualCol(cell) {
      var _a;
      let m = colCache.get(cell);
      if (m !== void 0) return m;
      const table = cell.closest("table");
      for (const group of [table.tHead, ...table.tBodies, table.tFoot].filter(Boolean)) {
        const taken = [];
        Array.from(group.rows).forEach((tr, r) => {
          var _a2, _b;
          (_a2 = taken[r]) != null ? _a2 : taken[r] = [];
          let c = 0;
          for (const td of tr.cells) {
            while (taken[r][c]) c++;
            colCache.set(td, c);
            const cs = Math.max(1, td.colSpan || 1), rs = Math.max(1, td.rowSpan || 1);
            for (let y = r; y < r + rs; y++) {
              (_b = taken[y]) != null ? _b : taken[y] = [];
              for (let x = c; x < c + cs; x++) taken[y][x] = 1;
            }
            c += cs;
          }
        });
      }
      return (_a = colCache.get(cell)) != null ? _a : cell.cellIndex;
    }
    let spacers = [], padded = [];
    function unalign() {
      for (const io of lazyIO != null ? lazyIO : []) io.disconnect();
      for (const sp of spacers) sp.remove();
      for (const ch of state.changes) ch.spacer = null;
      for (const [el, prop, old, had] of padded) {
        el.style[prop] = old;
        if (!had && el.getAttribute("style") === "") el.removeAttribute("style");
      }
      spacers = [];
      padded = [];
    }
    const zoomOf = (el) => {
      if (typeof el.currentCSSZoom === "number") return el.currentCSSZoom;
      const h2 = el.offsetHeight;
      return h2 ? el.getBoundingClientRect().height / h2 : 1;
    };
    let pageIdx = null;
    const pageNo = (n, side) => {
      var _a;
      if (!opt.page || !n) return -1;
      const el = hostEl(n, side);
      const pg = el == null ? void 0 : el.closest(opt.page);
      if (!pg) return -1;
      if (!pageIdx) pageIdx = {};
      if (!pageIdx[side]) pageIdx[side] = new Map(Array.from(root(side).querySelectorAll(opt.page), (p, i) => [p, i]));
      return (_a = pageIdx[side].get(pg)) != null ? _a : -1;
    };
    const px = (v) => parseFloat(v) || 0;
    function layoutHeight(el) {
      const cs = el.ownerDocument.defaultView.getComputedStyle(el);
      const ch = parseFloat(cs.height);
      if (!Number.isFinite(ch)) {
        const z = zoomOf(el) || 1;
        return el.getBoundingClientRect().height / z;
      }
      if (cs.display === "table-row") return ch;
      return cs.boxSizing === "border-box" ? ch : ch + px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
    }
    function spaceOf(el) {
      const z = zoomOf(el) || 1;
      const r = el.getBoundingClientRect();
      const win = el.ownerDocument.defaultView;
      const cs = win.getComputedStyle(el);
      const ps = el.parentElement ? win.getComputedStyle(el.parentElement) : null;
      const h2 = layoutHeight(el);
      if (cs.display === "table-row") return h2;
      if (ps && /flex|grid/.test(ps.display)) return h2 + px(cs.marginTop) + px(cs.marginBottom) + px(ps.rowGap);
      let next = el.nextElementSibling;
      while (next && (next.classList.contains("sgc-spacer") || next.hasAttribute("data-sgc-ignore"))) next = next.nextElementSibling;
      if (next) {
        const nr = next.getBoundingClientRect();
        if (nr.top >= r.bottom - 1 && nr.top - r.top < r.height * 3 + 200) return (nr.top - r.top) / z;
      }
      return h2 + px(cs.marginTop) + px(cs.marginBottom);
    }
    function parentGap(el) {
      const p = el.parentElement;
      if (!p) return 0;
      const cs = p.ownerDocument.defaultView.getComputedStyle(p);
      return /flex|grid/.test(cs.display) ? px(cs.rowGap) : 0;
    }
    function makeSpacer(ref, end, height, label, afterNode = null, gapPx = null) {
      var _a;
      const doc = ref.ownerDocument;
      const parent = end ? ref : ref.parentNode;
      const ctx = end ? ref : ref.parentElement;
      const tag = ctx == null ? void 0 : ctx.localName;
      let sp;
      if (ref.localName === "tr" || /^(tbody|thead|tfoot|table)$/.test(tag != null ? tag : "")) {
        sp = doc.createElement("tr");
        const td = doc.createElement("td");
        td.colSpan = 1e3;
        td.setAttribute("data-label", label);
        sp.appendChild(td);
        sp.style.height = height + "px";
      } else {
        sp = doc.createElement(tag === "ul" || tag === "ol" ? "li" : "div");
        sp.setAttribute("data-label", label);
        sp.style.height = Math.max(0, height - (gapPx != null ? gapPx : parentGap(end ? (_a = ref.lastElementChild) != null ? _a : ref : ref))) + "px";
      }
      sp.className = "sgc-spacer";
      marks.left.useDoc(doc);
      sp.setAttribute("data-sgc-ignore", "");
      sp.setAttribute("aria-hidden", "true");
      if (afterNode) {
        if (!afterNode.parentNode) return null;
        afterNode.parentNode.insertBefore(sp, afterNode.nextSibling);
      } else if (!parent || !(end || ref.parentNode)) return null;
      else if (end) parent.appendChild(sp);
      else parent.insertBefore(sp, ref);
      spacers.push(sp);
      return sp;
    }
    const unitOf = (n) => {
      const el = (n == null ? void 0 : n.nodeType) === 1 ? n : n == null ? void 0 : n.parentElement;
      if (!el) return null;
      const tr = el.closest("tr");
      return tr != null ? tr : blockOf(el);
    };
    function topUnit(n, side) {
      const r = root(side);
      let el = (n == null ? void 0 : n.nodeType) === 1 ? n : n == null ? void 0 : n.parentElement;
      if (el && el.ownerDocument !== r.ownerDocument) return null;
      while (el && el.parentElement && el.parentElement !== r && !(opt.page && el.parentElement.matches(opt.page))) el = el.parentElement;
      return el && el !== r ? el : null;
    }
    let lazyIO = [];
    const seenPages = /* @__PURE__ */ new Set();
    let ensureAligned = async () => {
    };
    let flying = false, afterFlight = () => {
    };
    async function alignHeights(list, tick) {
      var _a, _b;
      unalign();
      pageIdx = null;
      for (const io of lazyIO) io.disconnect();
      lazyIO = [];
      ensureAligned = async () => {
      };
      afterFlight = () => {
      };
      if (!opt.page) return alignBatch(list, tick);
      const groups = /* @__PURE__ */ new Map();
      const add = (side, n, ch) => {
        const k = pageNo(n, side);
        if (k < 0) return;
        const key = side + ":" + k;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(ch);
      };
      for (const ch of list) {
        add("left", ch.left, ch);
        add("right", ch.right, ch);
        if (ch.gap) {
          add(ch.gap.side, ch.gap.node, ch);
          add(ch.gap.side, ch.gap.prev, ch);
        }
        for (const x of (_a = ch.extra) != null ? _a : []) add(ch.type === "added" ? "right" : "left", x.node, ch);
        for (const n of (_b = ch.alsoLeft) != null ? _b : []) add("left", n, ch);
      }
      const done = /* @__PURE__ */ new Set(), queue = /* @__PURE__ */ new Set();
      let draining = false;
      const drain = async () => {
        var _a2;
        if (draining) return;
        draining = true;
        try {
          while (queue.size) {
            const batch = [];
            for (const key of queue) {
              seenPages.add(key);
              for (const ch of (_a2 = groups.get(key)) != null ? _a2 : []) if (!done.has(ch)) {
                done.add(ch);
                batch.push(ch);
              }
            }
            queue.clear();
            if (!batch.length) continue;
            const shown = forceRender(batch);
            try {
              await alignBatch(batch, async () => !destroyed);
            } finally {
              releaseRender(shown);
            }
          }
        } finally {
          draining = false;
        }
      };
      const forceRender = (batch) => {
        var _a2, _b2;
        const pages = /* @__PURE__ */ new Set();
        const add2 = (n, side) => {
          var _a3, _b3;
          const pg = (_b3 = (_a3 = hostEl(n, side)) == null ? void 0 : _a3.closest) == null ? void 0 : _b3.call(_a3, opt.page);
          if (pg) pages.add(pg);
        };
        for (const ch of batch) {
          add2(ch.left, "left");
          add2(ch.right, "right");
          if (ch.gap) {
            add2(ch.gap.node, ch.gap.side);
            add2(ch.gap.prev, ch.gap.side);
          }
          for (const x of (_a2 = ch.extra) != null ? _a2 : []) add2(x.node, ch.type === "added" ? "right" : "left");
          for (const n of (_b2 = ch.alsoLeft) != null ? _b2 : []) add2(n, "left");
        }
        const out = [];
        for (const pg of pages) {
          if (pg.ownerDocument.defaultView.getComputedStyle(pg).contentVisibility !== "auto") continue;
          out.push([pg, pg.style.contentVisibility, pg.hasAttribute("style")]);
          pg.style.contentVisibility = "visible";
        }
        return out;
      };
      const releaseRender = (list2) => {
        if (!list2.length) return;
        const win = list2[0][0].ownerDocument.defaultView;
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => {
          for (const [pg, old, had] of list2) {
            pg.style.contentVisibility = old;
            if (!had && pg.getAttribute("style") === "") pg.removeAttribute("style");
          }
        }));
      };
      const passed = /* @__PURE__ */ new Map();
      afterFlight = () => {
        for (const key of passed.keys()) queue.add(key);
        passed.clear();
        drain();
      };
      ensureAligned = async (keys) => {
        for (const k of keys) if (groups.has(k)) queue.add(k);
        while (draining) await yieldToBrowser();
        await drain();
      };
      for (const side of ["left", "right"]) {
        const r = root(side);
        const win = r.ownerDocument.defaultView;
        if (!win.IntersectionObserver) return alignBatch(list, tick);
        const sc = side === "left" ? opt.leftScroller : opt.rightScroller;
        const scEl = sc != null ? sc : makeScroller(r).target;
        const pages = Array.from(r.querySelectorAll(opt.page));
        const idx = new Map(pages.map((p, i) => [p, i]));
        const ioRoot = scEl && scEl.nodeType === 1 && scEl.ownerDocument === r.ownerDocument ? scEl : null;
        const io = new win.IntersectionObserver((entries) => {
          if (flying) {
            for (const e of entries) if (e.isIntersecting) passed.set(side + ":" + idx.get(e.target), e.target);
            return;
          }
          for (const e of entries) if (e.isIntersecting) queue.add(side + ":" + idx.get(e.target));
          drain();
        }, { root: ioRoot, rootMargin: "150% 0px 150% 0px" });
        for (const p of pages) if (groups.has(side + ":" + idx.get(p))) io.observe(p);
        lazyIO.push(io);
        const onState = (e) => {
          if (e.skipped) return;
          const key = side + ":" + idx.get(e.target);
          if (!groups.has(key)) return;
          if (flying) {
            passed.set(key, e.target);
            return;
          }
          queue.add(key);
          drain();
        };
        const watched = pages.filter((p) => groups.has(side + ":" + idx.get(p)));
        for (const p of watched) p.addEventListener("contentvisibilityautostatechange", onState);
        lazyIO.push({ disconnect: () => {
          for (const p of watched) p.removeEventListener("contentvisibilityautostatechange", onState);
        } });
      }
      for (const k of seenPages) if (groups.has(k)) queue.add(k);
      if (queue.size) drain();
    }
    async function alignBatch(list, tick) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
      const msg = getMessages(opt.locale);
      const el = (x) => x ? x.nodeType === 1 ? x : x.parentElement : null;
      const plans = [];
      for (const ch of list) {
        const exp = ch.extra ? [ch, ...ch.extra.map((x) => ({ ...ch, [ch.type === "added" ? "right" : "left"]: x.node, gap: x.gap }))] : [ch];
        for (const c of exp) {
          if (c.type !== "added" && c.type !== "deleted") continue;
          const n = c.type === "added" ? c.right : c.left;
          if ((n == null ? void 0 : n.nodeType) !== 1 || /^(td|th)$/.test(n.localName) || !((_a = c.gap) == null ? void 0 : _a.node)) continue;
          const disp = n.ownerDocument.defaultView.getComputedStyle(n).display;
          if (/^(inline|inline-block|inline-flex|contents|none)$/.test(disp)) continue;
          if (!await tick()) return;
          const gside = c.gap.side, oside = gside === "left" ? "right" : "left";
          let ref = el(c.gap.node), end = c.gap.end, after = null;
          const want = pageNo(n, oside);
          const prev = el(c.gap.prev);
          let intoPage = null;
          if (want >= 0) {
            if (prev && pageNo(prev, gside) === want && (end || pageNo(ref, gside) !== want)) after = prev;
            else if (ref && !end && pageNo(ref, gside) === want) {
            } else {
              const pg = root(gside).querySelectorAll(opt.page)[want];
              if (pg) intoPage = pg;
              else if (end && prev) after = prev;
            }
          } else if (end && prev) after = prev;
          if (!ref && !after && !intoPage) continue;
          const h2 = spaceOf(n);
          if (h2 < 1) continue;
          if (intoPage) {
            const first = (_c = (_b = Array.from(intoPage.children).find((x) => !x.hasAttribute("data-sgc-ignore") && !x.classList.contains("sgc-spacer"))) != null ? _b : Array.from(intoPage.children).reverse().find((x) => x.hasAttribute("data-sgc-ignore"))) != null ? _c : null;
            if (first) {
              ref = first;
              end = false;
              after = null;
            } else {
              ref = intoPage;
              end = true;
              after = null;
            }
          }
          plans.push({ c, ref, end, after, h: h2, label: c.type === "added" ? msg.gapAdded : msg.gapDeleted, gap: parentGap(after != null ? after : end ? (_d = ref.lastElementChild) != null ? _d : ref : ref) });
        }
      }
      for (const pl of plans) {
        const { c, ref, end, after, h: h2, label } = pl;
        if (after && !after.isConnected || !after && !(ref == null ? void 0 : ref.isConnected)) continue;
        if (after) {
          const nxt = after.nextSibling;
          c.spacer = nxt ? makeSpacer(nxt.nodeType === 1 ? nxt : after.parentElement, !nxt || nxt.nodeType !== 1, h2, label, after, pl.gap) : makeSpacer(after.parentElement, true, h2, label, null, pl.gap);
        } else c.spacer = makeSpacer(ref, end, h2, label, null, pl.gap);
      }
      const pairs = [];
      const trOf = (n) => {
        const e = el(n);
        return e ? e.localName === "tr" ? e : e.closest("tr") : null;
      };
      const headPaired = /* @__PURE__ */ new Set();
      for (const ch of list) {
        if (ch.type !== "added" && ch.type !== "deleted") continue;
        const side = ch.type === "added" ? "right" : "left";
        for (const c of ch.extra ? [ch, ...ch.extra.map((x) => ({ [side]: x.node, gap: x.gap }))] : [ch]) {
          const n = c[side];
          if ((n == null ? void 0 : n.nodeType) !== 1 || !/^(td|th)$/.test(n.localName)) continue;
          const mine = trOf(n), other = (_g = trOf((_e = c.gap) == null ? void 0 : _e.node)) != null ? _g : trOf((_f = c.gap) == null ? void 0 : _f.prev);
          if (mine && other) pairs.push(side === "right" ? [other, mine] : [mine, other]);
          const tm = n.closest("table"), to = other == null ? void 0 : other.closest("table");
          if (tm && to && !headPaired.has(tm)) {
            headPaired.add(tm);
            const hm = Array.from((_i = (_h = tm.tHead) == null ? void 0 : _h.rows) != null ? _i : []), ho = Array.from((_k = (_j = to.tHead) == null ? void 0 : _j.rows) != null ? _k : []);
            if (hm.length === ho.length) hm.forEach((r, i) => pairs.push(side === "right" ? [ho[i], r] : [r, ho[i]]));
          }
        }
      }
      for (const ch of list) {
        if (ch.type === "added" || ch.type === "deleted" || !ch.left || !ch.right) continue;
        pairs.push([unitOf(ch.left), unitOf(ch.right)]);
        for (const n of (_l = ch.alsoLeft) != null ? _l : []) pairs.push([unitOf(n), unitOf(ch.right)]);
      }
      const fixes = [];
      for (const [a, b] of pairs) {
        if (!await tick()) return;
        const f = measurePair(a, b);
        if (f) fixes.push(f);
      }
      applyFixes(fixes);
      const seen = /* @__PURE__ */ new Set(), tops = [];
      const esc2 = (v) => {
        var _a2;
        return ((_a2 = globalThis.CSS) == null ? void 0 : _a2.escape) ? CSS.escape(v) : String(v).replace(/["\\]/g, "\\$&");
      };
      for (const ch of list) {
        let a, b;
        if (ch.left && ch.right) {
          a = topUnit(ch.left, "left");
          b = topUnit(ch.right, "right");
        } else {
          const side = ch.right ? "right" : "left", other = side === "right" ? "left" : "right";
          const u = topUnit(ch[side], side);
          const key = (_m = u == null ? void 0 : u.getAttribute) == null ? void 0 : _m.call(u, "data-sgc-key");
          if (!u || !key || u === (side === "right" ? ch.right : ch.left)) continue;
          const v = root(other).querySelector(`[data-sgc-key="${esc2(key)}"]`);
          if (!v) continue;
          const inner = (_n = ch[side].nodeType === 1 ? ch[side] : ch[side].parentElement) == null ? void 0 : _n.closest("[data-sgc-key]");
          if (inner && inner !== u && u.contains(inner)) {
            const iv = v.querySelector(`[data-sgc-key="${esc2(inner.getAttribute("data-sgc-key"))}"]`);
            if (iv && !seen.has(side === "right" ? iv : inner)) {
              seen.add(side === "right" ? iv : inner);
              tops.push(side === "right" ? [iv, inner] : [inner, iv]);
            }
          }
          [a, b] = side === "right" ? [v, u] : [u, v];
        }
        if (!a || !b || seen.has(a)) continue;
        seen.add(a);
        tops.push([a, b]);
      }
      const fixes2 = [];
      for (const [a, b] of tops) {
        if (!await tick()) return;
        const f = measurePair(a, b);
        if (f) fixes2.push(f);
      }
      applyFixes(fixes2);
    }
    function measurePair(a, b) {
      if (!a || !b || a === b || !a.isConnected || !b.isConnected) return null;
      const ha = layoutHeight(a), hb = layoutHeight(b);
      if (Math.abs(ha - hb) < 0.5) return null;
      const lo = ha < hb ? a : b, diff = Math.abs(ha - hb);
      if (lo.localName === "tr") return { el: lo, prop: "height", value: Math.max(ha, hb) + "px" };
      const cs = lo.ownerDocument.defaultView.getComputedStyle(lo);
      return { el: lo, prop: "paddingBottom", value: px(cs.paddingBottom) + diff + "px" };
    }
    function applyFixes(fixes) {
      for (const { el, prop, value } of fixes) {
        padded.push([el, prop, el.style[prop], el.hasAttribute("style")]);
        el.style[prop] = value;
      }
    }
    let realignTimer = 0, realignSetup = false;
    function scheduleRealign() {
      clearTimeout(realignTimer);
      realignTimer = setTimeout(() => {
        if (destroyed || state.running || opt.align === false || !state.changes.length) return;
        alignHeights(state.changes, async () => true);
      }, 120);
    }
    function setupRealign() {
      var _a, _b, _c, _d;
      if (realignSetup) return;
      realignSetup = true;
      const docs = /* @__PURE__ */ new Set([root("left").ownerDocument, root("right").ownerDocument]);
      for (const d of docs) {
        (_b = (_a = d.fonts) == null ? void 0 : _a.addEventListener) == null ? void 0 : _b.call(_a, "loadingdone", scheduleRealign);
        (_d = (_c = d.fonts) == null ? void 0 : _c.ready) == null ? void 0 : _d.then(scheduleRealign);
      }
      const RO = root("left").ownerDocument.defaultView.ResizeObserver;
      if (RO) {
        let widths = /* @__PURE__ */ new Map();
        const ro = new RO((entries) => {
          let changed = false;
          for (const e of entries) {
            const w = Math.round(e.contentRect.width);
            if (widths.get(e.target) !== w) {
              widths.set(e.target, w);
              changed = true;
            }
          }
          if (changed) scheduleRealign();
        });
        ro.observe(root("left"));
        ro.observe(root("right"));
        observers.push(() => ro.disconnect());
      }
      observers.push(() => {
        var _a2, _b2;
        for (const d of docs) (_b2 = (_a2 = d.fonts) == null ? void 0 : _a2.removeEventListener) == null ? void 0 : _b2.call(_a2, "loadingdone", scheduleRealign);
        clearTimeout(realignTimer);
      });
    }
    async function apply(out, id) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const tick = slicer(id);
      const list = [];
      const pgL = pageIndex("left"), pgR = pageIndex("right");
      for (const c of out.changes) {
        if (!await tick()) return;
        const L = nodeOf("left", (_a = c.at) == null ? void 0 : _a.left), R = nodeOf("right", (_b = c.at) == null ? void 0 : _b.right);
        if ((c.type === "added" || c.type === "deleted") && (((_c = L.obj) == null ? void 0 : _c.virt) && !L.rest.length || ((_d = R.obj) == null ? void 0 : _d.virt) && !R.rest.length)) continue;
        const ch = {
          index: list.length,
          type: c.type,
          path: c.path,
          diffs: c.diffs,
          left: L.node,
          right: R.node,
          what: "node",
          gap: null,
          before: c.left,
          after: c.right
        };
        const field = (L.node ? L.rest : R.rest)[0];
        if (c.type === "moved") ch.what = "moved";
        else if (field === "v") ch.what = "text";
        else if (field === "a" || field === "n" || field === "k") {
          ch.what = "attr";
          ch.attr = (L.node ? L.rest : R.rest).slice(1).join(".") || field;
        } else ch.what = "node";
        if (((_e = c.at) == null ? void 0 : _e.gap) && (c.type === "added" || c.type === "deleted")) {
          const gside = c.at.gap.side;
          const p = nodeOf(gside, c.at.gap.parent);
          const kids = (_f = p.obj) == null ? void 0 : _f.c;
          if (kids) {
            const ref = kids[c.at.gap.index];
            const prev = kids[c.at.gap.index - 1];
            const refNode = ref ? snaps[gside].nodes[ref.i] : p.node;
            ch.gap = { side: gside, node: refNode, end: !ref, prev: prev ? snaps[gside].nodes[prev.i] : null };
          }
        }
        if (ch.what === "attr" || ch.what === "moved") {
          ch.left = L.node;
          ch.right = R.node;
        }
        if (ch.what === "node") ch.h = (_g = L.node ? L.obj : R.obj) == null ? void 0 : _g.h;
        ch.page = {
          left: pgL && ch.left ? pgL(ch.left) : pgL && ((_h = ch.gap) == null ? void 0 : _h.side) === "left" ? pgL(ch.gap.node) : null,
          right: pgR && ch.right ? pgR(ch.right) : pgR && ((_i = ch.gap) == null ? void 0 : _i.side) === "right" ? pgR(ch.gap.node) : null
        };
        list.push(ch);
      }
      const final = refine(list);
      for (const ch of final) ch.text = describe(ch);
      marks.left.clear();
      marks.right.clear();
      for (const ch of final) paint(ch);
      marks.left.flush();
      marks.right.flush();
      if (opt.align !== false) {
        await alignHeights(final, tick);
        setupRealign();
      }
      state.changes = final;
      state.stats = { added: 0, modified: 0, deleted: 0, moved: 0 };
      for (const ch of final) state.stats[ch.type]++;
      state.current = final.length ? Math.min(Math.max(state.current, -1), final.length - 1) : -1;
      const side = (sd) => {
        const els = snaps[sd].anchors.map((i) => snaps[sd].nodes[i]);
        if (!opt.page) return { els };
        const pages = Array.from(root(sd).querySelectorAll(opt.page));
        const idx = new Map(pages.map((p, i) => [p, i]));
        const pageOf = new Int32Array(els.length).fill(-1);
        const start = new Int32Array(pages.length + 1);
        let cur = -1;
        els.forEach((el, k) => {
          var _a2;
          const pg = el.closest(opt.page);
          const p = pg ? (_a2 = idx.get(pg)) != null ? _a2 : cur : cur;
          pageOf[k] = p;
          if (p > cur) {
            for (let q = cur + 1; q <= p; q++) start[q] = k;
            cur = p;
          }
        });
        for (let q = cur + 1; q <= pages.length; q++) start[q] = els.length;
        return { els, pages, start, pageOf };
      };
      const pairL = new Int32Array(snaps.left.anchors.length).fill(-1), pairR = new Int32Array(snaps.right.anchors.length).fill(-1);
      const ap = out.anchorPairs;
      for (let k = 0; k < ap.length; k += 2) {
        pairL[ap[k]] = ap[k + 1];
        pairR[ap[k + 1]] = ap[k];
      }
      const A = side("left"), B = side("right");
      const pagePair = (X, Y, pair) => {
        if (!X.pages || !Y.pages) return null;
        const pp = new Int32Array(X.pages.length).fill(-1);
        for (let p = 0; p < X.pages.length; p++) {
          for (let k = X.start[p]; k < X.start[p + 1]; k++) {
            if (pair[k] >= 0) {
              pp[p] = Y.pageOf[pair[k]];
              break;
            }
          }
        }
        for (let p = 0; p < pp.length; p++) if (pp[p] < 0) pp[p] = Math.min(p, Y.pages.length - 1);
        return pp;
      };
      A.pagePair = pagePair(A, B, pairL);
      B.pagePair = pagePair(B, A, pairR);
      anchors = { left: A, right: B, pairL, pairR };
    }
    function paint(ch) {
      var _a, _b;
      const t = ch.type;
      if (ch.extra) {
        const side = t === "added" ? "right" : "left";
        for (const x of ch.extra) {
          paint({ ...ch, extra: null, what: "node", [side]: x.node, gap: x.gap });
        }
        return paint({ ...ch, extra: null, what: "node" });
      }
      if (ch.what === "text" && t === "modified" && ch.diffs) {
        for (const n of (_a = ch.alsoLeft) != null ? _a : []) {
          if (n.nodeType === 3) for (const [s0, e0] of sideSpans(ch.diffs, "left")) marks.left.textRange(n, s0, e0, "del");
          if (n.nodeType === 1) marks.left.attr(n, "data-sgc", "modified");
        }
        if (ch.span) for (const side of ["left", "right"]) {
          const n = ch.span[side];
          if ((n == null ? void 0 : n.nodeType) === 1) marks[side].attr(n, "data-sgc", "modified");
        }
        for (const side of ["left", "right"]) {
          const tn = ch[side];
          if (!tn) continue;
          for (const [s, e] of sideSpans(ch.diffs, side)) marks[side].textRange(tn, s, e, side === "left" ? "del" : "ins");
          if (!hasHighlightApi(tn.ownerDocument.defaultView)) marks[side].attr(blockOf(tn), "data-sgc", "modified");
        }
        return;
      }
      if (ch.what !== "attr" && (t === "added" || t === "deleted")) {
        const side = t === "added" ? "right" : "left";
        const n = ch[side];
        if (n) {
          if (n.nodeType === 3) {
            marks[side].wholeText(n, t === "added" ? "add" : "del");
            if (!hasHighlightApi(n.ownerDocument.defaultView)) marks[side].attr(n.parentElement, "data-sgc", t);
          } else {
            marks[side].attr(n, "data-sgc", t);
          }
        }
        const isCell = (n == null ? void 0 : n.nodeType) === 1 && (n.localName === "td" || n.localName === "th");
        if (((_b = ch.gap) == null ? void 0 : _b.node) && !isCell && opt.align === false) {
          const g = ch.gap.node.nodeType === 1 ? ch.gap.node : ch.gap.node.parentElement;
          marks[ch.gap.side].attr(g, "data-sgc-gap", ch.gap.end ? "end" : "before");
          marks[ch.gap.side].attr(g, "data-sgc-side", ch.gap.side);
        }
        return;
      }
      const status = t === "moved" ? "moved" : "modified";
      for (const side of ["left", "right"]) {
        const n = ch[side];
        if (!n) continue;
        marks[side].attr(n.nodeType === 1 ? n : n.parentElement, "data-sgc", status);
      }
    }
    function snippet(node, max = 90) {
      if (!node) return "";
      if (node.nodeType === 3) return clip(normText(node.data), max);
      if (node.localName === "img") return `[${node.getAttribute("alt") || node.getAttribute("src") || "img"}]`;
      return clip(textOfNode(node, max * 2), max) || `<${node.localName}>`;
    }
    function describe(ch) {
      var _a, _b;
      if (ch.what === "text" && ch.diffs) return { diffs: trimDiffs(ch.diffs), ...ch.span ? { span: { attr: ch.span.attr, before: ch.span.before, after: ch.span.after } } : {} };
      if (ch.what === "attr") return { attr: ch.attr, before: ch.before, after: ch.after, context: snippet((_a = ch.right) != null ? _a : ch.left, 60) };
      if (ch.what === "moved") return { context: snippet((_b = ch.right) != null ? _b : ch.left) };
      if (ch.what === "column") {
        const n = ch.type === "added" ? ch.right : ch.left;
        return { column: ch.count, context: snippet(n, 40) };
      }
      return { context: snippet(ch.type === "deleted" ? ch.left : ch.right) };
    }
    function elOf(n) {
      return n ? n.nodeType === 1 ? n : n.parentElement : null;
    }
    let focusTimer = 0;
    const focused = [];
    let goToken = 0;
    async function goTo(i, { smooth = true } = {}) {
      var _a, _b, _c, _d, _e, _f;
      if (!state.changes.length) return;
      i = (i % state.changes.length + state.changes.length) % state.changes.length;
      state.current = i;
      const ch = state.changes[i];
      const token = ++goToken;
      if (!scrollers.left) setupScroll();
      link == null ? void 0 : link.pause(2e3);
      clearTimeout(focusTimer);
      marks.left.setFocus([]);
      marks.right.setFocus([]);
      for (const el of focused) el.removeAttribute("data-sgc-focus");
      focused.length = 0;
      emit("focus", ch);
      const targetOf = (side) => {
        var _a2, _b2, _c2, _d2;
        let el = elOf(ch[side]);
        if (!el && ((_a2 = ch.gap) == null ? void 0 : _a2.side) === side) el = (_c2 = ((_b2 = ch.spacer) == null ? void 0 : _b2.isConnected) ? ch.spacer : null) != null ? _c2 : elOf(ch.gap.node);
        if (!el) return null;
        return ch.what === "text" ? (_d2 = blockOf(ch[side])) != null ? _d2 : el : el;
      };
      const keys = [];
      for (const side of ["left", "right"]) {
        const t = targetOf(side);
        const k = pageNo(t, side);
        if (k >= 0) keys.push(`${side}:${k}`, `${side}:${k - 1}`);
      }
      let sides = ["left", "right"].map((side) => ({ side, block: targetOf(side) })).filter((x) => x.block);
      if (sides.length > 1 && scrollers.left.target === scrollers.right.target) sides = [(_a = sides.find((x) => x.side === "right")) != null ? _a : sides[0]];
      const reduce = !!((_b = globalThis.matchMedia) == null ? void 0 : _b.call(globalThis, "(prefers-reduced-motion: reduce)").matches);
      const soft = smooth && !reduce;
      let userMoved = false;
      const stopper = () => {
        userMoved = true;
      };
      const docsSet = new Set(sides.map(({ side }) => root(side).ownerDocument));
      for (const d of docsSet) for (const ev of ["wheel", "touchstart", "keydown", "mousedown"]) d.addEventListener(ev, stopper, { passive: true, capture: true });
      const offBy = (sc, block) => {
        const want = sc.top + (topIn(block, sc.doc) - sc.viewTop()) - sc.height() * 0.3;
        return Math.max(0, Math.min(want, sc.max())) - sc.top;
      };
      const settle = (sc) => new Promise((res) => {
        const t = sc.target;
        let last = sc.top, same = 0, done = false;
        const finish = () => {
          if (done) return;
          done = true;
          t.removeEventListener("scrollend", finish);
          res();
        };
        t.addEventListener("scrollend", finish, { once: true });
        const until = performance.now() + 1500;
        const tick = () => {
          if (done) return;
          const now2 = sc.top;
          same = Math.abs(now2 - last) < 0.5 ? same + 1 : 0;
          last = now2;
          if (same >= 4 || performance.now() > until || userMoved) return finish();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      for (const { side, block } of sides) {
        let el = block;
        const rootDoc = root(side).ownerDocument;
        for (let k = 0; el && el.ownerDocument !== rootDoc && k < 20; k++) {
          const w = el.ownerDocument.defaultView;
          if (!w) break;
          const se = (_c = el.ownerDocument.scrollingElement) != null ? _c : el.ownerDocument.documentElement;
          if (se.scrollHeight > w.innerHeight + 1) {
            const want = se.scrollTop + el.getBoundingClientRect().top - w.innerHeight * 0.3;
            w.scrollTo({ top: Math.max(0, want), behavior: "instant" });
          }
          el = w.frameElement;
        }
      }
      let glide = null;
      try {
        if (soft) {
          const clampTo = (sc, v) => Math.max(0, Math.min(v, sc.max()));
          const items = sides.map(({ side }) => {
            var _a2, _b2, _c2;
            const sc = scrollers[side];
            const b0 = targetOf(side);
            return { side, sc, from: sc.top, dest: null, seen: 0, pg: opt.page ? (_c2 = (_b2 = (_a2 = hostEl(b0, side)) == null ? void 0 : _a2.closest) == null ? void 0 : _b2.call(_a2, opt.page)) != null ? _c2 : null : null };
          });
          const aim = (it) => {
            const sc = it.sc, vh = sc.height();
            const block = targetOf(it.side);
            if (!(block == null ? void 0 : block.isConnected)) return it.dest;
            if (it.pg) {
              const top = topIn(it.pg, sc.doc) - sc.viewTop();
              const ph = it.pg.getBoundingClientRect().height;
              const inView = top < vh && top + ph > 0;
              it.seen = inView ? it.seen + 1 : 0;
              if (it.seen >= 2) {
                const bt = topIn(block, sc.doc) - sc.viewTop();
                if (bt >= top - 2 && bt <= top + ph + 2) return sc.top + offBy(sc, block);
              }
              return clampTo(sc, sc.top + top - vh * 0.15);
            }
            return sc.top + offBy(sc, block);
          };
          const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const easeOut = (t) => 1 - Math.pow(1 - t, 3);
          const begin = (it, d, now2, main) => {
            const from = it.sc.top, dist = Math.abs(d - from), vh = Math.max(1, it.sc.height());
            it.seg = main ? { from, t0: now2, T: Math.min(700, 380 + 110 * Math.log2(1 + dist / vh)), fn: easeInOut } : { from, t0: now2, T: Math.min(480, 220 + dist * 0.3), fn: easeOut };
            if (dist > vh * 4) {
              it.seg.warp = vh * 1.5;
              it.seg.dir = Math.sign(d - from);
              it.seg.fn = easeInOut;
              it.seg.T = Math.max(it.seg.T, 500);
            }
            it.dest = d;
            it.done = false;
          };
          glide = async (main) => {
            let moved = false, asked = false;
            flying = true;
            try {
              for (let n = 0; n < 600; n++) {
                const now2 = await new Promise((r) => requestAnimationFrame(r));
                if (token !== goToken || userMoved) return moved;
                let busy = false;
                for (const it of items) {
                  const d = aim(it);
                  if (d === null) continue;
                  if (!asked && it.seen >= 1 && keys.length) {
                    asked = true;
                    ensureAligned(keys);
                  }
                  if (!it.seg || it.done) {
                    if (Math.abs(d - it.sc.top) > 2) begin(it, d, now2, main && !it.seg);
                    else {
                      it.done = true;
                      continue;
                    }
                  } else if (Math.abs(d - it.dest) > 1) {
                    const g0 = it.seg;
                    if (g0.warp && g0.warp * 2 * g0.fn(Math.min(1, (now2 - g0.t0) / g0.T)) <= g0.warp) it.dest = d;
                    else begin(it, d, now2, false);
                  }
                  const g = it.seg, t = Math.min(1, (now2 - g.t0) / g.T);
                  let v;
                  if (g.warp) {
                    const vp = g.warp * 2 * g.fn(t);
                    v = vp <= g.warp ? g.from + g.dir * vp : it.dest - g.dir * (g.warp * 2 - vp);
                  } else v = g.from + (it.dest - g.from) * g.fn(t);
                  v = clampTo(it.sc, v);
                  const tg = it.sc.target;
                  if (tg.scrollTo) tg.scrollTo({ top: v, behavior: "instant" });
                  else it.sc.top = v;
                  moved = true;
                  if (t >= 1) it.done = true;
                  else busy = true;
                }
                if (!busy) break;
              }
            } finally {
              flying = false;
              afterFlight();
            }
            return moved;
          };
          link == null ? void 0 : link.pause(2500);
          await glide(true);
          if (token !== goToken) return;
        } else if (opt.page) {
          let movedToPage = false;
          for (const { side, block } of sides) {
            const pg = (_e = (_d = hostEl(block, side)) == null ? void 0 : _d.closest) == null ? void 0 : _e.call(_d, opt.page);
            if (!pg) continue;
            const sc = scrollers[side];
            const d = topIn(pg, sc.doc) - sc.viewTop();
            if (d > sc.height() * 1.5 || d + pg.getBoundingClientRect().height < -sc.height() * 0.5) {
              const v = Math.max(0, Math.min(sc.top + d - sc.height() * 0.15, sc.max()));
              const t = sc.target;
              if (t.scrollTo) t.scrollTo({ top: v, behavior: "instant" });
              else sc.top = v;
              movedToPage = true;
            }
          }
          if (movedToPage) {
            link == null ? void 0 : link.pause(2e3);
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            if (token !== goToken) return;
          }
        }
        if (keys.length) await ensureAligned(keys);
        if (token !== goToken) return;
        for (let round = 0; round < 7 && !userMoved; round++) {
          if (keys.length) await ensureAligned(keys);
          if (token !== goToken) return;
          sides = sides.map(({ side }) => ({ side, block: targetOf(side) })).filter((x) => x.block);
          const off = sides.filter(({ block }) => block.isConnected).map(({ side, block }) => [scrollers[side], block, offBy(scrollers[side], block)]).filter((x) => Math.abs(x[2]) > 2);
          if (!off.length) break;
          link == null ? void 0 : link.pause(2e3);
          if (glide) {
            if (!await glide(false)) break;
          } else {
            for (const [sc, block] of off) scrollIntoScroller(sc, block, 0.3, false);
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          }
          if (token !== goToken) return;
        }
      } finally {
        for (const d of docsSet) for (const ev of ["wheel", "touchstart", "keydown", "mousedown"]) d.removeEventListener(ev, stopper, { capture: true });
      }
      if (token !== goToken) return;
      for (const { side, block } of sides.length ? sides : []) {
        block.setAttribute("data-sgc-focus", "");
        focused.push(block);
      }
      for (const side of ["left", "right"]) {
        const fr = [];
        if (((_f = ch[side]) == null ? void 0 : _f.nodeType) === 3 && ch[side].isConnected) fr.push(wholeRange(ch[side]));
        marks[side].setFocus(fr);
      }
      if (scrollers.left.target === scrollers.right.target) {
        for (const side of ["left", "right"]) {
          const other = targetOf(side);
          if (other && !focused.includes(other)) {
            other.setAttribute("data-sgc-focus", "");
            focused.push(other);
          }
        }
      }
      link == null ? void 0 : link.pause(250);
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        for (const el of focused) el.removeAttribute("data-sgc-focus");
        focused.length = 0;
        marks.left.setFocus([]);
        marks.right.setFocus([]);
      }, 1800);
    }
    function step(d) {
      const vis = visible();
      if (!vis.length) return;
      const pos = vis.findIndex((c) => c.index === state.current);
      const next = pos < 0 ? d > 0 ? vis[0] : vis[vis.length - 1] : vis[(pos + d + vis.length) % vis.length];
      goTo(next.index);
    }
    const visible = () => state.filter ? state.changes.filter((c) => c.type === state.filter) : state.changes;
    function watch() {
      unwatch();
      const kick = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(run, opt.debounce);
      };
      for (const side of ["left", "right"]) {
        const r = root(side);
        const isOurs = (n) => {
          var _a;
          return n.nodeType === 1 && ((_a = n.classList) == null ? void 0 : _a.contains("sgc-spacer"));
        };
        const mo = new r.ownerDocument.defaultView.MutationObserver((recs) => {
          const real = recs.some((m) => {
            var _a, _b;
            return m.type !== "childList" ? !((_b = (_a = m.target.nodeType === 1 ? m.target : m.target.parentElement) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, ".sgc-spacer")) : [...m.addedNodes, ...m.removedNodes].some((n) => !isOurs(n));
          });
          if (real) kick();
        });
        mo.observe(r, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...opt.attrs, "data-sgc-key", "data-key", "hidden", "data-sgc-ignore"] });
        r.addEventListener("input", kick, true);
        r.addEventListener("change", kick, true);
        observers.push(() => {
          mo.disconnect();
          r.removeEventListener("input", kick, true);
          r.removeEventListener("change", kick, true);
        });
      }
    }
    function unwatch() {
      for (const f of observers) f();
      observers = [];
      watchedFrames = /* @__PURE__ */ new WeakSet();
    }
    let watchedFrames = /* @__PURE__ */ new WeakSet();
    function watchFrames(frames) {
      var _a, _b;
      if (!opt.watch || destroyed) return;
      const kick = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(run, opt.debounce);
      };
      for (const f of frames) {
        const body = (_a = f.contentDocument) == null ? void 0 : _a.body;
        if (!body || watchedFrames.has(body)) continue;
        watchedFrames.add(body);
        const MO = (_b = f.contentWindow) == null ? void 0 : _b.MutationObserver;
        if (!MO) continue;
        const mo = new MO((recs) => {
          const real = recs.some((m) => {
            var _a2, _b2;
            return m.type !== "childList" ? !((_b2 = (_a2 = m.target.nodeType === 1 ? m.target : m.target.parentElement) == null ? void 0 : _a2.closest) == null ? void 0 : _b2.call(_a2, ".sgc-spacer")) : [...m.addedNodes, ...m.removedNodes].some((n) => {
              var _a3;
              return !(n.nodeType === 1 && ((_a3 = n.classList) == null ? void 0 : _a3.contains("sgc-spacer")));
            });
          });
          if (real) kick();
        });
        mo.observe(body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...opt.attrs, "data-sgc-key", "data-key", "hidden", "data-sgc-ignore"] });
        body.addEventListener("input", kick, true);
        body.addEventListener("change", kick, true);
        f.addEventListener("load", kick);
        observers.push(() => {
          mo.disconnect();
          try {
            body.removeEventListener("input", kick, true);
            body.removeEventListener("change", kick, true);
          } catch {
          }
          f.removeEventListener("load", kick);
        });
      }
    }
    function renderRedline(target) {
      var _a;
      if (!snaps) throw new Error("[sg-compare] run() \uC774 \uB05D\uB09C \uB4A4\uC5D0 \uBD80\uB974\uC138\uC694");
      const R = root("right");
      const doc = target.ownerDocument;
      ensureMarkStyle(doc, name + "x");
      const clone = doc.importNode(R, true);
      const cloneOf = /* @__PURE__ */ new Map();
      const pairUp = (x, y) => {
        const st = [[x, y]];
        while (st.length) {
          const [p, q] = st.pop();
          cloneOf.set(p, q);
          const pc = p.childNodes, qc = q.childNodes;
          for (let i = 0; i < pc.length && i < qc.length; i++) st.push([pc[i], qc[i]]);
        }
      };
      pairUp(R, clone);
      const fillFrames = (srcRoot) => {
        if (opt.frames === false) return;
        for (const f of srcRoot.querySelectorAll("iframe,frame")) {
          const body = frameBody(f), t = cloneOf.get(f);
          if (!body || !t) continue;
          const box = doc.createElement("div");
          box.setAttribute("data-sgc-frame", "");
          for (const kid of body.childNodes) {
            const k = doc.importNode(kid, true);
            box.appendChild(k);
            pairUp(kid, k);
          }
          cloneOf.set(body, box);
          t.replaceWith(box);
          cloneOf.set(f, box);
          fillFrames(body);
        }
      };
      fillFrames(R);
      for (const [el, prop, old] of padded) {
        const c = cloneOf.get(el);
        if (c == null ? void 0 : c.style) c.style[prop] = old;
      }
      for (const [el, cv, cis] of virt) {
        const c = cloneOf.get(el);
        if (c == null ? void 0 : c.style) {
          c.style.contentVisibility = cv;
          c.style.containIntrinsicSize = cis;
        }
      }
      for (const sp of clone.querySelectorAll(".sgc-spacer")) sp.remove();
      const inserts = [];
      const flatList = state.changes.flatMap((c) => !c.extra ? [c] : [
        { ...c, what: "node" },
        ...c.extra.map((x) => ({ ...c, what: "node", [c.type === "added" ? "right" : "left"]: x.node, gap: x.gap }))
      ]);
      for (const ch of flatList) {
        if (ch.what === "text" && ch.type === "modified" && ch.diffs && ch.right) {
          const tn = cloneOf.get(ch.right);
          if (!(tn == null ? void 0 : tn.parentNode)) continue;
          const frag = doc.createDocumentFragment();
          for (const [op, t] of ch.diffs) {
            if (op === 0) frag.append(t);
            else {
              const e = doc.createElement(op < 0 ? "del" : "ins");
              e.className = op < 0 ? "sgc-del" : "sgc-ins";
              e.textContent = t;
              frag.append(e);
            }
          }
          const lead = /^\s/.test(tn.data) ? " " : "", trail = /\s$/.test(tn.data) ? " " : "";
          if (lead) frag.prepend(lead);
          if (trail) frag.append(trail);
          tn.replaceWith(frag);
        } else if (ch.what === "attr" || ch.type === "moved") {
          const n = ch.right ? cloneOf.get(ch.right) : null;
          const el = (n == null ? void 0 : n.nodeType) === 1 ? n : n == null ? void 0 : n.parentElement;
          el == null ? void 0 : el.setAttribute("data-sgc", ch.type === "moved" ? "moved" : "modified");
        } else if (ch.type === "added" && ch.right) {
          const n = cloneOf.get(ch.right);
          if (!n) continue;
          if (n.nodeType === 3) {
            const e = doc.createElement("ins");
            e.className = "sgc-add";
            n.replaceWith(e);
            e.append(n);
          } else n.setAttribute("data-sgc", "added");
        } else if (ch.type === "deleted" && ch.left && ch.gap) {
          let n = doc.importNode(ch.left, true);
          if (n.nodeType === 3) {
            const e = doc.createElement("del");
            e.className = "sgc-del";
            e.append(n);
            n = e;
          } else n.setAttribute("data-sgc", "deleted");
          inserts.push({ ref: cloneOf.get(ch.gap.node), end: ch.gap.end, n });
        }
      }
      for (const { ref, end, n } of inserts) {
        if (!ref) continue;
        if (end) ref.appendChild(n);
        else (_a = ref.parentNode) == null ? void 0 : _a.insertBefore(n, ref);
      }
      let out = clone;
      if (clone.localName === "body") {
        out = doc.createElement("div");
        out.className = clone.className;
        out.append(...clone.childNodes);
      }
      out.setAttribute("data-sgc-redline", "");
      target.replaceChildren(out);
      return out;
    }
    const api = {
      get changes() {
        return state.changes;
      },
      get visibleChanges() {
        return visible();
      },
      get stats() {
        return state.stats;
      },
      get timing() {
        return state.timing;
      },
      get current() {
        return state.current;
      },
      get running() {
        return state.running;
      },
      get error() {
        return state.error;
      },
      get filter() {
        return state.filter;
      },
      get pages() {
        return state.pages;
      },
      get syncScroll() {
        return link ? link.enabled : false;
      },
      /** 두 문서가 한 스크롤 영역 안에 있음 (늘 함께 움직임 → 스크롤 맞춤 버튼 필요 없음) */
      get sharedScroll() {
        if (!scrollers.left) setupScroll();
        return scrollers.left.target === scrollers.right.target;
      },
      set syncScroll(v) {
        if (link) link.enabled = v;
        updateScrollbar();
        emit("sync", !!v);
      },
      setFilter(type) {
        state.filter = type && state.filter !== type ? type : null;
        emit("filter", state.filter);
      },
      run,
      goTo,
      next: () => step(1),
      prev: () => step(-1),
      renderRedline,
      on(ev, f) {
        if (!listeners.has(ev)) listeners.set(ev, []);
        listeners.get(ev).push(f);
        return () => api.off(ev, f);
      },
      off(ev, f) {
        const l = listeners.get(ev);
        if (l) l.splice(l.indexOf(f) >>> 0, 1);
      },
      clear() {
        unalign();
        marks.left.clear();
        marks.right.clear();
        state.changes = [];
        emit("update", api);
      },
      destroy() {
        var _a;
        destroyed = true;
        runId++;
        cancelJob(job.id);
        clearTimeout(debounceTimer);
        clearTimeout(focusTimer);
        unwatch();
        link == null ? void 0 : link.destroy();
        unalign();
        unvirtualize();
        try {
          const sc = scrollers.left;
          (_a = (sc == null ? void 0 : sc.target.nodeType) === 1 ? sc.target : sc == null ? void 0 : sc.doc.documentElement) == null ? void 0 : _a.removeAttribute("data-sgc-noscrollbar");
        } catch {
        }
        marks.left.clear();
        marks.right.clear();
        listeners.clear();
      }
    };
    if (opt.watch) watch();
    if (opt.auto !== false) queueMicrotask(run);
    return api;
  }
  function textOfNode(node, max) {
    const w = node.ownerDocument.createTreeWalker(node, 4);
    let out = "";
    for (let t = w.nextNode(); t && out.length < max; t = w.nextNode()) {
      const p = t.parentElement;
      if (p && p.closest("script,style,[data-sgc-ignore]")) continue;
      const v = normText(t.data);
      if (v) out += (out ? " " : "") + v;
    }
    return out;
  }
  var clip = (s, n) => s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
  function trimDiffs(diffs, ctx = 28) {
    return diffs.map(([op, t], k) => {
      if (op !== 0) return [op, clip(t, 120)];
      if (k === 0) return [0, t.length > ctx ? "\u2026" + t.slice(-ctx) : t];
      if (k === diffs.length - 1) return [0, t.length > ctx ? t.slice(0, ctx) + "\u2026" : t];
      return [0, t.length > ctx * 2 ? t.slice(0, ctx) + " \u2026 " + t.slice(-ctx) : t];
    });
  }

  // src/ui.js
  var TYPES = ["added", "modified", "deleted", "moved"];
  function ensureUiStyle(doc = document, nonce) {
    var _a;
    if (nonce) styleConfig.nonce = nonce;
    if (doc.getElementById("sgc-ui-style")) return;
    const st = doc.createElement("style");
    st.id = "sgc-ui-style";
    applyNonce(st);
    st.textContent = UI_CSS;
    ((_a = doc.head) != null ? _a : doc.documentElement).appendChild(st);
  }
  var h = (doc, tag, attrs = {}, ...kids) => {
    const e = doc.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === void 0 || v === null || v === false) continue;
      if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (k === "class") e.className = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k !== null && k !== void 0 && k !== false) e.append(k);
    return e;
  };
  var fmt = (n, locale) => n.toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
  function mountToolbar(el, ctrl, o = {}) {
    var _a;
    const doc = el.ownerDocument;
    ensureUiStyle(doc, o.nonce);
    const m = getMessages(o.locale, o.labels);
    let mode = (_a = o.mode) != null ? _a : "side";
    el.classList.add("sgc-toolbar");
    function render() {
      const s = ctrl.stats, t = ctrl.timing, vis = ctrl.visibleChanges;
      const pos = vis.findIndex((c) => c.index === ctrl.current);
      el.replaceChildren(
        h(
          doc,
          "div",
          { class: "sgc-tb-stats", role: "group", "aria-label": m.changes },
          TYPES.map((tp) => h(doc, "button", {
            type: "button",
            class: `sgc-chip sgc-chip-${tp}`,
            "aria-pressed": ctrl.filter === tp ? "true" : "false",
            title: m.filterHint,
            disabled: !s[tp] && ctrl.filter !== tp,
            onclick: () => ctrl.setFilter(tp)
          }, h(doc, "span", { class: "sgc-dot", "aria-hidden": "true" }), m[tp], h(doc, "b", {}, fmt(s[tp], o.locale))))
        ),
        h(
          doc,
          "div",
          { class: "sgc-tb-nav" },
          h(doc, "button", { type: "button", class: "sgc-btn", onclick: () => ctrl.prev(), disabled: !vis.length, "aria-label": m.prev, title: `${m.prev} (Shift+F7)` }, "\u2191"),
          h(
            doc,
            "span",
            { class: "sgc-pos", "aria-live": "polite" },
            vis.length ? `${pos >= 0 ? fmt(pos + 1, o.locale) : "\u2013"} / ${fmt(vis.length, o.locale)}` : ctrl.running ? m.running : m.noChanges
          ),
          h(doc, "button", { type: "button", class: "sgc-btn", onclick: () => ctrl.next(), disabled: !vis.length, "aria-label": m.next, title: `${m.next} (F7)` }, "\u2193")
        ),
        h(
          doc,
          "div",
          { class: "sgc-tb-right" },
          o.modes ? h(
            doc,
            "div",
            { class: "sgc-seg", role: "group" },
            ["side", "redline"].map((md) => h(doc, "button", {
              type: "button",
              "aria-pressed": mode === md ? "true" : "false",
              onclick: () => {
                var _a2;
                mode = md;
                (_a2 = o.onMode) == null ? void 0 : _a2.call(o, md);
                render();
              }
            }, m[md]))
          ) : null,
          mode === "side" && !ctrl.sharedScroll ? h(
            doc,
            "label",
            { class: "sgc-switch" },
            h(doc, "input", { type: "checkbox", checked: ctrl.syncScroll, onchange: (e) => {
              ctrl.syncScroll = e.target.checked;
            } }),
            h(doc, "span", {}, m.sync)
          ) : null,
          t ? h(doc, "span", { class: "sgc-time", title: timingTitle(t, m) }, m.took((t.total / 1e3).toFixed(2))) : null
        )
      );
    }
    const offs = ["update", "filter", "focus", "start", "sync"].map((ev) => ctrl.on(ev, render));
    const key = (e) => {
      var _a2;
      if (e.key !== "F7") return;
      const bars = Array.from(doc.querySelectorAll(".sgc-toolbar"));
      if (bars.length > 1) {
        const scope = (b) => {
          var _a3, _b;
          return (_b = (_a3 = b.closest(".sgc-viewer")) != null ? _a3 : b.parentElement) != null ? _b : b;
        };
        const act = doc.activeElement;
        const owner = (_a2 = bars.find((b) => act && act !== doc.body && scope(b).contains(act))) != null ? _a2 : bars[0];
        if (owner !== el) return;
      }
      e.preventDefault();
      e.shiftKey ? ctrl.prev() : ctrl.next();
    };
    doc.addEventListener("keydown", key);
    render();
    return {
      setMode(md) {
        mode = md;
        render();
      },
      destroy() {
        offs.forEach((f) => f());
        doc.removeEventListener("keydown", key);
        el.replaceChildren();
        el.classList.remove("sgc-toolbar");
      }
    };
  }
  function timingTitle(t, m) {
    return `${m.nodes}: ${t.nodes.toLocaleString()} \xB7 snapshot ${t.snapshot.toFixed(0)}ms \xB7 compare ${t.compare.toFixed(0)}ms${t.worker ? " (worker)" : ""} \xB7 paint ${t.paint.toFixed(0)}ms`;
  }
  function mountChangeList(el, ctrl, o = {}) {
    var _a;
    const doc = el.ownerDocument;
    ensureUiStyle(doc, o.nonce);
    const m = getMessages(o.locale, o.labels);
    el.classList.add("sgc-list");
    const PAGE = (_a = o.max) != null ? _a : 300;
    let shown = PAGE;
    const head = h(doc, "div", { class: "sgc-list-head" });
    const ul = h(doc, "ol", { class: "sgc-list-items" });
    el.replaceChildren(head, ul);
    function item(c) {
      var _a2, _b, _c, _d, _e, _f, _g;
      const where = [];
      if (c.page.left || c.page.right) {
        const p = (_a2 = c.page.right) != null ? _a2 : c.page.left;
        where.push(m.page(p));
      }
      const body = [];
      if (c.text.diffs) {
        body.push(h(doc, "span", { class: "sgc-li-diff" }, c.text.diffs.map(([op, t]) => op === 0 ? t : h(doc, op < 0 ? "del" : "ins", {}, t))));
        if (c.text.span) {
          const an = String((_b = c.text.span.attr) != null ? _b : "").split(", ").map((a) => {
            var _a3, _b2;
            return (_b2 = (_a3 = m.attrNames) == null ? void 0 : _a3[a]) != null ? _b2 : a;
          }).join(", ");
          body.push(h(doc, "span", { class: "sgc-li-attr" }, `${an}: `, h(doc, "del", {}, String((_c = c.text.span.before) != null ? _c : "")), " \u2192 ", h(doc, "ins", {}, String((_d = c.text.span.after) != null ? _d : ""))));
        }
      } else if (c.what === "attr") {
        const an = String((_e = c.text.attr) != null ? _e : "").split(", ").map((a) => {
          var _a3, _b2;
          return (_b2 = (_a3 = m.attrNames) == null ? void 0 : _a3[a]) != null ? _b2 : a;
        }).join(", ");
        body.push(h(doc, "span", { class: "sgc-li-ctx" }, c.text.context || ""));
        body.push(h(doc, "span", { class: "sgc-li-attr" }, `${an}: `, h(doc, "del", {}, String((_f = c.text.before) != null ? _f : "")), " \u2192 ", h(doc, "ins", {}, String((_g = c.text.after) != null ? _g : ""))));
      } else if (c.what === "column") {
        body.push(h(doc, "span", { class: "sgc-li-ctx" }, `${m.column(c.text.column)} \xB7 ${c.text.context || ""}`));
      } else {
        body.push(h(doc, "span", { class: "sgc-li-ctx" }, c.text.context || m.empty));
      }
      return h(
        doc,
        "li",
        {},
        h(
          doc,
          "button",
          {
            type: "button",
            class: "sgc-li",
            "data-type": c.type,
            "aria-current": c.index === ctrl.current ? "true" : null,
            onclick: () => ctrl.goTo(c.index)
          },
          h(
            doc,
            "span",
            { class: "sgc-li-top" },
            h(doc, "span", { class: `sgc-tag sgc-tag-${c.type}` }, m[c.type]),
            where.length ? h(doc, "span", { class: "sgc-li-where" }, where.join(" \xB7 ")) : null,
            h(doc, "span", { class: "sgc-li-no" }, `#${c.index + 1}`)
          ),
          h(doc, "span", { class: "sgc-li-body" }, body)
        )
      );
    }
    function render() {
      var _a2;
      const vis = ctrl.visibleChanges;
      head.replaceChildren(
        h(doc, "strong", {}, m.changes),
        h(doc, "span", { class: "sgc-muted" }, ctrl.running ? m.running : `${fmt(vis.length, o.locale)}${ctrl.filter ? ` \xB7 ${m[ctrl.filter]}` : ""}`)
      );
      if (!vis.length) {
        ul.replaceChildren(h(doc, "li", { class: "sgc-empty" }, ctrl.running ? m.running : ctrl.error ? String((_a2 = ctrl.error.message) != null ? _a2 : ctrl.error) : m.noChanges));
        return;
      }
      const items = vis.slice(0, shown).map(item);
      if (vis.length > shown) {
        items.push(h(doc, "li", { class: "sgc-more" }, h(doc, "button", { type: "button", class: "sgc-btn sgc-btn-wide", onclick: () => {
          shown += PAGE * 3;
          render();
        } }, m.more(vis.length - shown))));
      }
      ul.replaceChildren(...items);
    }
    function onFocus(c) {
      var _a2;
      for (const b of ul.querySelectorAll("[aria-current]")) b.removeAttribute("aria-current");
      const vis = ctrl.visibleChanges;
      const pos = vis.findIndex((x) => x.index === c.index);
      if (pos >= shown) {
        shown = pos + PAGE;
        render();
      }
      const btn = (_a2 = ul.children[pos]) == null ? void 0 : _a2.querySelector("button");
      if (btn) {
        btn.setAttribute("aria-current", "true");
        btn.scrollIntoView({ block: "nearest" });
      }
    }
    const offs = [ctrl.on("update", () => {
      shown = PAGE;
      render();
    }), ctrl.on("filter", () => {
      shown = PAGE;
      render();
    }), ctrl.on("start", render), ctrl.on("focus", onFocus)];
    render();
    return { destroy() {
      offs.forEach((f) => f());
      el.replaceChildren();
      el.classList.remove("sgc-list");
    } };
  }
  function safeUrl(doc, url2) {
    var _a;
    let u;
    try {
      u = new URL(String(url2), doc.baseURI);
    } catch {
      throw new Error(`[sg-compare] \uC8FC\uC18C\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: ${url2}`);
    }
    const here = (_a = doc.defaultView) == null ? void 0 : _a.location;
    if (!["http:", "https:", "file:", "blob:"].includes(u.protocol)) throw new Error(`[sg-compare] \uC774 \uC8FC\uC18C\uB294 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4 (http/https \uB9CC \uAC00\uB2A5): ${u.protocol}`);
    if ((u.protocol === "http:" || u.protocol === "https:") && here && /^https?:$/.test(here.protocol) && u.origin !== here.origin) {
      throw new Error(`[sg-compare] \uB2E4\uB978 \uB3C4\uBA54\uC778 \uD654\uBA74\uC740 \uBE44\uAD50\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4 (${u.origin}). \uAC19\uC740 \uB3C4\uBA54\uC778 \uC8FC\uC18C\uB85C \uC5F4\uB9AC\uAC8C \uD574 \uC8FC\uC138\uC694 (\uB9AC\uBC84\uC2A4 \uD504\uB85D\uC2DC \uB4F1)`);
    }
    return u.href;
  }
  function mountLayout(host, o = {}) {
    var _a, _b;
    const doc = host.ownerDocument;
    ensureUiStyle(doc, o.nonce);
    const m = getMessages(o.locale, o.labels);
    const left = h(doc, "div", { class: "sgc-doc" }), right = h(doc, "div", { class: "sgc-doc" }), redline = h(doc, "div", { class: "sgc-doc" });
    const bar = h(doc, "div"), list = h(doc, "aside");
    const pick = (side) => {
      desk.dataset.phone = side;
      for (const b of heads.querySelectorAll("button")) b.setAttribute("aria-pressed", b.dataset.side === side ? "true" : "false");
    };
    const head = (side, badge, cls, label) => h(
      doc,
      "button",
      { type: "button", class: "sgc-pane-head", "data-side": side, "aria-pressed": side === "right" ? "true" : "false", onclick: () => pick(side) },
      h(doc, "span", { class: `sgc-badge ${cls}` }, badge),
      label != null ? label : ""
    );
    const heads = h(doc, "div", { class: "sgc-heads", role: "group" }, head("left", m.before, "sgc-badge-old", o.leftLabel), head("right", m.after, "sgc-badge-new", o.rightLabel));
    const desk = h(
      doc,
      "div",
      { class: "sgc-shared", "data-phone": "right", tabindex: "0" },
      h(doc, "div", { class: "sgc-col sgc-col--left" }, left),
      h(doc, "div", { class: "sgc-col sgc-col--right" }, right)
    );
    const both = h(doc, "section", { class: "sgc-pane sgc-both" }, heads, desk);
    const paneX = h(
      doc,
      "section",
      { class: "sgc-pane", hidden: true },
      h(doc, "header", { class: "sgc-pane-head" }, `${(_a = o.leftLabel) != null ? _a : ""} \u2192 ${(_b = o.rightLabel) != null ? _b : ""}`),
      h(doc, "div", { style: "flex:1;min-height:0;overflow:auto" }, redline)
    );
    const body = h(doc, "div", { class: "sgc-body" }, h(doc, "div", { class: "sgc-panes sgc-panes--one" }, both, paneX), o.list === false ? null : list);
    if (o.list === false) body.style.gridTemplateColumns = "1fr";
    const root = h(doc, "div", { class: "sgc-viewer" }, o.toolbar === false ? null : bar, body);
    if (o.height) root.style.setProperty("--sgc-height", o.height);
    host.replaceChildren(root);
    let tb = null, cl = null, ctrl = null, dirty = true, off = null;
    const setMode = (md) => {
      const red = md === "redline";
      both.hidden = red;
      paneX.hidden = !red;
      root.dataset.mode = md;
      if (red && dirty && (ctrl == null ? void 0 : ctrl.changes)) {
        ctrl.renderRedline(redline);
        dirty = false;
      }
    };
    return {
      root,
      left,
      right,
      desk,
      bar,
      list,
      redline,
      setMode,
      /** 도구 막대·변경 목록을 컨트롤러에 연결 */
      attach(c) {
        ctrl = c;
        if (o.toolbar !== false) tb = mountToolbar(bar, c, { locale: o.locale, labels: o.labels, modes: o.modes !== false, onMode: setMode, nonce: o.nonce });
        if (o.list !== false) cl = mountChangeList(list, c, { locale: o.locale, labels: o.labels, nonce: o.nonce });
        off = c.on("update", () => {
          dirty = true;
          if (!paneX.hidden) {
            c.renderRedline(redline);
            dirty = false;
          }
        });
        return c;
      },
      destroy() {
        off == null ? void 0 : off();
        tb == null ? void 0 : tb.destroy();
        cl == null ? void 0 : cl.destroy();
        host.replaceChildren();
      }
    };
  }
  function mountViewer(host, o) {
    var _a, _b, _c, _d;
    const doc = host.ownerDocument;
    ensureUiStyle(doc, o.nonce);
    const m = getMessages(o.locale, o.labels);
    const frame = (src) => {
      var _a2, _b2;
      const f = h(doc, "iframe", { class: "sgc-frame", title: (_a2 = src.label) != null ? _a2 : "" });
      if (src.url) f.src = safeUrl(doc, src.url);
      else f.srcdoc = (_b2 = src.html) != null ? _b2 : "";
      return f;
    };
    const fl = frame(o.left), fr = frame(o.right);
    const fx = h(doc, "iframe", { class: "sgc-frame", title: m.redline });
    const bar = h(doc, "div");
    const list = h(doc, "aside");
    const shared = o.layout !== "split";
    const paneX = h(doc, "section", { class: "sgc-pane sgc-pane-redline", hidden: true }, h(doc, "header", { class: "sgc-pane-head" }, m.redline, ` \xB7 ${(_a = o.left.label) != null ? _a : ""} \u2192 ${(_b = o.right.label) != null ? _b : ""}`), fx);
    let paneL, paneR, both = null, desk = null;
    if (shared) {
      for (const f of [fl, fr]) {
        f.setAttribute("scrolling", "no");
        f.classList.add("sgc-frame--fit");
      }
      const head = (side, badge, cls, label) => h(
        doc,
        "button",
        { type: "button", class: "sgc-pane-head", "data-side": side, "aria-pressed": side === "right" ? "true" : "false", onclick: () => pick(side) },
        h(doc, "span", { class: `sgc-badge ${cls}` }, badge),
        label != null ? label : ""
      );
      desk = h(
        doc,
        "div",
        { class: "sgc-shared", "data-phone": "right", tabindex: "0" },
        h(doc, "div", { class: "sgc-col sgc-col--left" }, fl),
        h(doc, "div", { class: "sgc-col sgc-col--right" }, fr)
      );
      both = h(
        doc,
        "section",
        { class: "sgc-pane sgc-both" },
        h(doc, "div", { class: "sgc-heads", role: "group" }, head("left", m.before, "sgc-badge-old", o.left.label), head("right", m.after, "sgc-badge-new", o.right.label)),
        desk
      );
      paneL = paneR = both;
    } else {
      paneL = h(doc, "section", { class: "sgc-pane" }, h(doc, "header", { class: "sgc-pane-head" }, h(doc, "span", { class: "sgc-badge sgc-badge-old" }, m.before), (_c = o.left.label) != null ? _c : ""), fl);
      paneR = h(doc, "section", { class: "sgc-pane" }, h(doc, "header", { class: "sgc-pane-head" }, h(doc, "span", { class: "sgc-badge sgc-badge-new" }, m.after), (_d = o.right.label) != null ? _d : ""), fr);
    }
    const panes = h(doc, "div", { class: "sgc-panes" + (shared ? " sgc-panes--one" : "") }, ...shared ? [both] : [paneL, paneR], paneX);
    const root = h(doc, "div", { class: "sgc-viewer" }, bar, h(doc, "div", { class: "sgc-body" }, panes, list));
    if (o.height) root.style.setProperty("--sgc-height", o.height);
    host.replaceChildren(root);
    function pick(side) {
      if (!desk) return;
      desk.dataset.phone = side;
      for (const b of both.querySelectorAll(".sgc-heads button")) b.setAttribute("aria-pressed", b.dataset.side === side ? "true" : "false");
    }
    const fits = [];
    function fitFrame(f) {
      const d = f.contentDocument, w = f.contentWindow;
      if (!d || !w) return;
      const fit = () => {
        f.style.height = Math.ceil(d.documentElement.scrollHeight) + "px";
      };
      fit();
      if (w.ResizeObserver) {
        const ro = new w.ResizeObserver(fit);
        ro.observe(d.documentElement);
        if (d.body) ro.observe(d.body);
        fits.push(() => ro.disconnect());
      }
      w.addEventListener("load", fit);
    }
    const loaded = (f) => new Promise((res) => {
      const ok = () => f.contentDocument && f.contentDocument.readyState === "complete" && f.contentDocument.body;
      if (ok() && (f.src || f.srcdoc) && f.contentDocument.URL !== "about:blank") return res();
      f.addEventListener("load", () => res(), { once: true });
    });
    let ctrl = null, tb = null, cl = null, redlineDirty = true;
    const ready = Promise.all([loaded(fl), loaded(fr)]).then(() => {
      var _a2;
      if (shared) {
        fitFrame(fl);
        fitFrame(fr);
      }
      ctrl = createCompare({
        ...o,
        left: fl,
        right: fr,
        auto: false,
        watch: (_a2 = o.watch) != null ? _a2 : false,
        ...shared ? { leftScroller: desk, rightScroller: desk } : {}
      });
      tb = mountToolbar(bar, ctrl, { locale: o.locale, labels: o.labels, modes: true, onMode: setMode });
      cl = mountChangeList(list, ctrl, { locale: o.locale, labels: o.labels });
      ctrl.on("update", () => {
        redlineDirty = true;
        if (!paneX.hidden) drawRedline();
      });
      return ctrl.run().then(() => ctrl);
    });
    function drawRedline() {
      var _a2, _b2;
      const src = fr.contentDocument;
      const d = fx.contentDocument;
      if (!d) return;
      d.open();
      d.write(`${src.compatMode === "BackCompat" ? "" : "<!doctype html>"}<html><head></head><body></body></html>`);
      d.close();
      if (src.documentElement.lang) d.documentElement.lang = src.documentElement.lang;
      const base = d.createElement("base");
      base.href = src.baseURI;
      d.head.appendChild(base);
      for (const n of (_b2 = (_a2 = src.head) == null ? void 0 : _a2.children) != null ? _b2 : []) {
        if (n.localName === "style" || n.localName === "link" && /stylesheet/i.test(n.rel) || n.localName === "meta" && n.hasAttribute("charset")) d.head.appendChild(d.importNode(n, true));
      }
      d.body.className = src.body.className;
      for (const a of ["style", "bgcolor", "text", "link", "dir"]) {
        const v = src.body.getAttribute(a);
        if (v !== null) d.body.setAttribute(a, v);
      }
      ctrl.renderRedline(d.body);
      redlineDirty = false;
    }
    function setMode(md) {
      const red = md === "redline";
      paneL.hidden = red;
      paneR.hidden = red;
      paneX.hidden = !red;
      if (!red && shared) {
        fitFrame(fl);
        fitFrame(fr);
      }
      root.dataset.mode = md;
      if (red && redlineDirty && ctrl) drawRedline();
    }
    return {
      ready,
      get controller() {
        return ctrl;
      },
      setMode(md) {
        tb == null ? void 0 : tb.setMode(md);
        setMode(md);
      },
      destroy() {
        for (const f of fits) f();
        tb == null ? void 0 : tb.destroy();
        cl == null ? void 0 : cl.destroy();
        ctrl == null ? void 0 : ctrl.destroy();
        host.replaceChildren();
      }
    };
  }
  var UI_CSS = `
.sgc-viewer,.sgc-toolbar,.sgc-list{
  --sgc-bg:#ffffff;--sgc-bg2:#f6f7f9;--sgc-bd:#e3e6eb;--sgc-fg:#14171c;--sgc-mut:#667085;--sgc-acc:#2563eb;
  --sgc-c-added:#15803d;--sgc-c-modified:#1d4ed8;--sgc-c-deleted:#b91c1c;--sgc-c-moved:#6d28d9;
  font:13px/1.5 Pretendard,"Pretendard Variable",-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;
  color:var(--sgc-fg);box-sizing:border-box}
.sgc-viewer *,.sgc-toolbar *,.sgc-list *{box-sizing:border-box}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) :is(.sgc-viewer,.sgc-toolbar,.sgc-list){
  --sgc-bg:#15181d;--sgc-bg2:#1c2027;--sgc-bd:#2b313b;--sgc-fg:#e8ebf0;--sgc-mut:#9aa3b2;--sgc-acc:#60a5fa;
  --sgc-c-added:#4ade80;--sgc-c-modified:#60a5fa;--sgc-c-deleted:#f87171;--sgc-c-moved:#c4b5fd}}
:root[data-theme="dark"] :is(.sgc-viewer,.sgc-toolbar,.sgc-list),:is(.sgc-viewer,.sgc-toolbar,.sgc-list).sgc-dark{
  --sgc-bg:#15181d;--sgc-bg2:#1c2027;--sgc-bd:#2b313b;--sgc-fg:#e8ebf0;--sgc-mut:#9aa3b2;--sgc-acc:#60a5fa;
  --sgc-c-added:#4ade80;--sgc-c-modified:#60a5fa;--sgc-c-deleted:#f87171;--sgc-c-moved:#c4b5fd}
.sgc-viewer{display:flex;flex-direction:column;height:var(--sgc-height,80vh);min-height:420px;background:var(--sgc-bg2);border:1px solid var(--sgc-bd);border-radius:12px;overflow:hidden}
.sgc-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 300px}
.sgc-panes{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--sgc-bd);min-height:0}
.sgc-viewer[data-mode="redline"] .sgc-panes{grid-template-columns:1fr}
.sgc-panes--one{grid-template-columns:1fr}
.sgc-both{display:flex;flex-direction:column;min-height:0}
.sgc-heads{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--sgc-bd)}
.sgc-heads .sgc-pane-head{width:100%;border:0;font:inherit;font-weight:600;color:var(--sgc-fg);text-align:left;cursor:default}
.sgc-shared{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:1fr 1fr;align-items:start;background:var(--sgc-bg2)}
.sgc-col{min-width:0}
.sgc-col+.sgc-col{box-shadow:inset 1px 0 0 var(--sgc-bd)}
.sgc-frame--fit{display:block;flex:none;height:600px;overflow:hidden}
@media (max-width:640px){
  .sgc-heads .sgc-pane-head{cursor:pointer;justify-content:center;opacity:.55}
  .sgc-heads .sgc-pane-head[aria-pressed="true"]{opacity:1;box-shadow:inset 0 -2px 0 var(--sgc-acc)}
  .sgc-shared{grid-template-columns:1fr}
  .sgc-shared[data-phone="right"] .sgc-col--left,.sgc-shared[data-phone="left"] .sgc-col--right{display:none}
  .sgc-col+.sgc-col{box-shadow:none}
}
.sgc-pane{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--sgc-bg2)}
.sgc-pane[hidden]{display:none}
.sgc-pane-head{display:flex;align-items:center;gap:8px;padding:8px 14px;font-weight:600;background:var(--sgc-bg);border-bottom:1px solid var(--sgc-bd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sgc-frame{flex:1;width:100%;border:0;background:#fff;min-height:0}
.sgc-badge{font-size:11px;font-weight:700;letter-spacing:.02em;padding:2px 8px;border-radius:999px}
.sgc-badge-old{background:color-mix(in srgb,var(--sgc-c-deleted) 14%,transparent);color:var(--sgc-c-deleted)}
.sgc-badge-new{background:color-mix(in srgb,var(--sgc-c-added) 16%,transparent);color:var(--sgc-c-added)}
.sgc-viewer>.sgc-toolbar{border-bottom:1px solid var(--sgc-bd)}
.sgc-viewer .sgc-list{border-left:1px solid var(--sgc-bd)}
.sgc-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding:10px 14px;background:var(--sgc-bg)}
.sgc-tb-stats{display:flex;flex-wrap:wrap;gap:6px}
.sgc-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border:1px solid var(--sgc-bd);border-radius:999px;background:var(--sgc-bg);color:var(--sgc-fg);font:inherit;cursor:pointer;transition:background .15s,border-color .15s}
.sgc-chip b{font-variant-numeric:tabular-nums;font-weight:700}
.sgc-chip:hover:not(:disabled){background:var(--sgc-bg2)}
.sgc-chip:disabled{opacity:.45;cursor:default}
.sgc-chip[aria-pressed="true"]{border-color:var(--c);background:color-mix(in srgb,var(--c) 12%,var(--sgc-bg))}
.sgc-chip-added{--c:var(--sgc-c-added)}.sgc-chip-modified{--c:var(--sgc-c-modified)}.sgc-chip-deleted{--c:var(--sgc-c-deleted)}.sgc-chip-moved{--c:var(--sgc-c-moved)}
.sgc-dot{width:8px;height:8px;border-radius:50%;background:var(--c)}
.sgc-tb-nav{display:flex;align-items:center;gap:6px}
.sgc-pos{min-width:76px;text-align:center;font-variant-numeric:tabular-nums;color:var(--sgc-mut)}
.sgc-btn{height:30px;min-width:30px;padding:0 10px;border:1px solid var(--sgc-bd);border-radius:8px;background:var(--sgc-bg);color:var(--sgc-fg);font:inherit;cursor:pointer}
.sgc-btn:hover:not(:disabled){background:var(--sgc-bg2)}
.sgc-btn:disabled{opacity:.4;cursor:default}
.sgc-btn-wide{width:100%}
.sgc-tb-right{display:flex;align-items:center;gap:14px;margin-left:auto}
.sgc-seg{display:inline-flex;padding:2px;border:1px solid var(--sgc-bd);border-radius:9px;background:var(--sgc-bg2)}
.sgc-seg button{white-space:nowrap;height:26px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--sgc-mut);font:inherit;font-weight:600;cursor:pointer}
.sgc-seg button[aria-pressed="true"]{background:var(--sgc-bg);color:var(--sgc-fg);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.sgc-switch{white-space:nowrap;display:inline-flex;align-items:center;gap:6px;color:var(--sgc-mut);cursor:pointer;user-select:none}
.sgc-switch input{accent-color:var(--sgc-acc);width:15px;height:15px;margin:0}
.sgc-time{color:var(--sgc-mut);font-variant-numeric:tabular-nums;font-size:12px}
.sgc-list{display:flex;flex-direction:column;min-height:0;background:var(--sgc-bg)}
.sgc-list-head{display:flex;justify-content:space-between;align-items:baseline;padding:12px 14px 8px;border-bottom:1px solid var(--sgc-bd)}
.sgc-muted{color:var(--sgc-mut);font-size:12px}
.sgc-list-items{list-style:none;margin:0;padding:6px;overflow:auto;flex:1;min-height:0}
.sgc-li{display:block;width:100%;text-align:left;padding:8px 10px;margin:0 0 1px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.sgc-li:hover{background:var(--sgc-bg2)}
.sgc-li[aria-current="true"]{background:color-mix(in srgb,var(--sgc-acc) 10%,var(--sgc-bg))}
.sgc-li:focus-visible{outline:2px solid var(--sgc-acc);outline-offset:-2px}
.sgc-li-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.sgc-li-where{color:var(--sgc-mut);font-size:12px}
.sgc-li-no{display:none}
.sgc-tag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:5px;color:var(--c);background:color-mix(in srgb,var(--c) 13%,transparent)}
.sgc-tag-added{--c:var(--sgc-c-added)}.sgc-tag-modified{--c:var(--sgc-c-modified)}.sgc-tag-deleted{--c:var(--sgc-c-deleted)}.sgc-tag-moved{--c:var(--sgc-c-moved)}
.sgc-li-body{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12.5px;line-height:1.5;overflow-wrap:anywhere;color:var(--sgc-fg)}
.sgc-li-body del{color:var(--sgc-c-deleted);background:none;text-decoration-thickness:1px}
.sgc-li-body ins{color:var(--sgc-c-modified);background:none;text-decoration:underline;text-decoration-thickness:1px}
.sgc-li-ctx{color:var(--sgc-mut)}
.sgc-li-attr{margin-left:6px;font-size:12px;color:var(--sgc-mut)}
.sgc-empty{padding:24px 12px;text-align:center;color:var(--sgc-mut)}
.sgc-more{padding:6px 4px}
@media (max-width:900px){
  .sgc-body{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) 34%}
  .sgc-viewer .sgc-list{border-left:0;border-top:1px solid var(--sgc-bd)}
  .sgc-tb-right{margin-left:0}
}
@media (max-width:640px){.sgc-panes{grid-template-columns:1fr;grid-template-rows:1fr 1fr}.sgc-viewer[data-mode="redline"] .sgc-panes{grid-template-rows:1fr}}
@media (max-width:560px){.sgc-chip{height:28px;padding:0 9px}.sgc-pane-head{padding:6px 10px}}
`;

  // src/index.js
  var version = "1.0.0";
  return __toCommonJS(index_exports);
})();
