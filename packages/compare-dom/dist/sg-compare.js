/*! @silvergate/compare-dom — 화면 비교 (c) SilverGate */
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
    mountToolbar: () => mountToolbar,
    mountViewer: () => mountViewer,
    snapshot: () => snapshot
  });

  // src/snapshot.js
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "HEAD", "IFRAME", "OBJECT"]);
  var DEFAULT_ATTRS = ["src", "href", "alt", "colspan", "rowspan", "type"];
  var DEFAULT_ANCHORS = "p,li,tr,h1,h2,h3,h4,h5,h6,dt,dd,pre,blockquote,figcaption,caption,img,[data-sgc-key]";
  var KEY_ATTRS = ["data-sgc-key", "data-key"];
  function hashStr(str, seed = 0) {
    let h1 = 3735928559 ^ seed, h2 = 1103547991 ^ seed;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
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
    var _a, _b, _c;
    const attrs = (_a = opt.attrs) != null ? _a : DEFAULT_ATTRS;
    const ignoreSel = ["[data-sgc-ignore]", "[hidden]", opt.ignore].filter(Boolean).join(",");
    const anchorSel = (_b = opt.anchors) != null ? _b : DEFAULT_ANCHORS;
    const keyAttrs = (_c = opt.keyAttrs) != null ? _c : KEY_ATTRS;
    const flattenSel = opt.flatten || "";
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
      const ai = anchorSel && e.matches(anchorSel) ? anchors.push(i) - 1 : -1;
      let kids = tag === "TEXTAREA" || tag === "SELECT" ? [] : Array.from(e.childNodes);
      if (e.shadowRoot && e.shadowRoot.mode === "open") kids = kids.concat(Array.from(e.shadowRoot.children));
      if (tag === "TD" || tag === "TH") cellOut.set(e, out);
      else if (tag === "TR") kids = layoutRow(e, kids);
      return { out, sig, kids, x: 0, ai, rec };
    }
    const rootEl = resolveRoot(root);
    const top = open(rootEl, -1);
    const stack = [top];
    while (stack.length) {
      const f = stack[stack.length - 1];
      if (f.x < f.kids.length) {
        const ch = f.kids[f.x++];
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
          if (flattenSel && ch.matches(flattenSel)) {
            f.kids.splice(f.x, 0, ...Array.from(ch.childNodes));
            continue;
          }
          const sub = open(ch, f.out.i);
          f.out.c.push(sub.out);
          stack.push(sub);
        }
        continue;
      }
      f.out.h = f.rec.h = hashStr(f.sig);
      if (f.ai >= 0) anchorHashes[f.ai] = f.out.h;
      stack.pop();
      if (stack.length) stack[stack.length - 1].sig += "" + f.out.h;
    }
    return { tree: top.out, nodes, anchors, anchorHashes, flat };
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
    for (let i2 = 0; i2 < n; i2++) a.push(enc(hl[pre + i2]));
    for (let j2 = 0; j2 < m; j2++) b.push(enc(hr[pre + j2]));
    if (code2.size > 63e3) return null;
    const d = myers.diff_main(chunked(a), chunked(b), false);
    const out = [];
    let i = 0, j = 0;
    for (const [op, t] of d) {
      if (op === 0) {
        for (let k = 0; k < t.length; k++) out.push([pre + i + k, pre + j + k]);
        i += t.length;
        j += t.length;
      } else if (op === -1) i += t.length;
      else j += t.length;
    }
    return out;
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
    if (big) anchors.push(...big);
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
  var code = '(()=>{var Ke=Object.create;var Te=Object.defineProperty;var We=Object.getOwnPropertyDescriptor;var Ge=Object.getOwnPropertyNames;var Je=Object.getPrototypeOf,Ve=Object.prototype.hasOwnProperty;var Xe=(e,n)=>()=>{try{return n||e((n={exports:{}}).exports,n),n.exports}catch(t){throw n=0,t}};var Ye=(e,n,t,i)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of Ge(n))!Ve.call(e,r)&&r!==t&&Te(e,r,{get:()=>n[r],enumerable:!(i=We(n,r))||i.enumerable});return e};var Ee=(e,n,t)=>(t=e!=null?Ke(Je(e)):{},Ye(n||!e||!e.__esModule?Te(t,"default",{value:e,enumerable:!0}):t,e));var ce=Xe((hn,Z)=>{var g=function(){this.Diff_Timeout=1,this.Diff_EditCost=4,this.Match_Threshold=.5,this.Match_Distance=1e3,this.Patch_DeleteThreshold=.5,this.Patch_Margin=4,this.Match_MaxBits=32},N=-1,O=1,S=0;g.Diff=function(e,n){return[e,n]};g.prototype.diff_main=function(e,n,t,i){typeof i=="undefined"&&(this.Diff_Timeout<=0?i=Number.MAX_VALUE:i=new Date().getTime()+this.Diff_Timeout*1e3);var r=i;if(e==null||n==null)throw new Error("Null input. (diff_main)");if(e==n)return e?[new g.Diff(S,e)]:[];typeof t=="undefined"&&(t=!0);var s=t,a=this.diff_commonPrefix(e,n),l=e.substring(0,a);e=e.substring(a),n=n.substring(a),a=this.diff_commonSuffix(e,n);var o=e.substring(e.length-a);e=e.substring(0,e.length-a),n=n.substring(0,n.length-a);var f=this.diff_compute_(e,n,s,r);return l&&f.unshift(new g.Diff(S,l)),o&&f.push(new g.Diff(S,o)),this.diff_cleanupMerge(f),f};g.prototype.diff_compute_=function(e,n,t,i){var r;if(!e)return[new g.Diff(O,n)];if(!n)return[new g.Diff(N,e)];var s=e.length>n.length?e:n,a=e.length>n.length?n:e,l=s.indexOf(a);if(l!=-1)return r=[new g.Diff(O,s.substring(0,l)),new g.Diff(S,a),new g.Diff(O,s.substring(l+a.length))],e.length>n.length&&(r[0][0]=r[2][0]=N),r;if(a.length==1)return[new g.Diff(N,e),new g.Diff(O,n)];var o=this.diff_halfMatch_(e,n);if(o){var f=o[0],h=o[1],d=o[2],p=o[3],v=o[4],m=this.diff_main(f,d,t,i),A=this.diff_main(h,p,t,i);return m.concat([new g.Diff(S,v)],A)}return t&&e.length>100&&n.length>100?this.diff_lineMode_(e,n,i):this.diff_bisect_(e,n,i)};g.prototype.diff_lineMode_=function(e,n,t){var i=this.diff_linesToChars_(e,n);e=i.chars1,n=i.chars2;var r=i.lineArray,s=this.diff_main(e,n,!1,t);this.diff_charsToLines_(s,r),this.diff_cleanupSemantic(s),s.push(new g.Diff(S,""));for(var a=0,l=0,o=0,f="",h="";a<s.length;){switch(s[a][0]){case O:o++,h+=s[a][1];break;case N:l++,f+=s[a][1];break;case S:if(l>=1&&o>=1){s.splice(a-l-o,l+o),a=a-l-o;for(var d=this.diff_main(f,h,!1,t),p=d.length-1;p>=0;p--)s.splice(a,0,d[p]);a=a+d.length}o=0,l=0,f="",h="";break}a++}return s.pop(),s};g.prototype.diff_bisect_=function(e,n,t){for(var i=e.length,r=n.length,s=Math.ceil((i+r)/2),a=s,l=2*s,o=new Array(l),f=new Array(l),h=0;h<l;h++)o[h]=-1,f[h]=-1;o[a+1]=0,f[a+1]=0;for(var d=i-r,p=d%2!=0,v=0,m=0,A=0,b=0,w=0;w<s&&!(new Date().getTime()>t);w++){for(var M=-w+v;M<=w-m;M+=2){var k=a+M,E;M==-w||M!=w&&o[k-1]<o[k+1]?E=o[k+1]:E=o[k-1]+1;for(var T=E-M;E<i&&T<r&&e.charAt(E)==n.charAt(T);)E++,T++;if(o[k]=E,E>i)m+=2;else if(T>r)v+=2;else if(p){var u=a+d-M;if(u>=0&&u<l&&f[u]!=-1){var c=i-f[u];if(E>=c)return this.diff_bisectSplit_(e,n,E,T,t)}}}for(var y=-w+A;y<=w-b;y+=2){var u=a+y,c;y==-w||y!=w&&f[u-1]<f[u+1]?c=f[u+1]:c=f[u-1]+1;for(var _=c-y;c<i&&_<r&&e.charAt(i-c-1)==n.charAt(r-_-1);)c++,_++;if(f[u]=c,c>i)b+=2;else if(_>r)A+=2;else if(!p){var k=a+d-y;if(k>=0&&k<l&&o[k]!=-1){var E=o[k],T=a+E-k;if(c=i-c,E>=c)return this.diff_bisectSplit_(e,n,E,T,t)}}}}return[new g.Diff(N,e),new g.Diff(O,n)]};g.prototype.diff_bisectSplit_=function(e,n,t,i,r){var s=e.substring(0,t),a=n.substring(0,i),l=e.substring(t),o=n.substring(i),f=this.diff_main(s,a,!1,r),h=this.diff_main(l,o,!1,r);return f.concat(h)};g.prototype.diff_linesToChars_=function(e,n){var t=[],i={};t[0]="";function r(o){for(var f="",h=0,d=-1,p=t.length;d<o.length-1;){d=o.indexOf(`\n`,h),d==-1&&(d=o.length-1);var v=o.substring(h,d+1);(i.hasOwnProperty?i.hasOwnProperty(v):i[v]!==void 0)?f+=String.fromCharCode(i[v]):(p==s&&(v=o.substring(h),d=o.length),f+=String.fromCharCode(p),i[v]=p,t[p++]=v),h=d+1}return f}var s=4e4,a=r(e);s=65535;var l=r(n);return{chars1:a,chars2:l,lineArray:t}};g.prototype.diff_charsToLines_=function(e,n){for(var t=0;t<e.length;t++){for(var i=e[t][1],r=[],s=0;s<i.length;s++)r[s]=n[i.charCodeAt(s)];e[t][1]=r.join("")}};g.prototype.diff_commonPrefix=function(e,n){if(!e||!n||e.charAt(0)!=n.charAt(0))return 0;for(var t=0,i=Math.min(e.length,n.length),r=i,s=0;t<r;)e.substring(s,r)==n.substring(s,r)?(t=r,s=t):i=r,r=Math.floor((i-t)/2+t);return r};g.prototype.diff_commonSuffix=function(e,n){if(!e||!n||e.charAt(e.length-1)!=n.charAt(n.length-1))return 0;for(var t=0,i=Math.min(e.length,n.length),r=i,s=0;t<r;)e.substring(e.length-r,e.length-s)==n.substring(n.length-r,n.length-s)?(t=r,s=t):i=r,r=Math.floor((i-t)/2+t);return r};g.prototype.diff_commonOverlap_=function(e,n){var t=e.length,i=n.length;if(t==0||i==0)return 0;t>i?e=e.substring(t-i):t<i&&(n=n.substring(0,t));var r=Math.min(t,i);if(e==n)return r;for(var s=0,a=1;;){var l=e.substring(r-a),o=n.indexOf(l);if(o==-1)return s;a+=o,(o==0||e.substring(r-a)==n.substring(0,a))&&(s=a,a++)}};g.prototype.diff_halfMatch_=function(e,n){if(this.Diff_Timeout<=0)return null;var t=e.length>n.length?e:n,i=e.length>n.length?n:e;if(t.length<4||i.length*2<t.length)return null;var r=this;function s(m,A,b){for(var w=m.substring(b,b+Math.floor(m.length/4)),M=-1,k="",E,T,u,c;(M=A.indexOf(w,M+1))!=-1;){var y=r.diff_commonPrefix(m.substring(b),A.substring(M)),_=r.diff_commonSuffix(m.substring(0,b),A.substring(0,M));k.length<_+y&&(k=A.substring(M-_,M)+A.substring(M,M+y),E=m.substring(0,b-_),T=m.substring(b+y),u=A.substring(0,M-_),c=A.substring(M+y))}return k.length*2>=m.length?[E,T,u,c,k]:null}var a=s(t,i,Math.ceil(t.length/4)),l=s(t,i,Math.ceil(t.length/2)),o;if(!a&&!l)return null;l?a?o=a[4].length>l[4].length?a:l:o=l:o=a;var f,h,d,p;e.length>n.length?(f=o[0],h=o[1],d=o[2],p=o[3]):(d=o[0],p=o[1],f=o[2],h=o[3]);var v=o[4];return[f,h,d,p,v]};g.prototype.diff_cleanupSemantic=function(e){for(var n=!1,t=[],i=0,r=null,s=0,a=0,l=0,o=0,f=0;s<e.length;)e[s][0]==S?(t[i++]=s,a=o,l=f,o=0,f=0,r=e[s][1]):(e[s][0]==O?o+=e[s][1].length:f+=e[s][1].length,r&&r.length<=Math.max(a,l)&&r.length<=Math.max(o,f)&&(e.splice(t[i-1],0,new g.Diff(N,r)),e[t[i-1]+1][0]=O,i--,i--,s=i>0?t[i-1]:-1,a=0,l=0,o=0,f=0,r=null,n=!0)),s++;for(n&&this.diff_cleanupMerge(e),this.diff_cleanupSemanticLossless(e),s=1;s<e.length;){if(e[s-1][0]==N&&e[s][0]==O){var h=e[s-1][1],d=e[s][1],p=this.diff_commonOverlap_(h,d),v=this.diff_commonOverlap_(d,h);p>=v?(p>=h.length/2||p>=d.length/2)&&(e.splice(s,0,new g.Diff(S,d.substring(0,p))),e[s-1][1]=h.substring(0,h.length-p),e[s+1][1]=d.substring(p),s++):(v>=h.length/2||v>=d.length/2)&&(e.splice(s,0,new g.Diff(S,h.substring(0,v))),e[s-1][0]=O,e[s-1][1]=d.substring(0,d.length-v),e[s+1][0]=N,e[s+1][1]=h.substring(v),s++),s++}s++}};g.prototype.diff_cleanupSemanticLossless=function(e){function n(v,m){if(!v||!m)return 6;var A=v.charAt(v.length-1),b=m.charAt(0),w=A.match(g.nonAlphaNumericRegex_),M=b.match(g.nonAlphaNumericRegex_),k=w&&A.match(g.whitespaceRegex_),E=M&&b.match(g.whitespaceRegex_),T=k&&A.match(g.linebreakRegex_),u=E&&b.match(g.linebreakRegex_),c=T&&v.match(g.blanklineEndRegex_),y=u&&m.match(g.blanklineStartRegex_);return c||y?5:T||u?4:w&&!k&&E?3:k||E?2:w||M?1:0}for(var t=1;t<e.length-1;){if(e[t-1][0]==S&&e[t+1][0]==S){var i=e[t-1][1],r=e[t][1],s=e[t+1][1],a=this.diff_commonSuffix(i,r);if(a){var l=r.substring(r.length-a);i=i.substring(0,i.length-a),r=l+r.substring(0,r.length-a),s=l+s}for(var o=i,f=r,h=s,d=n(i,r)+n(r,s);r.charAt(0)===s.charAt(0);){i+=r.charAt(0),r=r.substring(1)+s.charAt(0),s=s.substring(1);var p=n(i,r)+n(r,s);p>=d&&(d=p,o=i,f=r,h=s)}e[t-1][1]!=o&&(o?e[t-1][1]=o:(e.splice(t-1,1),t--),e[t][1]=f,h?e[t+1][1]=h:(e.splice(t+1,1),t--))}t++}};g.nonAlphaNumericRegex_=/[^a-zA-Z0-9]/;g.whitespaceRegex_=/\\s/;g.linebreakRegex_=/[\\r\\n]/;g.blanklineEndRegex_=/\\n\\r?\\n$/;g.blanklineStartRegex_=/^\\r?\\n\\r?\\n/;g.prototype.diff_cleanupEfficiency=function(e){for(var n=!1,t=[],i=0,r=null,s=0,a=!1,l=!1,o=!1,f=!1;s<e.length;)e[s][0]==S?(e[s][1].length<this.Diff_EditCost&&(o||f)?(t[i++]=s,a=o,l=f,r=e[s][1]):(i=0,r=null),o=f=!1):(e[s][0]==N?f=!0:o=!0,r&&(a&&l&&o&&f||r.length<this.Diff_EditCost/2&&a+l+o+f==3)&&(e.splice(t[i-1],0,new g.Diff(N,r)),e[t[i-1]+1][0]=O,i--,r=null,a&&l?(o=f=!0,i=0):(i--,s=i>0?t[i-1]:-1,o=f=!1),n=!0)),s++;n&&this.diff_cleanupMerge(e)};g.prototype.diff_cleanupMerge=function(e){e.push(new g.Diff(S,""));for(var n=0,t=0,i=0,r="",s="",a;n<e.length;)switch(e[n][0]){case O:i++,s+=e[n][1],n++;break;case N:t++,r+=e[n][1],n++;break;case S:t+i>1?(t!==0&&i!==0&&(a=this.diff_commonPrefix(s,r),a!==0&&(n-t-i>0&&e[n-t-i-1][0]==S?e[n-t-i-1][1]+=s.substring(0,a):(e.splice(0,0,new g.Diff(S,s.substring(0,a))),n++),s=s.substring(a),r=r.substring(a)),a=this.diff_commonSuffix(s,r),a!==0&&(e[n][1]=s.substring(s.length-a)+e[n][1],s=s.substring(0,s.length-a),r=r.substring(0,r.length-a))),n-=t+i,e.splice(n,t+i),r.length&&(e.splice(n,0,new g.Diff(N,r)),n++),s.length&&(e.splice(n,0,new g.Diff(O,s)),n++),n++):n!==0&&e[n-1][0]==S?(e[n-1][1]+=e[n][1],e.splice(n,1)):n++,i=0,t=0,r="",s="";break}e[e.length-1][1]===""&&e.pop();var l=!1;for(n=1;n<e.length-1;)e[n-1][0]==S&&e[n+1][0]==S&&(e[n][1].substring(e[n][1].length-e[n-1][1].length)==e[n-1][1]?(e[n][1]=e[n-1][1]+e[n][1].substring(0,e[n][1].length-e[n-1][1].length),e[n+1][1]=e[n-1][1]+e[n+1][1],e.splice(n-1,1),l=!0):e[n][1].substring(0,e[n+1][1].length)==e[n+1][1]&&(e[n-1][1]+=e[n+1][1],e[n][1]=e[n][1].substring(e[n+1][1].length)+e[n+1][1],e.splice(n+1,1),l=!0)),n++;l&&this.diff_cleanupMerge(e)};g.prototype.diff_xIndex=function(e,n){var t=0,i=0,r=0,s=0,a;for(a=0;a<e.length&&(e[a][0]!==O&&(t+=e[a][1].length),e[a][0]!==N&&(i+=e[a][1].length),!(t>n));a++)r=t,s=i;return e.length!=a&&e[a][0]===N?s:s+(n-r)};g.prototype.diff_prettyHtml=function(e){for(var n=[],t=/&/g,i=/</g,r=/>/g,s=/\\n/g,a=0;a<e.length;a++){var l=e[a][0],o=e[a][1],f=o.replace(t,"&amp;").replace(i,"&lt;").replace(r,"&gt;").replace(s,"&para;<br>");switch(l){case O:n[a]=\'<ins style="background:#e6ffe6;">\'+f+"</ins>";break;case N:n[a]=\'<del style="background:#ffe6e6;">\'+f+"</del>";break;case S:n[a]="<span>"+f+"</span>";break}}return n.join("")};g.prototype.diff_text1=function(e){for(var n=[],t=0;t<e.length;t++)e[t][0]!==O&&(n[t]=e[t][1]);return n.join("")};g.prototype.diff_text2=function(e){for(var n=[],t=0;t<e.length;t++)e[t][0]!==N&&(n[t]=e[t][1]);return n.join("")};g.prototype.diff_levenshtein=function(e){for(var n=0,t=0,i=0,r=0;r<e.length;r++){var s=e[r][0],a=e[r][1];switch(s){case O:t+=a.length;break;case N:i+=a.length;break;case S:n+=Math.max(t,i),t=0,i=0;break}}return n+=Math.max(t,i),n};g.prototype.diff_toDelta=function(e){for(var n=[],t=0;t<e.length;t++)switch(e[t][0]){case O:n[t]="+"+encodeURI(e[t][1]);break;case N:n[t]="-"+e[t][1].length;break;case S:n[t]="="+e[t][1].length;break}return n.join("	").replace(/%20/g," ")};g.prototype.diff_fromDelta=function(e,n){for(var t=[],i=0,r=0,s=n.split(/\\t/g),a=0;a<s.length;a++){var l=s[a].substring(1);switch(s[a].charAt(0)){case"+":try{t[i++]=new g.Diff(O,decodeURI(l))}catch{throw new Error("Illegal escape in diff_fromDelta: "+l)}break;case"-":case"=":var o=parseInt(l,10);if(isNaN(o)||o<0)throw new Error("Invalid number in diff_fromDelta: "+l);var f=e.substring(r,r+=o);s[a].charAt(0)=="="?t[i++]=new g.Diff(S,f):t[i++]=new g.Diff(N,f);break;default:if(s[a])throw new Error("Invalid diff operation in diff_fromDelta: "+s[a])}}if(r!=e.length)throw new Error("Delta length ("+r+") does not equal source text length ("+e.length+").");return t};g.prototype.match_main=function(e,n,t){if(e==null||n==null||t==null)throw new Error("Null input. (match_main)");return t=Math.max(0,Math.min(t,e.length)),e==n?0:e.length?e.substring(t,t+n.length)==n?t:this.match_bitap_(e,n,t):-1};g.prototype.match_bitap_=function(e,n,t){if(n.length>this.Match_MaxBits)throw new Error("Pattern too long for this browser.");var i=this.match_alphabet_(n),r=this;function s(E,T){var u=E/n.length,c=Math.abs(t-T);return r.Match_Distance?u+c/r.Match_Distance:c?1:u}var a=this.Match_Threshold,l=e.indexOf(n,t);l!=-1&&(a=Math.min(s(0,l),a),l=e.lastIndexOf(n,t+n.length),l!=-1&&(a=Math.min(s(0,l),a)));var o=1<<n.length-1;l=-1;for(var f,h,d=n.length+e.length,p,v=0;v<n.length;v++){for(f=0,h=d;f<h;)s(v,t+h)<=a?f=h:d=h,h=Math.floor((d-f)/2+f);d=h;var m=Math.max(1,t-h+1),A=Math.min(t+h,e.length)+n.length,b=Array(A+2);b[A+1]=(1<<v)-1;for(var w=A;w>=m;w--){var M=i[e.charAt(w-1)];if(v===0?b[w]=(b[w+1]<<1|1)&M:b[w]=(b[w+1]<<1|1)&M|((p[w+1]|p[w])<<1|1)|p[w+1],b[w]&o){var k=s(v,w-1);if(k<=a)if(a=k,l=w-1,l>t)m=Math.max(1,2*t-l);else break}}if(s(v+1,t)>a)break;p=b}return l};g.prototype.match_alphabet_=function(e){for(var n={},t=0;t<e.length;t++)n[e.charAt(t)]=0;for(var t=0;t<e.length;t++)n[e.charAt(t)]|=1<<e.length-t-1;return n};g.prototype.patch_addContext_=function(e,n){if(n.length!=0){if(e.start2===null)throw Error("patch not initialized");for(var t=n.substring(e.start2,e.start2+e.length1),i=0;n.indexOf(t)!=n.lastIndexOf(t)&&t.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)i+=this.Patch_Margin,t=n.substring(e.start2-i,e.start2+e.length1+i);i+=this.Patch_Margin;var r=n.substring(e.start2-i,e.start2);r&&e.diffs.unshift(new g.Diff(S,r));var s=n.substring(e.start2+e.length1,e.start2+e.length1+i);s&&e.diffs.push(new g.Diff(S,s)),e.start1-=r.length,e.start2-=r.length,e.length1+=r.length+s.length,e.length2+=r.length+s.length}};g.prototype.patch_make=function(e,n,t){var i,r;if(typeof e=="string"&&typeof n=="string"&&typeof t=="undefined")i=e,r=this.diff_main(i,n,!0),r.length>2&&(this.diff_cleanupSemantic(r),this.diff_cleanupEfficiency(r));else if(e&&typeof e=="object"&&typeof n=="undefined"&&typeof t=="undefined")r=e,i=this.diff_text1(r);else if(typeof e=="string"&&n&&typeof n=="object"&&typeof t=="undefined")i=e,r=n;else if(typeof e=="string"&&typeof n=="string"&&t&&typeof t=="object")i=e,r=t;else throw new Error("Unknown call format to patch_make.");if(r.length===0)return[];for(var s=[],a=new g.patch_obj,l=0,o=0,f=0,h=i,d=i,p=0;p<r.length;p++){var v=r[p][0],m=r[p][1];switch(!l&&v!==S&&(a.start1=o,a.start2=f),v){case O:a.diffs[l++]=r[p],a.length2+=m.length,d=d.substring(0,f)+m+d.substring(f);break;case N:a.length1+=m.length,a.diffs[l++]=r[p],d=d.substring(0,f)+d.substring(f+m.length);break;case S:m.length<=2*this.Patch_Margin&&l&&r.length!=p+1?(a.diffs[l++]=r[p],a.length1+=m.length,a.length2+=m.length):m.length>=2*this.Patch_Margin&&l&&(this.patch_addContext_(a,h),s.push(a),a=new g.patch_obj,l=0,h=d,o=f);break}v!==O&&(o+=m.length),v!==N&&(f+=m.length)}return l&&(this.patch_addContext_(a,h),s.push(a)),s};g.prototype.patch_deepCopy=function(e){for(var n=[],t=0;t<e.length;t++){var i=e[t],r=new g.patch_obj;r.diffs=[];for(var s=0;s<i.diffs.length;s++)r.diffs[s]=new g.Diff(i.diffs[s][0],i.diffs[s][1]);r.start1=i.start1,r.start2=i.start2,r.length1=i.length1,r.length2=i.length2,n[t]=r}return n};g.prototype.patch_apply=function(e,n){if(e.length==0)return[n,[]];e=this.patch_deepCopy(e);var t=this.patch_addPadding(e);n=t+n+t,this.patch_splitMax(e);for(var i=0,r=[],s=0;s<e.length;s++){var a=e[s].start2+i,l=this.diff_text1(e[s].diffs),o,f=-1;if(l.length>this.Match_MaxBits?(o=this.match_main(n,l.substring(0,this.Match_MaxBits),a),o!=-1&&(f=this.match_main(n,l.substring(l.length-this.Match_MaxBits),a+l.length-this.Match_MaxBits),(f==-1||o>=f)&&(o=-1))):o=this.match_main(n,l,a),o==-1)r[s]=!1,i-=e[s].length2-e[s].length1;else{r[s]=!0,i=o-a;var h;if(f==-1?h=n.substring(o,o+l.length):h=n.substring(o,f+this.Match_MaxBits),l==h)n=n.substring(0,o)+this.diff_text2(e[s].diffs)+n.substring(o+l.length);else{var d=this.diff_main(l,h,!1);if(l.length>this.Match_MaxBits&&this.diff_levenshtein(d)/l.length>this.Patch_DeleteThreshold)r[s]=!1;else{this.diff_cleanupSemanticLossless(d);for(var p=0,v,m=0;m<e[s].diffs.length;m++){var A=e[s].diffs[m];A[0]!==S&&(v=this.diff_xIndex(d,p)),A[0]===O?n=n.substring(0,o+v)+A[1]+n.substring(o+v):A[0]===N&&(n=n.substring(0,o+v)+n.substring(o+this.diff_xIndex(d,p+A[1].length))),A[0]!==N&&(p+=A[1].length)}}}}}return n=n.substring(t.length,n.length-t.length),[n,r]};g.prototype.patch_addPadding=function(e){for(var n=this.Patch_Margin,t="",i=1;i<=n;i++)t+=String.fromCharCode(i);for(var i=0;i<e.length;i++)e[i].start1+=n,e[i].start2+=n;var r=e[0],s=r.diffs;if(s.length==0||s[0][0]!=S)s.unshift(new g.Diff(S,t)),r.start1-=n,r.start2-=n,r.length1+=n,r.length2+=n;else if(n>s[0][1].length){var a=n-s[0][1].length;s[0][1]=t.substring(s[0][1].length)+s[0][1],r.start1-=a,r.start2-=a,r.length1+=a,r.length2+=a}if(r=e[e.length-1],s=r.diffs,s.length==0||s[s.length-1][0]!=S)s.push(new g.Diff(S,t)),r.length1+=n,r.length2+=n;else if(n>s[s.length-1][1].length){var a=n-s[s.length-1][1].length;s[s.length-1][1]+=t.substring(0,a),r.length1+=a,r.length2+=a}return t};g.prototype.patch_splitMax=function(e){for(var n=this.Match_MaxBits,t=0;t<e.length;t++)if(!(e[t].length1<=n)){var i=e[t];e.splice(t--,1);for(var r=i.start1,s=i.start2,a="";i.diffs.length!==0;){var l=new g.patch_obj,o=!0;for(l.start1=r-a.length,l.start2=s-a.length,a!==""&&(l.length1=l.length2=a.length,l.diffs.push(new g.Diff(S,a)));i.diffs.length!==0&&l.length1<n-this.Patch_Margin;){var f=i.diffs[0][0],h=i.diffs[0][1];f===O?(l.length2+=h.length,s+=h.length,l.diffs.push(i.diffs.shift()),o=!1):f===N&&l.diffs.length==1&&l.diffs[0][0]==S&&h.length>2*n?(l.length1+=h.length,r+=h.length,o=!1,l.diffs.push(new g.Diff(f,h)),i.diffs.shift()):(h=h.substring(0,n-l.length1-this.Patch_Margin),l.length1+=h.length,r+=h.length,f===S?(l.length2+=h.length,s+=h.length):o=!1,l.diffs.push(new g.Diff(f,h)),h==i.diffs[0][1]?i.diffs.shift():i.diffs[0][1]=i.diffs[0][1].substring(h.length))}a=this.diff_text2(l.diffs),a=a.substring(a.length-this.Patch_Margin);var d=this.diff_text1(i.diffs).substring(0,this.Patch_Margin);d!==""&&(l.length1+=d.length,l.length2+=d.length,l.diffs.length!==0&&l.diffs[l.diffs.length-1][0]===S?l.diffs[l.diffs.length-1][1]+=d:l.diffs.push(new g.Diff(S,d))),o||e.splice(++t,0,l)}}};g.prototype.patch_toText=function(e){for(var n=[],t=0;t<e.length;t++)n[t]=e[t];return n.join("")};g.prototype.patch_fromText=function(e){var n=[];if(!e)return n;for(var t=e.split(`\n`),i=0,r=/^@@ -(\\d+),?(\\d*) \\+(\\d+),?(\\d*) @@$/;i<t.length;){var s=t[i].match(r);if(!s)throw new Error("Invalid patch string: "+t[i]);var a=new g.patch_obj;for(n.push(a),a.start1=parseInt(s[1],10),s[2]===""?(a.start1--,a.length1=1):s[2]=="0"?a.length1=0:(a.start1--,a.length1=parseInt(s[2],10)),a.start2=parseInt(s[3],10),s[4]===""?(a.start2--,a.length2=1):s[4]=="0"?a.length2=0:(a.start2--,a.length2=parseInt(s[4],10)),i++;i<t.length;){var l=t[i].charAt(0);try{var o=decodeURI(t[i].substring(1))}catch{throw new Error("Illegal escape in patch_fromText: "+o)}if(l=="-")a.diffs.push(new g.Diff(N,o));else if(l=="+")a.diffs.push(new g.Diff(O,o));else if(l==" ")a.diffs.push(new g.Diff(S,o));else{if(l=="@")break;if(l!=="")throw new Error(\'Invalid patch mode "\'+l+\'" in: \'+o)}i++}}return n};g.patch_obj=function(){this.diffs=[],this.start1=null,this.start2=null,this.length1=0,this.length2=0};g.patch_obj.prototype.toString=function(){var e,n;this.length1===0?e=this.start1+",0":this.length1==1?e=this.start1+1:e=this.start1+1+","+this.length1,this.length2===0?n=this.start2+",0":this.length2==1?n=this.start2+1:n=this.start2+1+","+this.length2;for(var t=["@@ -"+e+" +"+n+` @@\n`],i,r=0;r<this.diffs.length;r++){switch(this.diffs[r][0]){case O:i="+";break;case N:i="-";break;case S:i=" ";break}t[r+1]=i+encodeURI(this.diffs[r][1])+`\n`}return t.join("").replace(/%20/g," ")};Z.exports=g;Z.exports.diff_match_patch=g;Z.exports.DIFF_DELETE=N;Z.exports.DIFF_INSERT=O;Z.exports.DIFF_EQUAL=S});var Qe=e=>String(e).replace(/[\\\\[\\]]/g,n=>"\\\\"+n);function J(e){let n="";for(let t of e)"i"in t?n+=`[${Qe(t.i)}]`:n+=(n?".":"")+t.k;return n}function V(e){return e.map(n=>"i"in n?"*":n.k).join(".")}function he(e,n,t,i){if(n===e.length)return i===t.length;let r=e[n];if(r==="**"){for(let s=i;s<=t.length;s++)if(he(e,n+1,t,s))return!0;return!1}return i===t.length||r!=="*"&&r!==t[i]?!1:he(e,n+1,t,i+1)}function z(e){if(!e)return()=>{};let t=(typeof e=="string"?[[e,!0]]:Array.isArray(e)?e.map(r=>[r,!0]):Object.entries(e)).map(([r,s])=>[r.split("."),s]),i=new Map;return r=>{if(i.has(r))return i.get(r);let s=r===""?[]:r.split("."),a;for(let[l,o]of t)if(he(l,0,s,0)){a=o;break}return i.set(r,a),a}}function Ie(e,n){return JSON.stringify(ue(e,n,[]))}function ue(e,n,t){if(Array.isArray(e))return e.map((i,r)=>ue(i,n,[...t,{i:String(r)}]));if(e&&typeof e=="object"){let i={};for(let r of Object.keys(e).sort()){let s=[...t,{k:r}];n&&n(V(s))||(i[r]=ue(e[r],n,s))}return i}return e}var Re=Ee(ce(),1),je=new Re.default;je.Diff_Timeout=0;function Ze(e,n,t,i,r){let s=new Map,a=v=>{let m=s.get(v);return m===void 0&&(m=s.size+1,m>=55296&&(m+=2048),s.set(v,m)),m},l=[],o=[];for(let v=0;v<i;v++)l.push(a(e[t+v]));for(let v=0;v<r;v++)o.push(a(n[t+v]));if(s.size>63e3)return null;let f=je.diff_main(Pe(l),Pe(o),!1),h=[],d=0,p=0;for(let[v,m]of f)if(v===0){for(let A=0;A<m.length;A++)h.push([t+d+A,t+p+A]);d+=m.length,p+=m.length}else v===-1?d+=m.length:p+=m.length;return h}function Pe(e){let n="";for(let t=0;t<e.length;t+=8192)n+=String.fromCharCode(...e.slice(t,t+8192));return n}function ge(e,n){let t=ve(e,n,r=>r),i=[];for(let r of t)r.hasL&&r.hasR&&e[r.li]===n[r.ri]&&i.push([r.li,r.ri]);return i}function Ne(e,n){let t=new Map;return e.map((i,r)=>{var l,o;let s=String((l=n(i,r))!=null?l:""),a=((o=t.get(s))!=null?o:0)+1;return t.set(s,a),a===1?s:`${s}#${a}`})}function Ce(e,n,t,i=!0){let r=Ne(e,t),s=Ne(n,t),a=new Map(r.map((p,v)=>[p,v])),l=new Set(s),o=new Set;if(i){let p=s.filter(m=>a.has(m)),v=qe(p.map(m=>a.get(m)));p.forEach((m,A)=>{v.has(A)||o.add(m)})}let f=[],h=0,d=p=>{for(;h<e.length&&r[h]!==p;)l.has(r[h])||f.push({id:r[h],hasL:!0,hasR:!1,l:e[h],r:void 0,li:h,ri:-1,moved:!1}),h++;h<e.length&&r[h]===p&&h++};return s.forEach((p,v)=>{if(a.has(p)){o.has(p)||d(p);let m=a.get(p);f.push({id:p,hasL:!0,hasR:!0,l:e[m],r:n[v],li:m,ri:v,moved:o.has(p)})}else f.push({id:p,hasL:!1,hasR:!0,l:void 0,r:n[v],li:-1,ri:v,moved:!1})}),d(void 0),f}function qe(e){var s;let n=[],t=new Array(e.length),i=[];e.forEach((a,l)=>{let o=0,f=n.length;for(;o<f;){let h=o+f>>1;n[h]<a?o=h+1:f=h}n[o]=a,i[o]=l,t[l]=o>0?i[o-1]:-1});let r=new Set;for(let a=(s=i[n.length-1])!=null?s:-1;a>=0;a=t[a])r.add(a);return r}var Oe=4e6;function ve(e,n,t,i=null){let r=e.map((b,w)=>t(b,"l",w)),s=n.map((b,w)=>t(b,"r",w)),a=0;for(;a<e.length&&a<n.length&&r[a]===s[a];)a++;let l=0;for(;l<e.length-a&&l<n.length-a&&r[e.length-1-l]===s[n.length-1-l];)l++;let o=e.length-a-l,f=n.length-a-l,h=[];for(let b=0;b<a;b++)h.push([b,b]);let d=o>0&&f>0&&(o+1)*(f+1)>Oe?Ze(r,s,a,o,f):null;if(d)h.push(...d);else if(o>0&&f>0&&(o+1)*(f+1)<=Oe){let b=f+1,w=new Uint32Array((o+1)*b);for(let M=o-1;M>=0;M--)for(let k=f-1;k>=0;k--)w[M*b+k]=r[a+M]===s[a+k]?w[(M+1)*b+k+1]+1:Math.max(w[(M+1)*b+k],w[M*b+k+1]);for(let M=0,k=0;M<o&&k<f;)r[a+M]===s[a+k]?(h.push([a+M,a+k]),M++,k++):w[(M+1)*b+k]>=w[M*b+k+1]?M++:k++}for(let b=l;b>0;b--)h.push([e.length-b,n.length-b]);h.push([e.length,n.length]);let p=[],v=(b,w)=>p.push({id:w>=0?`#${w}`:`#~${b}`,hasL:b>=0,hasR:w>=0,l:b>=0?e[b]:void 0,r:w>=0?n[w]:void 0,li:b,ri:w,moved:!1}),m=0,A=0;for(let[b,w]of h){let M=b-m,k=w-A;if(i&&M>0&&k>0&&M*k<=xe)for(let[E,T]of nn(e,n,m,M,A,k,i))v(E,T);else{let E=Math.min(M,k);for(let T=0;T<E;T++)v(m+T,A+T);for(let T=E;T<M;T++)v(m+T,-1);for(let T=E;T<k;T++)v(-1,A+T)}b<e.length&&v(b,w),m=b+1,A=w+1}return p}var xe=25e4,en=.5;function nn(e,n,t,i,r,s,a){let l=s+1,o=new Float64Array(i*s);for(let v=0;v<i;v++)for(let m=0;m<s;m++){let A=Number(a(e[t+v],n[r+m]))||0;o[v*s+m]=A>=en?A:-1}let f=new Float64Array((i+1)*l);for(let v=i-1;v>=0;v--)for(let m=s-1;m>=0;m--){let A=o[v*s+m];f[v*l+m]=Math.max(f[(v+1)*l+m],f[v*l+m+1],A>=0?A+f[(v+1)*l+m+1]:-1)}let h=[],d=0,p=0;for(;d<i&&p<s;){let v=o[d*s+p];v>=0&&f[d*l+p]===v+f[(d+1)*l+p+1]?(h.push([t+d,r+p]),d++,p++):f[d*l+p]===f[(d+1)*l+p]?(h.push([t+d,-1]),d++):(h.push([-1,r+p]),p++)}for(;d<i;d++)h.push([t+d,-1]);for(;p<s;p++)h.push([-1,r+p]);return h}var $e=Ee(ce(),1),pe=new $e.default;function de(e,n,t=20){let i=pe.diff_main(String(e),String(n));return Math.max(String(e).length,String(n).length)>=t?pe.diff_cleanupSemantic(i):pe.diff_cleanupEfficiency(i),i.map(([r,s])=>[r,s])}var K=e=>e!==null&&typeof e=="object"&&!Array.isArray(e),te=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),tn=["id","key","uuid","code"],rn=["title","name","label","heading"],q={child:1,moved:2,modified:3,added:4,deleted:4};function me(e,n,t={}){let i={textMin:20,detectMoves:!0,numeric:!1,whitespace:!1,...t},r={keys:z(i.keys),ignore:z(i.ignore),titles:z(i.titles),labels:z(i.labels),equals:z(i.equals),similar:z(i.similar),identity:z(i.identity),units:z(i.countBy)},s=u=>!!r.ignore(u),a=[],l=new Map,o=new WeakMap,f=(u,c)=>{u&&typeof u=="object"&&o.set(u,c)},h=new WeakMap,d=(u,c,y)=>{let _=l.get(u);(!_||q[c]>q[_.status]||y&&!_.own&&q[c]>=q[_.status])&&l.set(u,{status:c,own:y})};function p(u,c,y){let _=r.keys(u);if(_===!1)return null;if(typeof _=="function")return[c,y].every(R=>R.every((B,$)=>{let U=_(B,$);return U!=null}))?_:null;if(typeof _=="string"||Array.isArray(_)){let P=Array.isArray(_)?_:[_];return(R,B)=>{if(!K(R))return String(R);for(let $ of P)if(R[$]!==void 0&&R[$]!==null&&R[$]!=="")return String(R[$]);return`#${B}`}}let I=[...c,...y];if(!I.length||!I.every(K))return null;for(let P of tn)if([c,y].every(B=>{let $=new Set;return B.every(U=>U[P]!==void 0&&U[P]!==null&&!$.has(U[P])&&$.add(U[P]))}))return B=>String(B[P]);return null}function v(u){let c=r.identity(u),y=_=>Ie(_,I=>s(`${u}${I?"."+I:""}`));return typeof c!="function"?y:_=>{let I=c(_);return I==null?y(_):"id:"+I}}function m(u){let c=r.similar(u);return typeof c=="function"?c:null}function A(u,c,y){var I;let _=r.titles(c);if(typeof _=="function")return String((I=_(u))!=null?I:y);if(typeof _=="string"&&K(u)&&u[_]!=null)return String(u[_]);if(K(u)){for(let P of rn)if(typeof u[P]=="string"&&u[P])return u[P]}return K(u)||Array.isArray(u)?y:String(u)}function b(u,c,y,_){let I=r.labels(u);if(typeof I=="function")return String(I(_));if(typeof I=="string")return I;let P=c[c.length-1];return y!=null?y:P?"k"in P?P.k:P.i:""}function w(u,c,y){let _=r.equals(y);return typeof _=="function"?!!_(u,c):Object.is(u,c)?!0:i.numeric&&u!==""&&c!==""&&u!==null&&c!==null&&!isNaN(Number(u))&&!isNaN(Number(c))?Number(u)===Number(c):i.whitespace&&typeof u=="string"&&typeof c=="string"?u.trim().replace(/\\s+/g," ")===c.trim().replace(/\\s+/g," "):!1}function M(u,c,y){var P;let _=J(c);f(u,_),d(_,y,!1);let I=V(c);if(Array.isArray(u)){let R=(P=p(I,u,[]))!=null?P:((U,H)=>y==="deleted"?`#~${H}`:`#${H}`),B=new Map,$=[];u.forEach((U,H)=>{var Y;let C=String(R(U,H)),X=((Y=B.get(C))!=null?Y:0)+1;B.set(C,X),X>1&&(C+=`#${X}`),$.push(C),M(U,[...c,{i:C}],y)}),h.set(u,$)}else if(K(u))for(let R of Object.keys(u))s(V([...c,{k:R}]))||M(u[R],[...c,{k:R}],y)}function k(u,c,y,_,I,P,R,B,$,U){let H=J(I),C=V(I),X={path:H,pattern:C,crumbs:P.slice(),ancestors:R.map(j=>j.path),ancestorPatterns:R.map(j=>j.pattern)};i.raw&&(X.at={left:y?B:null,right:_?$:null,...U?{gap:U}:{}});let Y=j=>{let L={...X,...j};L.label=b(C,I,j.label,L),a.push(L),d(H,L.type,!0)};if(!y&&!_)return;if(!y)return M(c,I,"added"),Y({type:"added",kind:Fe(c),left:void 0,right:c,diffs:null}),c;if(!_)return M(u,I,"deleted"),Y({type:"deleted",kind:Fe(u),left:u,right:void 0,diffs:null}),u;f(u,H),f(c,H);let ie=r.identity(C);if(typeof ie=="function"&&u&&c&&typeof u=="object"&&typeof c=="object"){let j=ie(u);if(j!=null&&j===ie(c))return c}if(Array.isArray(u)&&Array.isArray(c)){let j=p(C,u,c),L=j?Ce(u,c,j,i.detectMoves):ve(u,c,v(C?`${C}.*`:"*"),m(C?`${C}.*`:"*")),F=[],Q=C?`${C}.*`:"*",W=new Array(u.length),ye=new Array(c.length),Me=[],Ae=new Array(L.length),ke=new Array(L.length);if(i.raw){for(let D=L.length-1,G=c.length;D>=0;D--)Ae[D]=G,L[D].hasR&&(G=L[D].ri);for(let D=L.length-1,G=u.length;D>=0;D--)ke[D]=G,L[D].hasL&&!L[D].moved&&(G=L[D].li)}let se=-1;for(let D of L){se++,D.hasL&&(W[D.li]=D.id),D.hasR&&(ye[D.ri]=D.id),Me.push(D.id);let G=D.hasR?D.r:D.l,ze={i:D.id},ae=[...I,ze],oe=A(G,Q,D.id),le=[...R,{path:H,pattern:C}];if(D.moved){let Se=J(ae),De={path:Se,pattern:Q,crumbs:[...P,oe],ancestors:le.map(fe=>fe.path),ancestorPatterns:le.map(fe=>fe.pattern),type:"moved",kind:"node",label:oe,left:D.li+1,right:D.ri+1,diffs:null};i.raw&&(De.at={left:[...B,D.li],right:[...$,D.ri]}),a.push(De),d(Se,"moved",!0)}let ne=k(D.l,D.r,D.hasL,D.hasR,ae,[...P,oe],le,i.raw&&D.hasL?[...B,D.li]:null,i.raw&&D.hasR?[...$,D.ri]:null,i.raw?D.hasR?D.hasL?null:{side:"left",parent:B,index:ke[se]}:{side:"right",parent:$,index:Ae[se]}:null);ne&&typeof ne=="object"&&f(ne,J(ae)),F.push(ne)}return h.set(u,W),h.set(c,ye),h.set(F,Me),F}if(K(u)&&K(c)){let j={},L=[...Object.keys(c),...Object.keys(u).filter(F=>!te(c,F))];for(let F of L){let Q=[...I,{k:F}];if(s(V(Q))){j[F]=te(c,F)?c[F]:u[F];continue}let W=k(u[F],c[F],te(u,F),te(c,F),Q,P,[...R,{path:H,pattern:C}],i.raw?[...B,F]:null,i.raw?[...$,F]:null,null);W&&typeof W=="object"&&f(W,J(Q)),j[F]=W}return j}if(w(u,c,C))return c;let ee=j=>j===null||["string","number","boolean"].includes(typeof j),He=ee(u)&&ee(c)&&u!==null&&c!==null?de(String(u),String(c),i.textMin):null;return Y({type:"modified",kind:ee(u)&&ee(c)?"value":"node",left:u,right:c,diffs:He}),c}let E=k(e,n,e!==void 0,n!==void 0,[],[],[],[],[],null);for(let u of a)for(let c of u.ancestors)d(c,"child",!1);let T={stats:sn(a,r.units),changes:a,nodes:Object.fromEntries(l),merged:E,pathOf:(u,c)=>{var _;let y=typeof u=="string"?u:o.get(u);if(y===void 0)return null;if(c===void 0)return y;if(typeof c=="number"){let I=Array.isArray(u)?(_=h.get(u))==null?void 0:_[c]:void 0;return I===void 0?null:`${y}[${String(I).replace(/[\\\\[\\]]/g,P=>"\\\\"+P)}]`}return`${y}${y?".":""}${c}`},statusOf:(u,c)=>{let y=T.pathOf(u,c),_=y===null?void 0:l.get(y);return _?_.status:null},changesAt:(u,c)=>{let y=T.pathOf(u,c);return y===null?[]:a.filter(_=>_.path===y)}};return T}function Fe(e){return e!==null&&typeof e=="object"?"node":"value"}function sn(e,n){let t={added:0,modified:0,deleted:0,moved:0},i=new Map;for(let r of e){let s=r.path,a=!0;if(n(r.pattern)===void 0){s=null;for(let f=r.ancestors.length-1;f>=0;f--)if(n(r.ancestorPatterns[f])!==void 0){s=r.ancestors[f],a=!1;break}s===null&&(s=r.path,a=!0)}let l=a?r.type:"modified",o=i.get(s);(!o||q[l]>q[o])&&i.set(s,l)}for(let r of i.values())t[r]++;return t}var Le=new WeakMap,Be=new WeakMap;function re(e){if(e.v!==void 0)return e.v;let n=Be.get(e);if(n===void 0){n="";for(let t of e.c)if(n+=(n?" ":"")+re(t),n.length>2e3)break;Be.set(e,n)}return n}function Ue(e){var t;let n=Le.get(e);if(!n){let i=re(e).slice(0,600);n=new Map;for(let r=0;r<i.length-1;r++){let s=i.substr(r,2);n.set(s,((t=n.get(s))!=null?t:0)+1)}Le.set(e,n)}return n}function an(e,n){let t=e.v!==void 0,i=n.v!==void 0;if(t!==i||!t&&e.n!==n.n)return 0;if(!t&&e.k&&n.k)return e.k===n.k?1:0;let r=!t&&e.c.length>1&&n.c.length>1&&e.c[0].h===n.c[0].h?.75:0,s=Ue(e),a=Ue(n);if(!s.size&&!a.size)return t?e.v===n.v?1:.55:.75;if(!s.size||!a.size)return Math.max(r,.55);let l=0,o=0,f=0;for(let p of s.values())o+=p;for(let p of a.values())f+=p;for(let[p,v]of s){let m=a.get(p);m&&(l+=Math.min(v,m))}let h=2*l/(o+f),d=re(e).length<=24&&re(n).length<=24?.55:0;return t?Math.max(h,d):Math.max(.3+.7*h,d,r)}var on={identity:{"**":e=>e&&typeof e=="object"&&!Array.isArray(e)?e.h:void 0},ignore:["**.h","**.i","**.k","**.virt"],keys:{"**.c":e=>e&&e.k?e.n+"#"+e.k:null},similar:{"**.c.*":an},raw:!0,textMin:12,detectMoves:!0};function _e(e){var l;let n=be(),t=me(e.left,e.right,{...on,...(l=e.options)!=null?l:{}}),i=t.changes.map(o=>({type:o.type,kind:o.kind,path:o.path,at:o.at,diffs:o.diffs,left:o.left!==null&&typeof o.left=="object"?null:o.left,right:o.right!==null&&typeof o.right=="object"?null:o.right})),r=be(),s=e.leftAnchors&&e.rightAnchors?ge(e.leftAnchors,e.rightAnchors):[],a=new Int32Array(s.length*2);return s.forEach(([o,f],h)=>{a[2*h]=o,a[2*h+1]=f}),{changes:i,stats:t.stats,anchorPairs:a,ms:{compare:r-n,anchors:be()-r}}}function be(){return(typeof performance!="undefined"?performance:Date).now()}function we(e){let n=new Array(e.length);for(let t=0;t<e.length;t++){let i=e[t],r=i.ref!==void 0?{n:i.n,c:n[i.ref].c,h:i.h,i:t,virt:1}:i.v!==void 0?{v:i.v,h:i.h,i:t}:{n:i.n,c:[],h:i.h,i:t};i.a&&(r.a=i.a),i.k&&(r.k=i.k),n[t]=r,i.p>=0&&n[i.p].c.push(r)}return n[0]}var x=new Map;self.onmessage=e=>{var t,i;let n=e.data;try{if(n.part){let r=x.get(n.id);r||(r={left:[],right:[]},x.set(n.id,r));let s=r[n.part];for(let a=0;a<n.recs.length;a++)s[n.at+a]=n.recs[a];return}if(n.go){let r=(t=x.get(n.id))!=null?t:{left:[],right:[]};x.delete(n.id);let s=_e({left:we(r.left),right:we(r.right),leftAnchors:n.leftAnchors,rightAnchors:n.rightAnchors,options:n.options});self.postMessage({id:n.id,ok:!0,out:s},[s.anchorPairs.buffer]);return}n.job&&self.postMessage({id:n.id,ok:!0,out:_e(n.job)})}catch(r){x.delete(n.id),self.postMessage({id:n.id,ok:!1,error:String((i=r==null?void 0:r.stack)!=null?i:r)})}};})();\n';
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
  var SideMarks = class {
    constructor(name) {
      this.name = name;
      this.attrs = [];
      this.ranges = { add: [], ins: [], del: [], focus: [] };
      this.wins = /* @__PURE__ */ new Set();
    }
    attr(el, name, value) {
      if (!el || el.nodeType !== 1) return;
      const cur = el.getAttribute(name);
      if (cur && rank(cur) >= rank(value)) return;
      el.setAttribute(name, value);
      this.attrs.push([el, name]);
    }
    textRange(textNode, start, end, kind) {
      const doc = textNode.ownerDocument;
      const r = doc.createRange();
      const map = normIndexMap(textNode.data);
      if (!map.length) return null;
      const s = map[Math.min(start, map.length - 1)];
      const e = end > start ? map[Math.min(end, map.length) - 1] + 1 : s;
      r.setStart(textNode, s);
      r.setEnd(textNode, Math.min(e, textNode.data.length));
      this.ranges[kind].push(r);
      this.wins.add(doc.defaultView);
      return r;
    }
    wholeText(textNode, kind) {
      const r = textNode.ownerDocument.createRange();
      r.selectNodeContents(textNode);
      this.ranges[kind].push(r);
      this.wins.add(textNode.ownerDocument.defaultView);
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
      for (const r of ranges) this.wins.add(r.startContainer.ownerDocument.defaultView);
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
  function ensureMarkStyle(doc, name) {
    var _a;
    if (!doc) return;
    let st = doc.getElementById("sgc-mark-style");
    if (!st) {
      st = doc.createElement("style");
      st.id = "sgc-mark-style";
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
  function getWorker() {
    if (workerBroken) return null;
    if (sharedWorker) return sharedWorker;
    try {
      sharedWorker = spawnWorker();
      sharedWorker.onmessage = (e) => {
        const w = waiting.get(e.data.id);
        if (!w) return;
        waiting.delete(e.data.id);
        e.data.ok ? w.resolve(e.data.out) : w.reject(new Error(e.data.error));
      };
      sharedWorker.onerror = (e) => {
        var _a;
        workerBroken = true;
        sharedWorker = null;
        for (const w of waiting.values()) w.fallback();
        waiting.clear();
        (_a = e.preventDefault) == null ? void 0 : _a.call(e);
      };
      return sharedWorker;
    } catch {
      workerBroken = true;
      return null;
    }
  }
  async function runJob(sl, sr, extra, useWorker) {
    const w = useWorker ? getWorker() : null;
    const local = () => diffTrees({ left: sl.tree, right: sr.tree, leftAnchors: sl.anchorHashes, rightAnchors: sr.anchorHashes, options: extra });
    if (!w) return local();
    const id = ++jobSeq;
    const done = new Promise((resolve, reject) => waiting.set(id, { resolve, reject, fallback: () => resolve(local()) }));
    const CHUNK = 15e3;
    for (const [side, s] of [["left", sl], ["right", sr]]) {
      for (let k = 0; k < s.flat.length; k += CHUNK) {
        w.postMessage({ id, part: side, at: k, recs: s.flat.slice(k, k + CHUNK) });
        await yieldToBrowser();
      }
    }
    w.postMessage({ id, go: true, leftAnchors: sl.anchorHashes, rightAnchors: sr.anchorHashes, options: extra });
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
      ...options
    };
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
      state.running = true;
      state.error = null;
      emit("start");
      try {
        const L = root("left"), R = root("right");
        ensureMarkStyle(L.ownerDocument, name + "l");
        ensureMarkStyle(R.ownerDocument, name + "r");
        const t0 = performance.now();
        const sopt = { attrs: opt.attrs, ignore: opt.ignore, anchors: opt.anchors, keyAttrs: opt.keyAttrs, flatten: (_a = opt.flatten) != null ? _a : opt.page };
        const big = L.getElementsByTagName("*").length + R.getElementsByTagName("*").length > 6e3;
        const sl = big ? await snapshotAsync(L, sopt) : snapshot(L, sopt);
        if (id !== runId || destroyed) return;
        const sr = big ? await snapshotAsync(R, sopt) : snapshot(R, sopt);
        if (id !== runId || destroyed) return;
        const t1 = performance.now();
        const size = sl.nodes.length + sr.nodes.length;
        const useWorker = opt.worker === true || opt.worker === "auto" && size > 4e3;
        const out = await runJob(sl, sr, opt.rules, useWorker);
        if (id !== runId || destroyed) return;
        const t2 = performance.now();
        snaps = { left: sl, right: sr };
        await apply(out, id);
        if (id !== runId || destroyed) return;
        snaps = { right: { nodes: sr.nodes } };
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
        const el = (node == null ? void 0 : node.nodeType) === 1 ? node : node == null ? void 0 : node.parentElement;
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
      for (const [el, prop, old] of padded) el.style[prop] = old;
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
      const el = n.nodeType === 1 ? n : n.parentElement;
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
      return cs.boxSizing === "border-box" ? ch : ch + px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
    }
    function spaceOf(el) {
      const z = zoomOf(el) || 1;
      const r = el.getBoundingClientRect();
      const win = el.ownerDocument.defaultView;
      const cs = win.getComputedStyle(el);
      const ps = el.parentElement ? win.getComputedStyle(el.parentElement) : null;
      const h2 = layoutHeight(el);
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
      while (el && el.parentElement && el.parentElement !== r && !(opt.page && el.parentElement.matches(opt.page))) el = el.parentElement;
      return el && el !== r ? el : null;
    }
    let lazyIO = [];
    let ensureAligned = async () => {
    };
    async function alignHeights(list, tick) {
      var _a, _b;
      unalign();
      pageIdx = null;
      for (const io of lazyIO) io.disconnect();
      lazyIO = [];
      ensureAligned = async () => {
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
            for (const key of queue) for (const ch of (_a2 = groups.get(key)) != null ? _a2 : []) if (!done.has(ch)) {
              done.add(ch);
              batch.push(ch);
            }
            queue.clear();
            if (batch.length) await alignBatch(batch, async () => !destroyed);
          }
        } finally {
          draining = false;
        }
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
          for (const e of entries) if (e.isIntersecting) queue.add(side + ":" + idx.get(e.target));
          drain();
        }, { root: ioRoot, rootMargin: "150% 0px 150% 0px" });
        for (const p of pages) if (groups.has(side + ":" + idx.get(p))) io.observe(p);
        lazyIO.push(io);
      }
    }
    async function alignBatch(list, tick) {
      var _a, _b, _c, _d, _e, _f, _g;
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
      for (const ch of list) {
        if (ch.type === "added" || ch.type === "deleted" || !ch.left || !ch.right) continue;
        pairs.push([unitOf(ch.left), unitOf(ch.right)]);
        for (const n of (_e = ch.alsoLeft) != null ? _e : []) pairs.push([unitOf(n), unitOf(ch.right)]);
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
          const key = (_f = u == null ? void 0 : u.getAttribute) == null ? void 0 : _f.call(u, "data-sgc-key");
          if (!u || !key || u === (side === "right" ? ch.right : ch.left)) continue;
          const v = root(other).querySelector(`[data-sgc-key="${esc2(key)}"]`);
          if (!v) continue;
          const inner = (_g = ch[side].nodeType === 1 ? ch[side] : ch[side].parentElement) == null ? void 0 : _g.closest("[data-sgc-key]");
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
        padded.push([el, prop, el.style[prop]]);
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
      var _a, _b, _c, _d;
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
      try {
        if (opt.page) {
          let movedToPage = false;
          for (const { side, block } of sides) {
            const pg = (_c = block.closest) == null ? void 0 : _c.call(block, opt.page);
            if (!pg) continue;
            const sc = scrollers[side];
            const d = topIn(pg, sc.doc) - sc.viewTop();
            if (d > sc.height() * 1.5 || d + pg.getBoundingClientRect().height < -sc.height() * 0.5) {
              const v = Math.max(0, Math.min(sc.top + d - sc.height() * 0.15, sc.max()));
              const t = sc.target;
              if (t.scrollTo) t.scrollTo({ top: v, behavior: soft ? "smooth" : "instant" });
              else sc.top = v;
              movedToPage = true;
            }
          }
          if (movedToPage) {
            link == null ? void 0 : link.pause(2e3);
            await Promise.all(sides.map(({ side }) => settle(scrollers[side])));
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            if (token !== goToken) return;
          }
        }
        if (keys.length) await ensureAligned(keys);
        if (token !== goToken) return;
        for (let round = 0; round < 7 && !userMoved; round++) {
          if (keys.length) await ensureAligned(keys);
          if (token !== goToken) return;
          let moving = false;
          sides = sides.map(({ side }) => ({ side, block: targetOf(side) })).filter((x) => x.block);
          for (const { side, block } of sides) {
            if (!block.isConnected) continue;
            const sc = scrollers[side];
            if (Math.abs(offBy(sc, block)) > 2) {
              scrollIntoScroller(sc, block, 0.3, soft);
              moving = true;
            }
          }
          if (!moving) break;
          link == null ? void 0 : link.pause(2e3);
          await Promise.all(sides.map(({ side }) => settle(scrollers[side])));
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
        if (((_d = ch[side]) == null ? void 0 : _d.nodeType) === 3) {
          const r = ch[side].ownerDocument.createRange();
          r.selectNodeContents(ch[side]);
          fr.push(r);
        }
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
    }
    function renderRedline(target) {
      var _a, _b;
      if (!snaps) throw new Error("[sg-compare] run() \uC774 \uB05D\uB09C \uB4A4\uC5D0 \uBD80\uB974\uC138\uC694");
      const R = root("right");
      const doc = target.ownerDocument;
      ensureMarkStyle(doc, name + "x");
      const clone = doc.importNode(R, true);
      for (const sp of clone.querySelectorAll(".sgc-spacer")) sp.remove();
      for (const el of clone.querySelectorAll("[style]")) {
        if (padded.some(([p]) => p === el)) el.removeAttribute("style");
      }
      const cs = snapshot(clone, { attrs: opt.attrs, ignore: opt.ignore, anchors: "", keyAttrs: opt.keyAttrs, flatten: (_a = opt.flatten) != null ? _a : opt.page });
      if (cs.nodes.length !== snaps.right.nodes.length) console.warn("[sg-compare] \uD55C \uC7A5 \uBCF4\uAE30: \uBCF5\uC0AC\uBCF8 \uAD6C\uC870\uAC00 \uB2EC\uB77C \uC77C\uBD80 \uD45C\uC2DC\uAC00 \uC5B4\uAE0B\uB0A0 \uC218 \uC788\uC2B5\uB2C8\uB2E4");
      const inserts = [];
      const idx = new Map(snaps.right.nodes.map((n, i) => [n, i]));
      const flatList = state.changes.flatMap((c) => !c.extra ? [c] : [
        { ...c, what: "node" },
        ...c.extra.map((x) => ({ ...c, what: "node", [c.type === "added" ? "right" : "left"]: x.node, gap: x.gap }))
      ]);
      for (const ch of flatList) {
        if (ch.what === "text" && ch.type === "modified" && ch.diffs && ch.right) {
          const i = idx.get(ch.right);
          const tn = cs.nodes[i];
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
          const n = ch.right ? cs.nodes[idx.get(ch.right)] : null;
          const el = (n == null ? void 0 : n.nodeType) === 1 ? n : n == null ? void 0 : n.parentElement;
          el == null ? void 0 : el.setAttribute("data-sgc", ch.type === "moved" ? "moved" : "modified");
        } else if (ch.type === "added" && ch.right) {
          const n = cs.nodes[idx.get(ch.right)];
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
          const gi = idx.get(ch.gap.node);
          inserts.push({ ref: cs.nodes[gi], end: ch.gap.end, n });
        }
      }
      for (const { ref, end, n } of inserts) {
        if (!ref) continue;
        if (end) ref.appendChild(n);
        else (_b = ref.parentNode) == null ? void 0 : _b.insertBefore(n, ref);
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
        clearTimeout(debounceTimer);
        clearTimeout(focusTimer);
        unwatch();
        link == null ? void 0 : link.destroy();
        unalign();
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
  function ensureUiStyle(doc = document) {
    var _a;
    if (doc.getElementById("sgc-ui-style")) return;
    const st = doc.createElement("style");
    st.id = "sgc-ui-style";
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
    ensureUiStyle(doc);
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
      if (e.key === "F7") {
        e.preventDefault();
        e.shiftKey ? ctrl.prev() : ctrl.next();
      }
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
    ensureUiStyle(doc);
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
  function mountViewer(host, o) {
    var _a, _b, _c, _d;
    const doc = host.ownerDocument;
    ensureUiStyle(doc);
    const m = getMessages(o.locale, o.labels);
    const frame = (src) => {
      var _a2, _b2;
      const f = h(doc, "iframe", { class: "sgc-frame", title: (_a2 = src.label) != null ? _a2 : "" });
      if (src.url) f.src = src.url;
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
      const src = fr.contentDocument;
      const head = src.head ? src.head.innerHTML : "";
      const base = src.baseURI ? `<base href="${src.baseURI.replace(/"/g, "&quot;")}">` : "";
      fx.srcdoc = `<!doctype html><html lang="${src.documentElement.lang || ""}"><head>${base}${head}</head><body class="${src.body.className}"></body></html>`;
      fx.addEventListener("load", () => {
        ctrl.renderRedline(fx.contentDocument.body);
        redlineDirty = false;
      }, { once: true });
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
  return __toCommonJS(index_exports);
})();
