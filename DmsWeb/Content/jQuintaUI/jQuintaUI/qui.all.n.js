/// <reference path="../../../Scripts/jquery-1.7.2-vsdoc.js" />

(function () {

    jQuery.fn.ensureVisible = function () {
        var args, itemMax, itemMin, oflow, opts, paneMax, paneMin, parent;
        args = Array.prototype.slice.apply(arguments);
        opts = {
            speed: 150,
            offset: 0
        };
        if (typeof args[0] === 'object') $.extend(opts, args.shift());
        if (typeof args[0] === 'number') opts.speed = args.shift();
        if (typeof args[0] === 'function') opts.callback = args.shift();
        parent = this.offsetParent();
        oflow = parent.css('overflow-y') || parent.css('overflow');
        if (!(oflow === 'auto' || oflow === 'scroll')) return this;
        paneMin = parent.scrollTop();
        paneMax = paneMin + parent.innerHeight();
        itemMin = this.position().top + paneMin - opts.offset;
        itemMax = itemMin + this.outerHeight() + opts.offset;
        if (itemMax > paneMax) {
            parent.stop().animate({
                scrollTop: itemMax - parent.innerHeight()
            }, opts.speed, opts.callback);
        } else if (itemMin < paneMin) {
            parent.stop().animate({
                scrollTop: itemMin
            }, opts.speed, opts.callback);
        } else {
            if (typeof opts.callback === 'function') opts.callback();
        }
        return this;
    };

}).call(this);

(function () {

    jQuery.fn.ensureVisibleVertical = function () {
        var args, itemMax, itemMin, oflow, opts, paneMax, paneMin, parent;
        args = Array.prototype.slice.apply(arguments);
        opts = {
            speed: 150,
            offset: 0,
            callback: undefined,
            parent: undefined
        };
        if (typeof args[0] === 'object') $.extend(opts, args.shift());
        if (typeof args[0] === 'number') opts.speed = args.shift();
        if (typeof args[0] === 'function') opts.callback = args.shift();
        parent = opts.parent ? opts.parent : this.offsetParent();
        oflow = parent.css('overflow-x') || parent.css('overflow');
        if (!(oflow === 'auto' || oflow === 'scroll')) return this;
        paneMin = parent.scrollTop();
        paneMax = paneMin + parent.innerHeight();
        itemMin = this.position().top + paneMin - opts.offset;
        itemMax = itemMin + this.outerHeight() + 2 * opts.offset;
        if (itemMax > paneMax) {
            parent.stop().animate({
                scrollTop: itemMax - parent.innerHeight()
            }, opts.speed, opts.callback);
        } else if (itemMin < paneMin) {
            parent.stop().animate({
                scrollTop: itemMin
            }, opts.speed, opts.callback);
        } else {
            if (typeof opts.callback === 'function') opts.callback();
        }
        return this;
    };

}).call(this);

(function () {

    jQuery.fn.ensureVisibleHorizontal = function () {
        var args, itemMax, itemMin, oflow, opts, paneMax, paneMin, parent;
        args = Array.prototype.slice.apply(arguments);
        opts = {
            speed: 150,
            offset: 0,
            callback: undefined,
            parent: undefined
        };
        if (typeof args[0] === 'object') $.extend(opts, args.shift());
        if (typeof args[0] === 'number') opts.speed = args.shift();
        if (typeof args[0] === 'function') opts.callback = args.shift();
        parent = opts.parent ? opts.parent : this.offsetParent();
        oflow = parent.css('overflow-x') || parent.css('overflow');
        if (!(oflow === 'auto' || oflow === 'scroll')) return this;
        paneMin = parent.scrollLeft();
        paneMax = paneMin + parent.innerWidth();
        itemMin = this.position().left + paneMin - opts.offset;
        itemMax = itemMin + this.outerWidth() + 2 * opts.offset;
        if (itemMax > paneMax) {
            parent.stop().animate({
                scrollLeft: itemMax - parent.innerWidth()
            }, opts.speed, opts.callback);
        } else if (itemMin < paneMin) {
            parent.stop().animate({
                scrollLeft: itemMin
            }, opts.speed, opts.callback);
        } else {
            if (typeof opts.callback === 'function') opts.callback();
        }
        return this;
    };

}).call(this);

(function () {

    jQuery.fn.moveBodyTo = function (offset) {
        if (typeof offset !== 'number') offset = 50;
        var thisTop, thisHeight, bodyScrollTop, bodyHeight;
        var $body = $('body');
        thisTop = this.offset().top;
        thisHeight = this.innerHeight();
        bodyScrollTop = $body.scrollTop();
        bodyHeight = $body.innerHeight();
        //if (bodyScrollTop >= thisTop) {
        //    $body.scrollTop(thisTop);
        //} else {
        //    $body.scrollTop(thisTop - bodyHeight + thisHeight + offset);
        //}
        if ((bodyHeight + bodyScrollTop) <= (thisTop + thisHeight + offset)) {
            $body.scrollTop(thisTop - bodyHeight + thisHeight + offset);
        }
        if ((thisTop - offset) <= bodyScrollTop) {
            $body.scrollTop(thisTop - offset);
        }

        return this;
    };

}).call(this);

!function () { function Searcher(pattern, options) { options = options || {}; var MATCH_LOCATION = options.location || 0, MATCH_DISTANCE = options.distance || 100, MATCH_THRESHOLD = options.threshold || .6, pattern = options.caseSensitive ? pattern : pattern.toLowerCase(), patternLen = pattern.length; if (patternLen > 32) { throw new Error("Pattern length is too long") } var matchmask = 1 << patternLen - 1; var pattern_alphabet = function () { var mask = {}, i = 0; for (i = 0; i < patternLen; i++) { mask[pattern.charAt(i)] = 0 } for (i = 0; i < patternLen; i++) { mask[pattern.charAt(i)] |= 1 << pattern.length - i - 1 } return mask }(); function match_bitapScore(e, x) { var accuracy = e / patternLen, proximity = Math.abs(MATCH_LOCATION - x); if (!MATCH_DISTANCE) { return proximity ? 1 : accuracy } return accuracy + proximity / MATCH_DISTANCE } this.search = function (text) { text = options.caseSensitive ? text : text.toLowerCase(); if (pattern === text) { return { isMatch: true, score: 0 } } var i, j, textLen = text.length, scoreThreshold = MATCH_THRESHOLD, bestLoc = text.indexOf(pattern, MATCH_LOCATION), binMin, binMid, binMax = patternLen + textLen, lastRd, start, finish, rd, charMatch, score = 1, locations = []; if (bestLoc != -1) { scoreThreshold = Math.min(match_bitapScore(0, bestLoc), scoreThreshold); bestLoc = text.lastIndexOf(pattern, MATCH_LOCATION + patternLen); if (bestLoc != -1) { scoreThreshold = Math.min(match_bitapScore(0, bestLoc), scoreThreshold) } } bestLoc = -1; for (i = 0; i < patternLen; i++) { binMin = 0; binMid = binMax; while (binMin < binMid) { if (match_bitapScore(i, MATCH_LOCATION + binMid) <= scoreThreshold) { binMin = binMid } else { binMax = binMid } binMid = Math.floor((binMax - binMin) / 2 + binMin) } binMax = binMid; start = Math.max(1, MATCH_LOCATION - binMid + 1); finish = Math.min(MATCH_LOCATION + binMid, textLen) + patternLen; rd = Array(finish + 2); rd[finish + 1] = (1 << i) - 1; for (j = finish; j >= start; j--) { charMatch = pattern_alphabet[text.charAt(j - 1)]; if (i === 0) { rd[j] = (rd[j + 1] << 1 | 1) & charMatch } else { rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((lastRd[j + 1] | lastRd[j]) << 1 | 1) | lastRd[j + 1] } if (rd[j] & matchmask) { score = match_bitapScore(i, j - 1); if (score <= scoreThreshold) { scoreThreshold = score; bestLoc = j - 1; locations.push(bestLoc); if (bestLoc > MATCH_LOCATION) { start = Math.max(1, 2 * MATCH_LOCATION - bestLoc) } else { break } } } } if (match_bitapScore(i + 1, MATCH_LOCATION) > scoreThreshold) { break } lastRd = rd } return { isMatch: bestLoc >= 0, score: score } } } function Fuse(list, options) { options = options || {}; var keys = options.keys; this.search = function (pattern) { var searcher = new Searcher(pattern, options), i, j, item, text, dataLen = list.length, bitapResult, rawResults = [], resultMap = {}, rawResultsLen, existingResult, results = [], compute = null; function analyzeText(text, entity, index) { if (text !== undefined && text !== null && typeof text === "string") { bitapResult = searcher.search(text); if (bitapResult.isMatch) { existingResult = resultMap[index]; if (existingResult) { existingResult.score = Math.min(existingResult.score, bitapResult.score) } else { resultMap[index] = { item: entity, score: bitapResult.score }; rawResults.push(resultMap[index]) } } } } if (typeof list[0] === "string") { for (i = 0; i < dataLen; i++) { analyzeText(list[i], i, i) } } else { for (i = 0; i < dataLen; i++) { item = list[i]; for (j = 0; j < keys.length; j++) { analyzeText(item[keys[j]], item, i) } } } rawResults.sort(function (a, b) { return a.score - b.score }); rawResultsLen = rawResults.length; for (i = 0; i < rawResultsLen; i++) { results.push(options.id ? rawResults[i].item[options.id] : rawResults[i].item) } return results } } if (typeof module !== "undefined") { if (typeof module.setExports === "function") { module.setExports(Fuse) } else if (module.exports) { module.exports = Fuse } } else { window.Fuse = Fuse } }();

(function () {

    function CompareStrings(str1, str2) {
        var pairs1 = WordLetterPairs(str1.toUpperCase());
        var pairs2 = WordLetterPairs(str2.toUpperCase());

        var intersection = 0;
        var union = pairs1.length + pairs2.length;

        for (var i = 0; i < pairs1.length; i++) {
            for (var j = 0; j < pairs2.length; j++) {
                if (pairs1[i] == pairs2[j]) {
                    intersection++;
                    pairs2.splice(j, 1);
                    break;
                }
            }
        }
        return (2.0 * intersection) / union;
    }

    function WordLetterPairs(str) {
        var AllPairs = [];

        // Tokenize the string and put the tokens/words into an array
        var Words = str.split(' ');

        // For each word
        for (var w = 0; w < Words.length; w++) {
            var word = Words[w];
            if (word) {
                // Find the pairs of characters
                var PairsInWord = LetterPairs(word);
                for (var p = 0; p < PairsInWord.length; p++) {
                    AllPairs.push(PairsInWord[p]);
                }
            }
        }
        return AllPairs;
    }

    function LetterPairs(str) {
        var numPairs = str.length - 1;
        var pairs = [];
        for (var i = 0; i < numPairs; i++) {
            pairs[i] = str.substr(i, 2);
        }
        return pairs;
    }

    function qSearcher(_items, _opts) {
        var opts = _opts || {};
        var props = opts.keys || [],
            resc = opts.count || 10;
        var items = JSON.parse(JSON.stringify(_items));
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var str = '';
            for (var j = 0; j < props.length; j++) {
                str += item[props[j]] + ' ';
            }
            item['__s'] = str;
        }

        this.search = function (query) {
            for (var l = 0; l < items.length; l++) {
                var it = items[l];
                it['__q'] = CompareStrings(it['__s'], query);
            }
            items.sort(function (a, b) { return b['__q'] - a['__q']; });
            var itemsResc = items.slice(0, resc);
            //for (var k = 0; k < itemsResc.length; k++) {
            //    var itt = itemsResc[k];
            //    delete itt['__q'];
            //    delete itt['__s'];
            //}
            return itemsResc;
        };

    }

    window.qSearcher = qSearcher;

})();

(function ($) {
    $.StickyTableHeaders = function (el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Cache DOM refs for performance reasons
        base.$window = $(window);
        base.$clonedHeader = null;
        base.$originalHeader = null;

        // Add a reverse reference to the DOM object
        base.$el.data('StickyTableHeaders', base);

        //
        base.isVisible = false;

        base.init = function () {
            base.options = $.extend({}, $.StickyTableHeaders.defaultOptions, options);

            base.$el.each(function () {
                var $this = $(this);

                // remove padding on <table> to fix issue #7
                $this.css('padding', 0);

                $this.wrap('<div class="divTableWithFloatingHeader"></div>');

                base.$originalHeader = $('thead:first', this);
                base.$clonedHeader = base.$originalHeader.clone();

                base.$clonedHeader.addClass('tableFloatingHeader');
                base.$clonedHeader.css({
                    'position': 'fixed',
                    'top': '0px', // OVDE !!
                    'display': 'none'
                });

                base.$originalHeader.addClass('tableFloatingHeaderOriginal');

                base.$originalHeader.before(base.$clonedHeader);

                // enabling support for jquery.tablesorter plugin
                // forward clicks on clone to original
                //$('th', base.$clonedHeader).click(function (e) {
                //    var index = $('th', base.$clonedHeader).index(this);
                //    $('th', base.$originalHeader).eq(index).click();
                //});
                //$this.bind('sortEnd', base.updateCloneFromOriginal);
            });

            base.updateTableHeaders();

            if (base.options.removeEvents) {
                base.$window.off('scroll resize');
                if (base.options.scrollElementId) {
                    $(base.options.scrollElementId).off('scroll resize');
                }
            }

            if (base.options.scrollElementId) {
                $(base.options.scrollElementId).scroll(base.updateTableHeaders);
            }
            base.$window.scroll(base.updateTableHeaders);
            base.$window.resize(base.updateTableHeaders);
        };

        base.updateTableHeaders = function (e) {
            base.$el.each(function () {
                var $this = $(this);

                // ako nije vidljiv heder ispadaj napolje
                if (!base.$originalHeader.is(':visible')) return;

                // ako je dosao preko trigger resize
                if (e) var forceUpdate = e.isTrigger;

                var offset = $this.offset();
                var scrollTop = base.$window.scrollTop();
                var scrollLeft = base.$window.scrollLeft();

                if ((scrollTop > offset.top) && (scrollTop < offset.top + $this.height())) {
                    if (forceUpdate || base.isVisible == false) {
                        base.isVisible = true;
                        base.$clonedHeader.css({
                            'left': offset.left - scrollLeft + 1,
                            'display': 'block'
                        });
                    }
                    base.updateCloneFromOriginal();
                }
                else {
                    if (base.isVisible == true) {
                        base.isVisible = false;
                        base.$clonedHeader.hide();
                    }
                }
            });
        };

        base.updateCloneFromOriginal = function () {
            // Copy cell widths and classes from original header
            base.$originalHeader.find('td').each(function (i) {
                var origW = window.getComputedStyle($(this).get(0)).width;
                base.$clonedHeader.find('td:nth-child(' + (i + 1) + ')').css('width', origW);
            });
            // Copy row width from whole table
            base.$clonedHeader.css('width', base.$originalHeader.width());
        };

        // Run initializer
        base.init();
    };

    $.StickyTableHeaders.defaultOptions = {
        removeEvents: true,
        scrollElementId: ''
    };

    $.fn.stickyTableHeaders = function (options) {
        return this.each(function () {
            (new $.StickyTableHeaders(this, options));
        });
    };

})(jQuery);


// combobox
(function ($, window, undefined) {

    var settings;
    var $litems = [];
    var litems = [];
    var searchTimeout;

    // --- public ---

    var methods = {

        getSelectedItem: function () {
            var data = this.data('dd');
            if (data) {
                return data.selected;
            } else {
                return undefined;
            }
        },

        getSelectedItemData: function () {
            var data = this.data('dd');
            if (data) {
                var selected = data.selected;
                if (selected) return selected.data;
                else return undefined;
            } else {
                return undefined;
            }
        },

        getSelectedItemDataProperty: function (prop) {
            var data = this.data('dd');
            if (data) {
                var selected = data.selected;
                if (selected && selected.data && selected.data.hasOwnProperty(prop)) {
                    return selected.data[prop];
                }
                else return undefined;
            } else {
                return undefined;
            }
        },
        
        getSelectedItemLabel: function () {
            var data = this.data('dd');
            if (data) {
                var selected = data.selected;
                if (selected) return selected.label;
                else return undefined;
            } else {
                return undefined;
            }

        },

        getSelectedIndex: function () {
            var data = this.data('dd');
            if (data) {
                if (data.selected) {
                    return this.find('.qui-dd-litem.selected').prevAll().length;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        },

        getItems: function () {
            var ret = [];
            this.find('.qui-dd-litem').each(function () {
                var item = {};
                item['label'] = $(this).text();
                item['data'] = $(this).data('data');
                ret.push(item);
            });
            return ret;
        },

        clearItems: function ($this) { // CHAIN
            if ($this == undefined) {
                $this = this;
            }
            return $this.each(function () {
                var data = $(this).data('dd');
                data.selected = undefined;
                $(this).data('dd', data);
                $(this).find('span').empty();
                $(this).find('.qui-dd-litem').remove();
            });
        },

        clearSelection: function ($this) { // CHAIN
            if ($this == undefined) {
                $this = this;
            }
            return $this.each(function () {
                var data = $(this).data('dd');
                if (data) {
                    data.selected = undefined;
                    $(this).data('dd', data);

                    $(this).find('span').empty();
                    $(this).find('.qui-dd-litem').removeClass('selected');

                    $(this).trigger('select', undefined);
                    //$(document).trigger('quinta-changeFocus');
                }
            });
        },

        clearSelectionNoTrigger: function ($this) { // CHAIN
            if ($this == undefined) {
                $this = this;
            }
            return $this.each(function () {
                var data = $(this).data('dd');
                if (data) {
                    data.selected = undefined;
                    $(this).data('dd', data);

                    $(this).find('span').empty();
                    $(this).find('.qui-dd-litem').removeClass('selected');

                    //$(this).trigger('select', undefined);
                }
            });
        },

        setItems: function (items, $this) { // CHAIN
            if (items.length) {
                if ($this == undefined) {
                    $this = this;
                }
                methods.clearSelectionNoTrigger($this); // todo KONTROLA!

                return $this.each(function () {
                    var first = items[0];
                    var $list = $(this).find('.qui-dd-list');
                    $list.empty();

                    var $item;
                    if (first.label == undefined) {
                        for (var i = 0; i < items.length; i++) {
                            $item = $('<div class="qui-dd-litem"><div>' + items[i] + '</div></div>');
                            $list.append($item);
                        }
                    } else {
                        for (var j = 0; j < items.length; j++) {
                            $item = $('<div class="qui-dd-litem"><div>' + items[j].label + '</div></div>');
                            $item.data('data', items[j].data);
                            $list.append($item);
                        }
                    }

                    //if(items.length > 300){
                    //    var data = $(this).data('dd');
                    //    data.settings.searchType = 'firstHit';
                    //    $(this).data('dd', data);
                    //}
                });
            } else {
                //return $();
                if ($this == undefined) {
                    $this = this;
                }
                methods.clearItems($this);
                return $this;
            }
        },

        setItemsFromSelect: function (id) { // CHAIN
            var $select = $(id);
            if ($select.length) {
                var $opts = $select.find('option');
                var $firstOpt = $opts.filter(':first');
                if ($firstOpt.length) {
                    var items = [];
                    if ($firstOpt.is('[value]')) {
                        $opts.each(function () {
                            var item = {};
                            item['label'] = $(this).text();
                            item['data'] = $(this).attr('value');
                            items.push(item);
                        });
                        return methods.setItems(items, this);
                    } else {
                        $opts.each(function () {
                            items.push($(this).text());
                        });
                        return methods.setItems(items, this);
                    }
                } else {
                    return this;
                }
            } else {
                //return $();
                return this;
            }
        },

        setItemsFromBinding: function (array, labelProp, dataProp) { // CHAIN
            var items = [];
            for (var i = 0; i < array.length; i++) {
                var item = {};
                var v = array[i];
                item['label'] = v[labelProp];
                item['data'] = v[dataProp];
                items.push(item);
            }
            return methods.setItems(items, this);
        },
        
        setItemsFromBinding2: function (array, labelProp) { // CHAIN
            var items = [];
            for (var i = 0; i < array.length; i++) {
                var item = {};
                var v = array[i];
                item['label'] = v[labelProp];
                item['data'] = v;
                items.push(item);
            }
            return methods.setItems(items, this);
        },

        selectItemByIndex: function (index, $this) {
            if ($this == undefined) {
                $this = this;
            }
            if (index > -1) {
                var $item = $this.find('.qui-dd-litem')[index];
                if ($item) {
                    $item.click();
                }
            }
        },

        selectItemByIndexNoTrigger: function (index, $this) {
            if ($this == undefined) {
                $this = this;
            }
            if (index > -1) {
                var $item = $this.find('.qui-dd-litem')[index];
                if ($item) {
                    $($item).trigger('click', true);
                }
            }
        },

        selectItemByLabel: function (label) {
            this.find('.qui-dd-litem').each(function () {
                if ($(this).text() == label) {
                    $(this).click();
                    return false;
                }
            });
        },

        selectItemByLabelNoTrigger: function (label) {
            this.find('.qui-dd-litem').each(function () {
                if ($(this).text() == label) {
                    //$(this).click();
                    $(this).trigger('click', true);
                    return false;
                }
            });
        },
        
        selectItemByLabelPartial: function (str) {
            var nadjeno = false;
            this.find('.qui-dd-litem').each(function () {
                var $item = $(this);
                str = str.replace(/\W/g, rep);
                var regex = new RegExp(str, "i"),
                    label = $item.text().replace(/\W/g, rep);
                if (label.search(regex) >= 0) {
                    nadjeno = true;
                    $item.click();
                    return false;
                }
            });
            if (!nadjeno)
                methods.clearSelection(this);
        },
        
        selectItemByLabelPartialNoTrigger: function (str) {
            var nadjeno = false;
            this.find('.qui-dd-litem').each(function () {
                var $item = $(this);
                str = str.replace(/\W/g, rep);
                var regex = new RegExp(str, "i"),
                    label = $item.text().replace(/\W/g, rep);
                if (label.search(regex) >= 0) {
                    //$item.click();
                    nadjeno = true;
                    $(this).trigger('click', true);
                    return false;
                }
            });
            if (!nadjeno)
                methods.clearSelectionNoTrigger(this);
        },

        selectItemByData: function (data) {
            this.find('.qui-dd-litem').each(function () {
                var thisData = $(this).data('data');
                if (thisData == data) {
                    $(this).click();
                    return false;
                }
            });
        },

        selectItemByDataNoTrigger: function (data) {
            this.find('.qui-dd-litem').each(function () {
                var thisData = $(this).data('data');
                if (thisData == data) {
                    //$(this).click();
                    $(this).trigger('click', true);
                    return false;
                }
            });
        },
        
        selectItemByDataProperty: function (prop, value) {
            this.find('.qui-dd-litem').each(function () {
                var thisData = $(this).data('data');
                if (thisData.hasOwnProperty(prop) && thisData[prop] == value){
                    $(this).click();
                    return false;
                }
            });
        },
        
        selectItemByDataPropertyNoTrigger: function (prop, value) {
            this.find('.qui-dd-litem').each(function () {
                var thisData = $(this).data('data');
                if (thisData.hasOwnProperty(prop) && thisData[prop] == value) {
                    //$(this).click();
                    $(this).trigger('click', true);
                    return false;
                }
            });
        },

        enable: function (enabled) {
            var data = $(this).data('dd');
            if (enabled) {
                this.removeClass('disabled');
                data.disabled = false;
            } else {
                this.addClass('disabled');
                data.disabled = true;
            }
            $(this).data('dd', data);
            return this;
        },
        
        isEnabled: function () {
            var data = $(this).data('dd');
            return !data.disabled;
        },
        
        setOpenUp: function (openUp) {
            var $listWrap = this.find('.qui-dd-listwrap');
            if (openUp) {
                $listWrap.get(0).className = 'qui-dd-listwrap top';
            } else {
                $listWrap.get(0).className = 'qui-dd-listwrap bottom';
            }
        },

        init: function (options) {
            settings = {};
            settings = $.extend({
                height: 22,
                width: 198,
                listHeight: 180,
                listWidth: 0,
                showX: true,
                showSearch: true,
                disabled: false,
                openUp: false,
                searchType: 'filter',
                zIndex: '',
                timeout: 300,
                items: []
            }, options);

            return this.each(function () {
                var $this = $(this);
                var h = settings.height;// - 2;
                var w = settings.width;// - 2;
                var lh = settings.listHeight;
                var lw;
                if (settings.listWidth) {
                    lw = settings.listWidth;
                } else {
                    lw = settings.width;
                }
                var m = Math.round((h - 14) / 2);
                var xImage = '';
                var searchInput = '';
                var classes = 'qui qui-dd';
                var spanMaxWMinus = 26;
                if ($this.attr('data-disabled') == 'disabled') settings.disabled = true;
                if (settings.disabled) {
                    classes += ' disabled';
                }
                if (settings.showX) {
                    xImage = '<b style="width:16px"><i class="x" style="margin-top:' + (m - 1) + 'px"></i></b>';
                    spanMaxWMinus = 42;
                }
                if (settings.showSearch) {
                    searchInput = '<div style="margin-bottom:5px;"><input type="text" style="width:' + (lw - 12) + 'px" data-timeout="' + settings.timeout + '"/></div>';
                    lh = settings.listHeight - 29;
                }
                var lwClass = 'qui-dd-listwrap bottom';
                if (settings.openUp) {
                    lwClass = 'qui-dd-listwrap top';
                }
                var zInd = '';
                if (settings.zIndex) {
                    zInd = settings.zIndex;
                }
                $this.addClass(classes).height(h).width(w).css({ 'z-index': zInd }).html('<span style="margin-top:' + (m - 2) + 'px; max-width:' + (w - spanMaxWMinus) + 'px"></span><b><i class="a ad" style="margin-top:' + (m - 2) + 'px"></i></b>' + xImage + '<div class="' + lwClass + '" style="width:' + (lw - 10) + 'px">' + searchInput + '<div class="qui-dd-list" style="height:' + lh + 'px"></div></div>');
                $this.on('click.qui', privateMethods.mainClick);
                $this.on('focus.qui', 'input', privateMethods.searchFocus);
                $this.on('keyup.qui', 'input', privateMethods.searchKeyUp);
                $this.on('click.qui', '.x', privateMethods.xClick);

                // data
                $(this).data('dd', {
                    selected: undefined,
                    clear: settings.showX,
                    settings: settings,
                    disabled: settings.disabled
                });
                // data end

                methods.setItems(settings.items, $this);
                $this.on('click.qui', '.qui-dd-litem', privateMethods.litemClick);

                $this.on('click.qui', '.qui-dd-listwrap', function (e) { e.stopPropagation(); });
            });
        }

    };




    // --- private ---

    var privateMethods = {

        mainClick: function (e) {
            var data = $(this).data('dd');
            if (!$(this).hasClass('disabled') && !data.disabled) {
                //e.stopImmediatePropagation(); todo da li ovo treba da se vrati!
                if (!$(this).hasClass('qui-dd-active')) {
                    $(window).trigger('quiClose');
                    var $inp = $(this).find('input');
                    $inp.val('');
                    $('.qui-dd-active').removeClass('qui-dd-active').find('.qui-dd-listwrap').hide();
                    $(this).find('.a').removeClass('ad').addClass('au');
                    $litems = $(this).find('.qui-dd-litem');
                    litems = $(this).get(0).getElementsByClassName('qui-dd-litem');
                    var sett = data.settings;
                    $(this).find('input').attr('data-searchType', sett.searchType);
                    $(this).addClass('qui-dd-active').find('.qui-dd-listwrap').css({ height: 0, display: 'block' }).animate({ height: sett.listHeight + 'px' }, 150, 'swing', function () {
                        // kod novog update-a Google Chrome-a input.focus() trigger-uje dogadjaj za on('select')...
                        // s tiga select ne treba da fire-uje event dok se nesto ne izabere...
                        $inp.on('select', function (ev) { ev.stopImmediatePropagation(); });
                        $inp.focus();
                        
                        $(this).find('.selected').ensureVisible();
                        $(window).on('click.qui', privateMethods.mainClickOut);
                        $(window).on('quiClose quiCloseThis', privateMethods.close);
                    });
                    $(this).trigger('open');
                } else {
                    //privateMethods.mainClickOut(e);
                    $(window).trigger('quiClose');
                }
            } else {
                $(window).trigger('quiClose');
            }
        },

        close: function (e) {
            //console.log('combo close ' + (new Date()).getTime());

            $(window).off('click.qui');
            clearTimeout(searchTimeout);
            var $quiddactive = $('.qui-dd-active');
            $quiddactive.find('.a').removeClass('au').addClass('ad');
            $quiddactive.removeClass('qui-dd-active').find('.qui-dd-listwrap').hide();
            //$litems.show().removeClass('hover');
            //$litems = $();
            $('.hover').removeClass('hover');
            var n = litems.length;
            for (var nn = 0; nn < n; nn++) {
                var litem = litems[nn];
                litem.style.display = '';
                //litem.className = 'qui-dd-litem';
            }

            $(window).off('quiClose quiCloseThis', privateMethods.close);
        },

        mainClickOut: function (e) {
            /*e.stopPropagation();
            $(window).off('click.qui');
            clearTimeout(searchTimeout);
            var $quiddactive = $('.qui-dd-active');
            $quiddactive.find('.a').removeClass('au').addClass('ad');
            $quiddactive.removeClass('qui-dd-active').find('.qui-dd-listwrap').hide();
            $litems.show().removeClass('hover');
            $litems = $();*/
            e.stopPropagation();
            $(window).trigger('quiClose');
        },

        litemClick: function (e, clickData) {
            e.stopImmediatePropagation();
            var text = $(this).text();
            var $qui = $(this).parents('.qui-dd');

            var data = $qui.data('dd');
            data.selected = { data: $(this).data('data'), label: text };
            $qui.data('dd', data);

            $qui.find('span:first').text(text);

            //$litems = $qui.find('.qui-dd-litem');
            //if(!$litems.length){
            //    $litems = $qui.find('.qui-dd-litem');
            //}
            //$litems.removeClass('selected hover');
            $(this).parent().find('.selected').removeClass('selected');
            $(this).addClass('selected');

            if (!clickData) {
                $qui.trigger('select', data.selected);
                $(document).trigger('quinta-changeFocus-fw');
            }

            //privateMethods.mainClickOut(e);
            $(window).trigger('quiCloseThis');
        },

        searchKeyUp: function (e) {
            var val = $(this).val().trim();
            var timeout = $(this).attr('data-timeout').toDecimal();
            timeout = timeout === false ? 300 : timeout;
            if (e.keyCode == 27) { // esc
                e.preventDefault();
                //privateMethods.mainClickOut(e);
                $(window).trigger('quiClose');
            } else if (e.keyCode == 13) { // enter
                e.preventDefault();
                var $hover = $litems.filter('.hover');
                if ($hover.length) $hover.click();
                else {
                    var $sel = $litems.filter('.selected');
                    var newVal = val.toLowerCase();
                    if ($sel.find('div').text().toLowerCase().contains(newVal)) {
                        if ($sel.length) $sel.click();
                        else {
                            var $qui = $(this).parents('.qui-dd');
                            var data = $qui.data('dd');
                            $qui.trigger('select', data.selected);
                            $(document).trigger('quinta-changeFocus-fw');
                            $(window).trigger('quiClose');
                        }
                    } else {
                        $litems.each(function() {
                            var $litem = $(this);
                            var litemText = $litem.find('div').text().toLowerCase();
                            if (litemText.contains(newVal)) {
                                $litem.click();
                                return false;
                            }
                        });
                    }
                    
                }
            } else if (e.keyCode == 40) { // arr down
                e.preventDefault();
                var $sel = $litems.filter('.hover');
                if (!$sel.length) {
                    $litems.filter(':first').addClass('hover');
                } else {
                    var $next = $sel.nextAll(':visible:first');
                    if ($next.length) {
                        $sel.removeClass('hover');
                        $next.addClass('hover');
                        $next.ensureVisible();
                    }
                }
            } else if (e.keyCode == 38) { // arr up
                e.preventDefault();
                var $sel = $litems.filter('.hover');
                var $prev = $sel.prevAll(':visible:first');
                if ($prev.length) {
                    $sel.removeClass('hover');
                    $prev.addClass('hover');
                    $prev.ensureVisible();
                }
            }
            else { // other keys
                var first = true;
                if (val == '') {
                    clearTimeout(searchTimeout);
                    //$litems.show().removeClass('hover f_hover');
                    var n = litems.length;
                    for (var nn = 0; nn < n; nn++) {
                        var litem = litems[nn];
                        litem.style.display = '';
                        //litem.className = 'qui-dd-litem';
                    }
                } else {
                    clearTimeout(searchTimeout);
                    var st = $(this).attr('data-searchType');
                    if (st == 'filter') {
                        searchTimeout = setTimeout(function () {
                            var forShow = [],
                                forHide = [],
                                regex = new RegExp(val, "i");
                            $litems.each(function () {
                                if ($(this).text().search(regex) < 0) {
                                    forHide.push($(this));
                                } else {
                                    if (first) {
                                        $(this).addClass('f_hover');
                                        forShow.push($(this));
                                        first = false;
                                    } else {
                                        forShow.push($(this));
                                    }
                                }
                            });
                            var fh = forHide.length;
                            var fs = forShow.length;
                            for (var i = 0; i < fh; i++) {
                                forHide[i].get(0).style.display = 'none';
                            }
                            for (var j = 0; j < fs; j++) {
                                forShow[j].get(0).style.display = '';
                            }
                            $('.hover').removeClass('hover');
                            $('.f_hover').removeClass('f_hover').addClass('hover').show().ensureVisible();
                        }, timeout);
                    } else if (st == 'filterKonto') {
                        searchTimeout = setTimeout(function () {
                            var forShow = [],
                                forHide = [],
                                regex = new RegExp(val, "i");
                            $litems.each(function () {
                                var prvi = val[0];
                                if (IsInt(prvi)) {
                                    if ($(this).text().search(regex) != 0) {
                                        forHide.push($(this));
                                    } else {
                                        if (first) {
                                            $(this).addClass('f_hover');
                                            forShow.push($(this));
                                            first = false;
                                        } else {
                                            forShow.push($(this));
                                        }
                                    }
                                } else {
                                    if ($(this).text().search(new RegExp(val, "i")) < 0) {
                                        forHide.push($(this));
                                    } else {
                                        if (first) {
                                            $(this).addClass('f_hover');
                                            forShow.push($(this));
                                            first = false;
                                        } else {
                                            forShow.push($(this));
                                        }
                                    }
                                }
                            });
                            var fh = forHide.length;
                            var fs = forShow.length;
                            for (var i = 0; i < fh; i++) {
                                forHide[i].get(0).style.display = 'none';
                            }
                            for (var j = 0; j < fs; j++) {
                                forShow[j].get(0).style.display = '';
                            }
                            $('.hover').removeClass('hover');
                            $('.f_hover').removeClass('f_hover').addClass('hover').show().ensureVisible();
                        }, timeout);
                    } else if (st == 'filter2') {
                        searchTimeout = setTimeout(function () {
                            val = val.replace(/\W/g, rep);
                            var regex = new RegExp(val, "i"),
                                forShow = [],
                                forHide = [];
                            $litems.each(function () {
                                var text = $(this).text().replace(/\W/g, rep);
                                if (text.search(regex) < 0) {
                                    forHide.push($(this));
                                } else {
                                    if (first) {
                                        $(this).addClass('f_hover');
                                        forShow.push($(this));
                                        first = false;
                                    } else {
                                        forShow.push($(this));
                                    }
                                }
                            });
                            var fh = forHide.length;
                            var fs = forShow.length;
                            for (var i = 0; i < fh; i++) {
                                forHide[i].get(0).style.display = 'none';
                            }
                            for (var j = 0; j < fs; j++) {
                                forShow[j].get(0).style.display = '';
                            }
                            $('.hover').removeClass('hover');
                            $('.f_hover').removeClass('f_hover').addClass('hover').show().ensureVisible();
                        }, timeout);
                    } else if (st == 'firstHit') {
                        searchTimeout = setTimeout(function () {
                            $litems.each(function () {
                                if ($(this).text().search(new RegExp(val, "i")) >= 0) {
                                    $litems.filter('.hover').removeClass('hover');
                                    $(this).addClass('hover').ensureVisible();
                                    return false;
                                }
                            });
                        }, timeout);
                    }
                }
            }
        },

        searchFocus: function () {
            //$litems = $(this).parent().next().find('.qui-dd-litem');
        },

        xClick: function (e) {
            e.stopImmediatePropagation();
            var $qui = $(this).parents('.qui-dd');
            methods.clearSelection($qui);
        }

    };

    var rep = function (c) {
        if (c == ' ') return ' ';
        else {
            var cc = c.charCodeAt(0);
            switch (cc) {
                case 268: case 269: case 262: case 263: // ČčĆć
                    return 'c';
                case 381: case 382:
                    return 'z';
                case 352: case 353:
                    return 's';
                default:
                    return c;
            }
        }
    };



    // --- plugin ---

    $.fn.quiComboBox = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiComboBox');
        }
    };

})(jQuery, window);


// multiselect
(function ($, window, undefined) {

    var settings;
    var $litems = [];
    var litems = [];
    var searchTimeout;

    // --- public ---

    var methods = {

        getSelectedItems: function (type) {
            var arr = [], o = {}, mso = {};
            var isObj = this.data('ms-itemType') == 'object' ?  true :  false; // tip item-a, object ili simple
            if (type == 1) { // vraca niz objekata koji su selektovani, menja objekat i stavlja true u checkedProp
                this.find('.qui.check:not(.qui-ms-selall)').each(function () {
                    var $item = $(this).parent();
                    if (isObj) {
                        o = $.extend({}, $item.data('data'));
                        mso = $item.data('ms-obj');
                        o[mso._checkedProp] = true;
                        arr.push(o);
                    } else {
                        arr.push($(this).parent().data('data'));
                    }
                });
            } else { // default - vraca niz objekata koji su selektovani, ne menja se objekat
                this.find('.qui.check:not(.qui-ms-selall)').each(function () {
                    if (isObj)
                        arr.push($.extend({}, $(this).parent().data('data')));
                    else
                        arr.push($(this).parent().data('data'));
                });
            }
            return arr;
        },

        getItems: function (type) {
            var arr = [], o = {}, mso = {};
            var isObj = this.data('ms-itemType') == 'object' ? true : false; // tip item-a, object ili simple
            if (type == 1) { // vraca niz svih objekata, menja objekat i stavlja true/false u checkedProp
                this.find('.qui-ms-litem').each(function() {
                    var $this = $(this);
                    if (isObj) {
                        o = $.extend({}, $this.data('data'));
                        mso = $this.data('ms-obj');
                        if ($this.hasClass('selected'))
                            o[mso._checkedProp] = true;
                        else
                            o[mso._checkedProp] = false;
                    } else {
                        if ($this.hasClass('selected'))
                            o = { checked: true, data: $this.data('data') };
                        else
                            o = { checked: false, data: $this.data('data') };
                    }
                    arr.push(o);
                });
            } else { // vraca niz svih objekata, ne menja objekat
                this.find('.qui-ms-litem').each(function () {
                    var $this = $(this);
                    if (isObj) {
                        if ($this.hasClass('selected'))
                            o = { checked: true, data: $.extend({}, $this.data('data')) };
                        else
                            o = { checked: false, data: $.extend({}, $this.data('data')) };
                    } else {
                        if ($this.hasClass('selected'))
                            o = { checked: true, data: $this.data('data') };
                        else
                            o = { checked: false, data: $this.data('data') };
                    }
                    arr.push(o);
                });
            }
            return arr;
        },
        
        selectAll: function () {
            return this.each(function () {
                var $checked = $(this).find('.qui');
                $checked.each(function () {
                    $(this).quiCheckBox('setChecked', true);
                });
                $(this).quiMultiselect('updateWidgetLabel');
            });
        },

        deselectAll: function () {
            return this.each(function() {
                var $checked = $(this).find('.qui.check:not(.qui-ms-selall)');
                $checked.each(function() {
                    $(this).quiCheckBox('setChecked', false);
                });
                $(this).quiMultiselect('updateWidgetLabel');
            });
        },

        clearItems: function ($this) {
            if ($this == undefined) {
                $this = this;
            }
            return $this.each(function() {
                var data = $(this).data('dd');
                data.selected = undefined;
                $(this).data('dd', data);
                $(this).find('span').empty();
                $(this).find('.qui-ms-litem').remove();
            });
        },

        setItems: function (array, labelProp, checkedProp) {
            if (array && array.length) {
                return this.each(function() {
                    var arr = [];
                    var first = array[0], obj;
                    if (typeof first === 'string' || typeof first === 'number')
                        obj = false;
                    else
                        obj = true;
                    for (var i = 0; i < array.length; i++) {
                        var a = array[i];
                        var o = {};
                        if (!obj) {
                            o.label = a;
                            o.data = a;
                            o.checked = false;
                        } else {
                            var aa = $.extend({}, a);
                            o.label = aa[labelProp];
                            o.checked = aa[checkedProp];
                            o.data = aa;
                            o._checkedProp = checkedProp;
                            o._labelProp = labelProp;
                        }
                        arr.push(o);
                    }
                    if (obj)
                        $(this).data('ms-itemType', 'object');
                    else
                        $(this).data('ms-itemType', 'simple');
                    setItems(arr, $(this));
                });
            }
            return this;
        },

        enable: function (enabled) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('dd');
                if (enabled) {
                    $this.removeClass('disabled');
                    data.disabled = false;
                } else {
                    $this.addClass('disabled');
                    data.disabled = true;
                }
            });
        },

        isEnabled: function () {
            var data = this.data('dd');
            return !data.disabled;
        },

        setOpenUp: function (openUp) {
            var $listWrap = this.find('.qui-dd-listwrap');
            if (openUp) {
                $listWrap.get(0).className = 'qui-dd-listwrap top';
            } else {
                $listWrap.get(0).className = 'qui-dd-listwrap bottom';
            }
        },
        
        updateWidgetLabel: function () {
            return this.each(function () {
                var $this = $(this);
                var $selItems = $this.find('em.qui.check:not(.qui-ms-selall)');
                var $span = $this.find('span');
                var lbl, title;
                if (!$selItems.length) {
                    lbl = '';
                    title = '';
                } else if ($selItems.length == 1) {
                    lbl = $selItems.parent().text();
                    title = '';
                } else {
                    lbl = '-- ' + $selItems.length + ' selektovano --';
                    var ss = [];
                    $selItems.each(function() {
                        ss.push($(this).parent().text());
                    });
                    title = ss.join(', ');
                }
                $span.text(lbl);
                $this.attr('data-title', title);
            });
        },

        init: function (options) {
            return this.each(function () {
                settings = $.extend({
                    height: 22,
                    width: 198,
                    listHeight: 180,
                    listWidth: 0,
                    //showX: true,
                    showSearch: true,
                    disabled: false,
                    openUp: false,
                    searchType: 'filter',
                    //timeout: 300,
                    //items: [],
                    zIndex: ''
                }, options);

                var $this = $(this);
                var h = settings.height;// - 2;
                var w = settings.width;// - 2;
                var lh = settings.listHeight;
                var lw;
                if (settings.listWidth) {
                    lw = settings.listWidth;
                } else {
                    lw = settings.width;
                }
                var m = Math.round((h - 14) / 2);
                var xImage = '';
                var searchInput = '';
                var classes = 'qui qui-dd';
                var spanMaxWMinus = 26;
                if ($this.attr('data-disabled') == 'disabled') settings.disabled = true;
                if (settings.disabled) {
                    classes += ' disabled';
                }
                //if (settings.showX) {
                //    xImage = '<b style="width:16px"><i class="x" style="margin-top:' + (m - 1) + 'px"></i></b>';
                //    spanMaxWMinus = 42;
                //}
                //if (settings.showSearch) {
                //    searchInput = '<div style="margin-bottom:5px;"><input type="text" style="width:' + (lw - 12) + 'px" data-timeout="' + settings.timeout + '"/></div>';
                //    lh = settings.listHeight - 29;
                //}
                if (settings.showSearch) {
                    searchInput = '<div style="margin-bottom:5px;"><div class="qui-ms-selall"></div><input type="text" style="width:' + (lw - 35) + 'px" data-timeout="' + settings.timeout + '"/></div>';
                    lh = settings.listHeight - 29;
                }
                var lwClass = 'qui-dd-listwrap bottom';
                if (settings.openUp) {
                    lwClass = 'qui-dd-listwrap top';
                }
                var zInd = '';
                if (settings.zIndex) {
                    zInd = settings.zIndex;
                }
                $this.addClass(classes).height(h).width(w).css({ 'z-index': zInd }).html('<span style="margin-top:' + (m - 2) + 'px; max-width:' + (w - spanMaxWMinus) + 'px"></span><b><i class="a ad" style="margin-top:' + (m - 2) + 'px"></i></b>' + xImage + '<div class="' + lwClass + '" style="width:' + (lw - 10) + 'px">' + searchInput + '<div class="qui-dd-list" style="height:' + lh + 'px"></div></div>');
                $this.on('click.qui', privateMethods.mainClick);
                //$this.on('focus.qui', 'input', privateMethods.searchFocus);
                $this.on('keyup.qui', 'input', privateMethods.searchKeyUp);
                //$this.on('click.qui', '.x', privateMethods.xClick);

                // data
                $this.data('dd', {
                    opts: settings,
                    disabled: settings.disabled
                });
                // data end

                //methods.setItems(settings.items, $this);
                //$this.on('click.qui', '.qui-dd-litem', privateMethods.litemClick);
                
                $this
                    .find('.qui-ms-selall')
                    .quiCheckBox({ height: 14, margin: '5px 7px 0 2px' })
                    .on('change', function(e, ch) {
                        $this.find('.qui-dd-list .qui-chbox:visible').each(function () {
                            $(this).quiCheckBox('setChecked', ch);
                        });
                    });

                $this.on('click.qui', '.qui-dd-listwrap', function (e) { e.stopPropagation(); });
            });
        }

    };

    var setItems = function(items, $this) {
        //methods.clearSelectionNoTrigger($this); // todo KONTROLA!
        var $list = $this.find('.qui-dd-list').empty();
        var $item, item;
        for (var j = 0; j < items.length; j++) {
            item = items[j];
            if (item.checked) {
                $item = $('<div class="qui-ms-litem selected"><em class="qui"></em>' + item.label + '</div>');
            } else {
                $item = $('<div class="qui-ms-litem"><em class="qui"></em>' + item.label + '</div>');
            }
            $item.data('data', item.data);
            $item.data('ms-obj', item);
            $item.find('.qui').quiCheckBox({ checked: item.checked, margin: '0 5px 0 0' }).on('change', function(e, ch) {
                if (ch) {
                    $(this).parent().addClass('selected');
                } else {
                    $(this).parent().removeClass('selected');
                }
                $this.quiMultiselect('updateWidgetLabel');
            });
            $list.append($item);
        }
        $this.quiMultiselect('updateWidgetLabel').attr('title', $this.attr('data-title'));;
    };


    // --- private ---

    var privateMethods = {

        mainClick: function (e) {
            var $this = $(this);
            var data = $this.data('dd');
            if (!$this.hasClass('disabled') && !data.disabled) {
                //e.stopImmediatePropagation(); todo da li ovo treba da se vrati!
                if (!$this.hasClass('qui-dd-active')) {
                    $(window).trigger('quiClose');
                    var $inp = $this.find('input');
                    $inp.val('');
                    $('.qui-dd-active').removeClass('qui-dd-active').find('.qui-dd-listwrap').hide();
                    $this.find('.a').removeClass('ad').addClass('au');
                    $litems = $this.find('.qui-ms-litem');
                    litems = $this.get(0).getElementsByClassName('qui-ms-litem');
                    var opts = data.opts;
                    $this.find('input').attr('data-searchType', opts.searchType);
                    $this.addClass('qui-dd-active').find('.qui-dd-listwrap').css({ height: 0, display: 'block' }).animate({ height: opts.listHeight + 'px' }, 150, 'swing', function () {
                        //$inp.focus();
                        $(this).find('.selected:first').ensureVisible();
                        $(window).on('click.qui', privateMethods.mainClickOut);
                        $(window).on('quiClose quiCloseThis', null, $this, privateMethods.close);
                    });
                    $this.trigger('open');
                    $this.attr('title', '');
                } else {
                    //privateMethods.mainClickOut(e);
                    $(window).trigger('quiClose');
                }
            } else {
                $(window).trigger('quiClose');
            }
        },

        close: function (e) {
            $(window).off('click.qui');
            clearTimeout(searchTimeout);
            var $quiddactive = $('.qui-dd-active');
            $quiddactive.find('.a').removeClass('au').addClass('ad');
            $quiddactive.removeClass('qui-dd-active').find('.qui-dd-listwrap').hide();

            e.data.attr('title', e.data.attr('data-title'));
            
            var n = litems.length;
            for (var nn = 0; nn < n; nn++) {
                var litem = litems[nn];
                litem.style.display = '';
                //litem.className = 'qui-dd-litem';
            }

            $(window).off('quiClose quiCloseThis', privateMethods.close);
        },

        mainClickOut: function (e) {
            /*e.stopPropagation();
            $(window).off('click.qui');
            clearTimeout(searchTimeout);
            var $quiddactive = $('.qui-dd-active');
            $quiddactive.find('.a').removeClass('au').addClass('ad');
            $quiddactive.removeClass('qui-dd-active').find('.qui-dd-listwrap').hide();
            $litems.show().removeClass('hover');
            $litems = $();*/
            e.stopPropagation();
            $(window).trigger('quiClose');
        },
        
        searchKeyUp: function (e) {
            var val = $(this).val().trim();
            var timeout = $(this).attr('data-timeout').toDecimal();
            timeout = timeout === false ? 300 : timeout;
            if (e.keyCode == 27) { // esc
                e.preventDefault();
                //privateMethods.mainClickOut(e);
                $(window).trigger('quiClose');
            } else if (e.keyCode == 13) { // enter
                e.preventDefault();
                var $hover = $litems.filter('.hover');
                if ($hover.length) $hover.click();
                else {
                    var $sel = $litems.filter('.selected');
                    if ($sel.length) $sel.click();
                    else {
                        var $qui = $(this).parents('.qui-dd');
                        var data = $qui.data('dd');
                        $qui.trigger('select', data.selected);
                        $(document).trigger('quinta-changeFocus-fw');
                        $(window).trigger('quiClose');
                    }
                }
            } else if (e.keyCode == 40) { // arr down
                e.preventDefault();
                var $sel = $litems.filter('.hover');
                if (!$sel.length) {
                    $litems.filter(':first').addClass('hover');
                } else {
                    var $next = $sel.nextAll(':visible:first');
                    if ($next.length) {
                        $sel.removeClass('hover');
                        $next.addClass('hover');
                        $next.ensureVisible();
                    }
                }
            } else if (e.keyCode == 38) { // arr up
                e.preventDefault();
                var $sel = $litems.filter('.hover');
                var $prev = $sel.prevAll(':visible:first');
                if ($prev.length) {
                    $sel.removeClass('hover');
                    $prev.addClass('hover');
                    $prev.ensureVisible();
                }
            }
            else { // other keys
                var first = true;
                if (val == '') {
                    clearTimeout(searchTimeout);
                    //$litems.show().removeClass('hover f_hover');
                    var n = litems.length;
                    for (var nn = 0; nn < n; nn++) {
                        var litem = litems[nn];
                        litem.style.display = '';
                        //litem.className = 'qui-dd-litem';
                    }
                } else {
                    clearTimeout(searchTimeout);
                    var st = $(this).attr('data-searchType');
                    if (st == 'filter') {
                        searchTimeout = setTimeout(function () {
                            var forShow = [],
                                forHide = [],
                                regex = new RegExp(val, "i");
                            $litems.each(function () {
                                if ($(this).text().search(regex) < 0) {
                                    forHide.push($(this));
                                } else {
                                    if (first) {
                                        $(this).addClass('f_hover');
                                        forShow.push($(this));
                                        first = false;
                                    } else {
                                        forShow.push($(this));
                                    }
                                }
                            });
                            var fh = forHide.length;
                            var fs = forShow.length;
                            for (var i = 0; i < fh; i++) {
                                forHide[i].get(0).style.display = 'none';
                            }
                            for (var j = 0; j < fs; j++) {
                                forShow[j].get(0).style.display = '';
                            }
                            $('.hover').removeClass('hover');
                            $('.f_hover').removeClass('f_hover').addClass('hover').show().ensureVisible();
                        }, timeout);
                    } else if (st == 'filterKonto') {
                        searchTimeout = setTimeout(function () {
                            var forShow = [],
                                forHide = [],
                                regex = new RegExp(val, "i");
                            $litems.each(function () {
                                var prvi = val[0];
                                if (IsInt(prvi)) {
                                    if ($(this).text().search(regex) != 0) {
                                        forHide.push($(this));
                                    } else {
                                        if (first) {
                                            $(this).addClass('f_hover');
                                            forShow.push($(this));
                                            first = false;
                                        } else {
                                            forShow.push($(this));
                                        }
                                    }
                                } else {
                                    if ($(this).text().search(new RegExp(val, "i")) < 0) {
                                        forHide.push($(this));
                                    } else {
                                        if (first) {
                                            $(this).addClass('f_hover');
                                            forShow.push($(this));
                                            first = false;
                                        } else {
                                            forShow.push($(this));
                                        }
                                    }
                                }
                            });
                            var fh = forHide.length;
                            var fs = forShow.length;
                            for (var i = 0; i < fh; i++) {
                                forHide[i].get(0).style.display = 'none';
                            }
                            for (var j = 0; j < fs; j++) {
                                forShow[j].get(0).style.display = '';
                            }
                            $('.hover').removeClass('hover');
                            $('.f_hover').removeClass('f_hover').addClass('hover').show().ensureVisible();
                        }, timeout);
                    } else if (st == 'filter2') {
                        searchTimeout = setTimeout(function () {
                            val = val.replace(/\W/g, rep);
                            var regex = new RegExp(val, "i"),
                                forShow = [],
                                forHide = [];
                            $litems.each(function () {
                                var text = $(this).text().replace(/\W/g, rep);
                                if (text.search(regex) < 0) {
                                    forHide.push($(this));
                                } else {
                                    if (first) {
                                        $(this).addClass('f_hover');
                                        forShow.push($(this));
                                        first = false;
                                    } else {
                                        forShow.push($(this));
                                    }
                                }
                            });
                            var fh = forHide.length;
                            var fs = forShow.length;
                            for (var i = 0; i < fh; i++) {
                                forHide[i].get(0).style.display = 'none';
                            }
                            for (var j = 0; j < fs; j++) {
                                forShow[j].get(0).style.display = '';
                            }
                            $('.hover').removeClass('hover');
                            $('.f_hover').removeClass('f_hover').addClass('hover').show().ensureVisible();
                        }, timeout);
                    } else if (st == 'firstHit') {
                        searchTimeout = setTimeout(function () {
                            $litems.each(function () {
                                if ($(this).text().search(new RegExp(val, "i")) >= 0) {
                                    $litems.filter('.hover').removeClass('hover');
                                    $(this).addClass('hover').ensureVisible();
                                    return false;
                                }
                            });
                        }, timeout);
                    }
                }
            }
        },

        xClick: function (e) {
            e.stopImmediatePropagation();
            var $qui = $(this).parents('.qui-dd');
            methods.clearSelection($qui);
        }

    };


    // --- plugin ---

    $.fn.quiMultiselect = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiMultiselect');
        }
    };

})(jQuery, window);


// search input
(function ($, window, undefined) {

    var sto;
    var e_select = 'selected',
        e_enter = 'key_enter';

    // --- public ---

    var methods = {
        
        getSelectedItem: function() {
            return this.find('input').data('selectedItem');
        },
        
        getSelectedItemData: function () {
            var item = this.find('input').data('selectedItem');
            if (item && item.hasOwnProperty('data')) return item.data;
            else return undefined;
        },
        
        getSelectedItemDataProperty: function (prop) {
            var item = this.find('input').data('selectedItem');
            if (prop && item && item.hasOwnProperty('data') && item.data.hasOwnProperty(prop)) return item.data[prop];
            else return undefined;
        },
        
        selectItemByDataProperty: function(prop, val) {
            var $inp = this.find('input');
            var opts = $inp.data('opts');
            var items = opts.items;
            var n = items.length;
            for (var i = 0; i < n; i++) {
                var it = items[i];
                if (it.hasOwnProperty(prop) && it[prop] == val) {
                    var _lbl;
                    if (opts.specialProperties.forVal) {
                        _lbl = it[opts.specialProperties.forVal];
                    } else {
                        var $li = $(opts.formatter(it));
                        _lbl = $li.text();
                    }
                    var o = {
                        label: _lbl,
                        data: it
                    };
                    $inp.attr('data-oldval', o.label).val(o.label).data('selectedItem', o);
                    this.trigger(e_select, { item: o, $this: this, $inp: $inp });
                    return;

                    //var $li = $(opts.formatter(it)); // doh, mora ovako jer nigde ne cuvam labelu :|
                    //var o = {
                    //    label: $li.text(),
                    //    data: it
                    //};
                    //$inp.attr('data-oldval', o.label).val(o.label).data('selectedItem', o);
                    //this.trigger(e_select, { item: o, $this: this, $inp: $inp });
                    //return;
                }
            }
        },
        
        selectItemByDataPropertyNoTrigger: function (prop, val) {
            var $inp = this.find('input');
            var opts = $inp.data('opts');
            var items = opts.items;
            var n = items.length;
            for (var i = 0; i < n; i++) {
                var it = items[i];
                if (it.hasOwnProperty(prop) && it[prop] == val) {
                    var _lbl;
                    if (opts.specialProperties.forVal) {
                        _lbl = it[opts.specialProperties.forVal];
                    } else {
                        var $li = $(opts.formatter(it));
                        _lbl = $li.text();
                    }
                    var o = {
                        label: _lbl,
                        data: it
                    };
                    $inp.attr('data-oldval', o.label).val(o.label).data('selectedItem', o);
                    return;

                    //var $li = $(opts.formatter(it)); // doh, mora ovako jer nigde ne cuvam labelu :|
                    //var o = {
                    //    label: $li.text(),
                    //    data: it
                    //};
                    //$inp.attr('data-oldval', o.label).val(o.label).data('selectedItem', o);
                    //return;
                }
            }
        },
        
        clearSelection: function() {
            var $inp = this.find('input');
            $inp.attr('data-oldval', '').val('').removeData('selectedItem').next().empty().hide();
            this.trigger(e_select, undefined);
        },
        
        clearSelectionNoTrigger: function () {
            var $inp = this.find('input');
            $inp.attr('data-oldval', '').val('').removeData('selectedItem');
        },
        
        updateOptions: function(newOpts) {
            if (newOpts) {
                var $inp = this.find('input');
                var oldOpts = $inp.data('opts');
                var opts = $.extend({}, oldOpts, newOpts);
                FilterItemsBy(opts);
                var F = new Fuse(opts.items, opts.searchOptions);
                //var F = new qSearcher(opts.items, opts.searchOptions);
                $inp.attr('data-oldval', '').val('').removeData('selectedItem').next().empty().hide();
                this.trigger(e_select, undefined);
                $inp.data('opts', opts);
                $inp.data('F', F);
                // todo da li to da stavim ovđe ili neđe druđe... ??
                this.find('i').removeClass('refreshing');
            }
        },
        
        addItemAndSelect: function(it){
            var $inp = this.find('input');
            var opts = $inp.data('opts');
            //update options
            opts.items.push(it);
            // todo da li treba filtriranje itema?
            var F = new Fuse(opts.items, opts.searchOptions);
            //var F = new qSearcher(opts.items, opts.searchOptions);
            $inp.data('opts', opts);
            $inp.data('F', F);
            //select item and trigger event
            var _lbl;
            if (opts.specialProperties.forVal) {
                _lbl = it[opts.specialProperties.forVal];
            } else {
                var $li = $(opts.formatter(it));
                _lbl = $li.text();
            }
            var o = {
                label: _lbl,
                data: it
            };
            $inp.attr('data-oldval', o.label).val(o.label).data('selectedItem', o).next().empty().hide();
            this.trigger(e_select, { item: o, $this: this, $inp: $inp });
        },
        
        enable: function (enabled) {
            return this.each(function() {
                var $div = $(this);
                var $inp = $div.find('input');
                var opts = $inp.data('opts');
                if (enabled) {
                    opts.disabled = false;
                    $inp.removeAttr('disabled').removeClass('disabled'); 
                } else {
                    opts.disabled = true;
                    $inp.attr('disabled', 'disabled').addClass('disabled');
                }
            });
        },
        
        init: function (options) {
            var opts = $.extend({
                height: 24,
                width: 200,
                disabled: false, // !!
                openUp: false,
                zIndex: '', // !!
                timeout: 200,
                items: [],
                itemsToShow: 10,
                filterItemsBy: [],
                searchOptions: { keys: [] },
                specialProperties: {
                    forVal: null,
                    firstHit: null
                },
                showRefresh: true,
                allwaysSelectFirst: false,
                formatter: null,
                showLinks: false,
                linksTxt: {
                    l1: '',
                    l2: ''
                }
            }, options);

            return this.each(function () {
                var $div = $(this);

                var w = opts.width;
                var h = opts.height;

                var inpstyle = 'style="width:' + (w - 2) + 'px;height:' + (h - 2) + 'px"';

                //var lminw = opts.width - 12;
                var lclass = opts.openUp ? 'qui-si-listwrap top' : 'qui-si-listwrap bottom';

                var shRef = '';
                if (opts.showRefresh) {
                    var m = Math.round((h - 14) / 2);
                    shRef = '<b><i style="margin-top:' + (m - 3) + 'px"></i></b>';
                }
                
                var input = opts.disabled ? shRef + '<input type="text" ' + inpstyle + ' class="disabled" disabled="disabled" /><div class="' + lclass + '"></div>' : shRef + '<input type="text" ' + inpstyle + ' /><div class="' + lclass + '"></div>'
                
                $div.removeData().off()
                    .addClass('qui qui-si')
                    .width(w).height(h)
                    .html(input);

                var $inp = $div.find('input');
                var $list = $div.find('.qui-si-listwrap');
                FilterItemsBy(opts);
                var F = new Fuse(opts.items, opts.searchOptions);
                //var F = new qSearcher(opts.items, opts.searchOptions);
                $inp.data('opts', opts);
                $inp.data('F', F);
                $inp.data('list', $list);
                $inp.keyup(InputKey);
                $inp.blur(InputBlur);
                $inp.click(InputClick);
                //$div.on('click', 'li', ItemClick);
                $div.on('click', 'tr', ItemClick);
                $div.on('click', 'a', AClick);
                var $ref = $div.find('i');
                if ($ref.length) {
                    $ref.click(RefreshClick);
                }
                $div.data('opts', opts);
            });
        }
    };
    
    function FilterItemsBy(opts) {
        var fibs = opts.filterItemsBy,
            items = opts.items,
            temp = [];
        if (fibs.length) {
            for (var i = 0; i < fibs.length; i++) {
                var fib = fibs[i];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    if (item[fib.prop] == fib.val)
                        temp.push(item);
                }
                items = temp;
                temp = [];
            }
            opts.items = items;
        }
    }

    function AClick(e) {
        e.preventDefault();
        var $div = $(this).closest('.qui-si'),
            evt = $(this).attr('data-evt');
        $div.trigger('linkClick', evt);
    }
    
    function MakeLinks(opts) {
        var l1 = opts.linksTxt.l1 ? '<a href="#" data-evt="a1">' + opts.linksTxt.l1 + '</a>' : '';
        var l2 = opts.linksTxt.l2 ? '<a href="#" data-evt="a2">' + opts.linksTxt.l2 + '</a>' : '';
        return '<div class="qui-si-listlinks">' + l1 + l2 + '</div>';
    }

    function InputKey(e) {
        clearTimeout(sto);
        var $inp = $(this);
        var val = $inp.val().trim();
        var $list = $inp.data('list');
        var opts = $inp.data('opts');

        if (val == '') {
            // todo
            $list.empty().hide();
            return;
        }
        
        if (e.keyCode == 38) {
            e.preventDefault();
            var $prev = $list.find('.hover').removeClass('hover').prev();
            if ($prev.length) $prev.addClass('hover');
            //else $list.find('li').last().addClass('hover');
            else $list.find('tr').last().addClass('hover');
            return;
        }
        if (e.keyCode == 40) {
            e.preventDefault();
            var $next = $list.find('.hover').removeClass('hover').next();
            if ($next.length) $next.addClass('hover');
            //else $list.find('li').first().addClass('hover');
            else $list.find('tr').first().addClass('hover');
            return;
        }
        if (e.keyCode == 13) {
            e.preventDefault();
            var $sel = $list.find('.hover');
            if ($sel.length) {
                var o = {}, _it = $sel.data('item'), _lbl;
                if (opts.specialProperties.forVal) {
                    _lbl = _it[opts.specialProperties.forVal];
                } else {
                    _lbl = $sel.text();
                }
                o = {
                    label: _lbl,
                    data: _it
                };
                $inp.attr('data-oldval', o.label).val(o.label).data('selectedItem', o);
                $inp.parent().trigger(e_select, { item: o, $this: $inp.parent(), $inp: $inp });
                $list.empty().hide();
            } else {
                $inp.parent().trigger(e_enter);
            }
            return;
        }
        if (e.keyCode == 27) {
            e.preventDefault();
            var o = $inp.data('selectedItem');
            if (o) {
                $inp.attr('data-oldval', o.label).val(o.label);
                $list.empty().hide();
            }
            return;
        }

        var oldVal = $inp.attr('data-oldval');
        if (val != oldVal) {
            var F = $inp.data('F');
            sto = setTimeout(function () {
                var res = F.search(val);
                var n = res.length > opts.itemsToShow ? opts.itemsToShow : res.length;
                //var $ul = $('<ul></ul>');
                var $ul = $('<table></table>');
                var r, $li, $liID = '';
                // provera po jednom jedinstvenom polju
                var foundHit = false;
                if (opts.specialProperties.firstHit) {
                    var property = opts.specialProperties.firstHit;
                    for (var k = 0; k < opts.items.length; k++) {
                        var item = opts.items[k];
                        var _val,
                            _itemProp = item[property];
                        // zbog propertija koji mogu biti stringovi da se izbegne razlika u velicini slova
                        if (typeof val === 'string' && typeof _itemProp === 'string') {
                            _val = val.toLowerCase();
                            _itemProp = _itemProp.toLowerCase();
                        } else {
                            _val = val;
                        }
                        if (_val == _itemProp) {
                            $liID = $(opts.formatter(item));
                            $liID.data('item', item);
                            $liID.addClass('hover id');
                            foundHit = true;
                            break;
                        }
                    }
                }
                //
                if (opts.openUp) {
                    for (var j = n - 1; j >= 0; j--) {
                        r = res[j];
                        $li = $(opts.formatter(r));
                        $li.data('item', r);
                        if (!foundHit && j == 0 && opts.allwaysSelectFirst) {
                            $li.addClass('hover');
                        }
                        $ul.append($li);
                    }
                    $ul.append($liID);
                } else {
                    $ul.append($liID);
                    for (var i = 0; i < n; i++) {
                        r = res[i];
                        $li = $(opts.formatter(r));
                        $li.data('item', r);
                        if (!foundHit && i == 0 && opts.allwaysSelectFirst) {
                            $li.addClass('hover');
                        }
                        $ul.append($li);
                    }
                }
                $list.html($ul).slideDown(150);
                if (opts.showLinks) {
                    if (opts.openUp) $list.prepend(MakeLinks(opts));
                    else $list.append(MakeLinks(opts));
                }
                $inp.attr('data-oldval', val);
            }, opts.timeout);
        }
    }
    
    function InputBlur() {
        var $inp = $(this);
        var val = $inp.val().trim();
        var $list = $inp.data('list');

        if (val == '') {
            $inp.attr('data-oldval', '').removeData('selectedItem');
            $inp.parent().trigger(e_select, undefined);
            $list.empty().hide();
        }
    }

    function InputClick() {
        $(this).focus().select();
    }

    function ItemClick() {
        //var $ul = $(this).parent();
        var $ul = $(this).parent().parent();
        $ul.find('.hover').removeClass('hover');
        $(this).addClass('hover');
        var $inp = $ul.parent().prev();
        var e = $.Event('keyup');
        e.keyCode = 13;
        $inp.trigger(e);
    }

    function RefreshClick() {
        var $ref = $(this);
        var $div = $ref.closest('.qui-si');
        var opts = $div.data('opts');
        if (opts.disabled) return;
        $ref.addClass('refreshing');
        $div.trigger('refresh');
    }
    
    function NoNull(obj, value) {
        if (!obj) {
            if (value) return value;
            else return '';
        } else return obj;
    }
    

    // --- plugin ---

    $.fn.quiSearchInput = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiSearchInput');
            return false;
        }
    };

})(jQuery, window);


// calendar
(function ($, window, undefined) {

    function getFebDays(year) {
        return new Date(year, 1, 29).getMonth() == 1 ? 29 : 28;
    }
    
    function Localization() {
        if (window._lang_special) {
            var x = window._lang_special;
            if (x.hasOwnProperty('meseciMali')) {
                monthNames = x['meseciMali'];
            }
            if (x.hasOwnProperty('daniPrvoSlovo')) {
                dayNames = x['daniPrvoSlovo'];
            }
            if (x.hasOwnProperty('danas')) {
                today = x['danas'];
            }
        }
    }

    var settings;

    var today = 'Danas';
    var mDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var monthNames = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
    var dayNames = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
    var years = [1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979,
                 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
                 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
                 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
                 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];

    Localization();

    // --- public ---

    var methods = {

        getDate: function () {
            var data = this.data('date');
            if (data && !data.dateNull) {
                return new Date(data.date.getTime());
            }
            else {
                return undefined;
            }
        },

        getParsedDate: function (withMonthZero) {
            var data = this.data('date');
            if (data && !data.dateNull) {
                return privateMethods.calendarToInput(data.date, 0, withMonthZero);
            } else {
                return undefined;
            }
        },

        getJSONDateNoTZ: function () {
            var data = this.data('date');
            if (data && !data.dateNull) {
                var x = data.date;
                return (new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0))).toJSON();
            } else {
                return undefined;
            }
        },

        getJSONDateNoTZStringify: function () {
            var data = this.data('date');
            if (data && !data.dateNull) {
                var x = data.date;
                return JSON.stringify((new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0))).toJSON());
            } else {
                return undefined;
            }
        },

        getJSONDate: function () {
            var data = this.data('date');
            if (data && !data.dateNull) {
                return JSON.stringify(data.date);
            } else {
                return undefined;
            }
        },
        
        getIntDate: function() {
            var data = this.data('date');
            if (data && !data.dateNull) {
                var x = data.date;
                return x.getFullYear() * 10000 + (x.getMonth()+1) * 100 + x.getDate();
            } else {
                return undefined;
            }
        },

        clearDate: function () {
            var $qui = this;
            var data = $qui.data('date');
            //if (!data.disabled) {
                methods.setDateNoTrigger(new Date(), $qui);
                $qui.find('input').val('');
                data.dateNull = true;
                $qui.data('date', data);
                // todo mozda ne treba
                $qui.trigger('setDate', undefined);
            //}
        },
        
        setSpecialDate: function (date, noTrigger) {
            var d = new Date();
            if (date == 'firstDayOfYear') {
                d = new Date(d.getFullYear(), 0, 1);
            } else if (date == 'firstDayOfMonth') {
                d = new Date(d.getFullYear(), d.getMonth(), 1);
            } else if (date == 'lastDayOfYear') {
                d = new Date(d.getFullYear(), 11, 31);
            } else if (date == 'lastDayOfMonth') {
                d = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            }
            
            if (noTrigger) {
                methods.setDateNoTrigger(d, this);
            } else {
                methods.setDate(d, this);
            }
        },

        setDate: function (date, $this) {
            if ($this == undefined) {
                $this = this;
            }
            var data = $this.data('date');
            if (!data) return;
            date = new Date(date.getTime());
            data.date = date;
            data.dateNull = false;
            $this.data('date', data);

            $this.find('.calTitle').html(privateMethods.makeCalendarTitle(date));
            $this.find('.calBody').html(privateMethods.makeCalendarBody(date));
            $this.find('input').val(privateMethods.calendarToInput(date, 1));

            $this.find('.calYears').val(date.getFullYear());
            $this.find('.calMonths').val(date.getMonth() + 1);

            $this.trigger('setDate', date);
        },

        setDateNoTrigger: function (date, $this) {
            if ($this == undefined) {
                $this = this;
            }
            var data = $this.data('date');
            if (!data) return;
            date = new Date(date.getTime());
            data.date = date;
            data.dateNull = false;
            $this.data('date', data);

            $this.find('.calTitle').html(privateMethods.makeCalendarTitle(date));
            $this.find('.calBody').html(privateMethods.makeCalendarBody(date));
            $this.find('input').val(privateMethods.calendarToInput(date, 1));

            $this.find('.calYears').val(date.getFullYear());
            $this.find('.calMonths').val(date.getMonth() + 1);
        },

        enable: function (enabled) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('date');
                if (enabled) {
                    $this.find('input').removeAttr('disabled').removeClass('disabled');
                    data.disabled = false;
                } else {
                    $this.find('input').attr('disabled', 'disabled').addClass('disabled');
                    data.disabled = true;
                }
            });
        },

        init: function (options) {
            settings = {};
            settings = $.extend({
                date: new Date(),
                height: 22,
                width: 200,
                calendarHeight: 210,
                disabled: false,
                openUp: false,
                showX: false,
                zIndex: ''
            }, options);

            return this.each(function () {
                var $this = $(this);

                var w = settings.width;
                var h = settings.height + 2;

                var hInp = settings.height;
                var wInp = settings.width - 26;
                var mImg = (h - 22) / 2;


                var ch = settings.calendarHeight;

                var dis = "";
                if ($this.attr('data-disabled') == 'disabled') settings.disabled = true;
                if (settings.disabled) dis = "disabled='disabled' class='disabled'";

                var zInd = '';
                if (settings.zIndex) {
                    zInd = settings.zIndex;
                }

                var mX = 0;
                var x = '';
                if (settings.showX) {
                    mX = Math.round((h - 14) / 2) - 1;
                    x = "<em><i style='margin-top:" + mX + "px'></i></em>";
                }

                $this.addClass('qui qui-date').css({
                    'width': (w + 'px'),
                    'height': (h + 'px'),
                    'z-index': zInd
                }).html("<input " + dis + " type='text' style='height:" + hInp + "px;width:" + wInp + "px' value='" + privateMethods.calendarToInput(settings.date, 1) + "' /><b><i style='margin-top:" + mImg + "px'></i></b>" + x + MakeCalendar(settings.date, w - 2, ch, settings.openUp));

                $this.find('.calYears').val(settings.date.getFullYear());
                $this.find('.calMonths').val(settings.date.getMonth() + 1);

                // data
                $(this).data('date', {
                    settings: settings,
                    date: settings.date,
                    disabled: settings.disabled,
                    dateNull: false
                });
                // data end

                $this.on('click.date', 'b i', settings, privateMethods.mainClick);
                $this.on('click.date', 'em i', settings, privateMethods.clearClick);
                $this.on('click.date', '.calBody td', settings, privateMethods.calendarDayClick);
                $this.on('click.date', '.R', settings, privateMethods.calendarRightClick);
                $this.on('click.date', '.L', settings, privateMethods.calendarLeftClick);
                $this.on('click.date', 'span', settings, privateMethods.calendarTodayClick);
                $this.on('change.date', '.calYears', settings, privateMethods.calendarYearChange);
                $this.on('change.date', '.calMonths', settings, privateMethods.calendarMonthChange);

                $this.on('focus.date', 'input', settings, privateMethods.calendarInputFocus);
                $this.on('click.date', 'input', settings, privateMethods.calendarInputClick);
                $this.on('blur.date', 'input', settings, privateMethods.calendarInputBlur);
                $this.on('keyup.date', 'input', settings, privateMethods.calendarInputKeyDown);

                $this.on('click.date', '.calendarWrap', function (e) { e.stopPropagation(); });
            });
        }

    };




    // --- private ---

    var privateMethods = {

        mainClick: function (e) {
            //$(window).trigger('quiClose');
            //e.stopPropagation(); todo da li ovo treba da se vrati!
            //privateMethods.mainClickOut(e);
            var $qui = $(this).parents('.qui-date');
            var disabled = $qui.data('date').disabled;
            if (!disabled) {
                if ($qui.find('.calendarWrap:visible').length) {
                    $(window).trigger('quiClose');
                } else {
                    $(window).trigger('quiClose');
                    var ch = e.data.calendarHeight;
                    $qui.find('.calendarWrap').css({ height: 0, display: 'block' }).animate({ height: ch + 'px' }, 150, 'swing', function () {
                        $(window).on('click.date', privateMethods.mainClickOut);
                        $(window).on('quiClose', privateMethods.close);
                    });
                }
            } else {
                $(window).trigger('quiClose');
            }
        },

        clearClick: function () {
            var $qui = $(this).parents('.qui-date');
            var data = $qui.data('date');
            if (!data.disabled) {
                methods.setDateNoTrigger(new Date(), $qui);
                $qui.find('input').val('');
                data.dateNull = true;
                $qui.data('date', data);
                // todo mozda ne treba
                $qui.trigger('setDate', undefined);
            } else {
                $(window).trigger('quiClose');
            }
        },

        close: function (e) {
            //console.log('date close ' + (new Date()).getTime());

            $('.calendarWrap').hide();
            $(window).off('click.date');

            $(window).off('quiClose', privateMethods.close);
        },

        mainClickOut: function (e) {
            /*e.stopPropagation();
            $(window).off('click.date');
            $('.calendarWrap').hide();*/
            e.stopPropagation();
            $(window).trigger('quiClose');
        },

        calendarRightClick: function (e) {
            e.stopImmediatePropagation();
            var $qui = $(this).parents('.qui');
            var date = $qui.data('date').date;
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
            if (m == 11) {
                m = 0;
                y++;
            } else {
                m++;
            }
            methods.setDate(new Date(y, m, d), $qui);
        },

        calendarInputFocus: function (e) {
            //e.preventDefault();
            var $qui = $(this).parent();
            var date = $qui.data('date').date;
            $(this).val(privateMethods.calendarToInput(date));
        },

        calendarInputClick: function (e) {
            //e.stopImmediatePropagation(); todo da li ovo treba da se vrati!
            var $qui = $(this).parent();
            var date = $qui.data('date').date;
            $(this).val(privateMethods.calendarToInput(date));
            $(this).select();
        },

        calendarInputBlur: function (e) {
            var newDate = privateMethods.inputToCalendar($(this).val());
            var $qui = $(this).parent();
            var data = $qui.data('date');
            if (newDate) {
                data.date = newDate;
                $qui.data('date', data);
                methods.setDate(newDate, $qui);
            } else {
                $(this).val(privateMethods.calendarToInput(data.date, 1));
            }
        },

        calendarInputKeyDown: function (e) {
            if (e.keyCode == 13) {
                $(this).blur();
                var $qui = $(this).parent();
                $qui.trigger('enter');
                $(document).trigger('quinta-changeFocus-fw');
            }
        },

        calendarLeftClick: function (e) {
            e.stopImmediatePropagation();
            var $qui = $(this).parents('.qui');
            var date = $qui.data('date').date;
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
            if (m == 0) {
                m = 11;
                y--;
            } else {
                m--;
            }
            methods.setDate(new Date(y, m, d), $qui);
        },

        calendarTodayClick: function (e) {
            var $qui = $(this).parents('.qui');
            methods.setDate(new Date(), $qui);
        },

        calendarYearChange: function (e) {
            var $qui = $(this).parents('.qui');
            var date = $qui.data('date').date;
            var d = date.getDate();
            var m = date.getMonth();
            var y = $(this).find('option:selected').text();
            methods.setDate(new Date(y, m, d), $qui);
        },

        calendarMonthChange: function (e) {
            var $qui = $(this).parents('.qui');
            var date = $qui.data('date').date;
            var d = date.getDate();
            var m = $(this).find('option:selected').text() - 1;
            var y = date.getFullYear();
            methods.setDate(new Date(y, m, d), $qui);
        },

        calendarDayClick: function (e) {
            e.stopImmediatePropagation();
            if ($(this).hasClass('e')) return;
            var $calBody = $(this).parents('.calBody');
            $calBody.find('td').removeClass('selected');
            $(this).addClass('selected');

            var $qui = $(this).parents('.qui');
            var data = $qui.data('date');
            data.date.setDate($(this).text());
            data.dateNull = false;
            $qui.data('date', data);

            $qui.find('input').val(privateMethods.calendarToInput(data.date, 1));

            $qui.trigger('setDate', data.date);

            //privateMethods.mainClickOut(e);
            $(window).trigger('quiClose');
        },

        makeCalendarBody: function (date) {
            var dy = date.getFullYear();
            var dmonth = date.getMonth();
            var shifted = false;
            var dday = (new Date(dy, dmonth, 1)).getDay();
            var noOfDays = dmonth == 1 ? getFebDays(dy) : mDays[dmonth];
            var dayToWrite = 1;
            var a = [];
            for (var tr = 0; tr < 6; tr++) {
                if (dayToWrite > noOfDays) break;
                a.push('<tr>');
                var x = 1;
                if (!shifted) {
                    shifted = true;
                    if (dday == 0) dday = 7;
                    for (x = 1; x < dday; x++) {
                        a.push("<td class='e'></td>");
                    }
                }
                if (x < 8) {
                    for (x; x < 8; x++) {
                        if (dayToWrite <= noOfDays) {
                            if (dayToWrite == date.getDate()) {
                                a.push("<td class='selected'>" + dayToWrite + "</td>");
                            } else {
                                a.push("<td>" + dayToWrite + "</td>");
                            }
                            dayToWrite++;
                        } else {
                            a.push("<td class='e'></td>");
                        }
                    }
                }
                a.push('</tr>');
            }
            return a.join('');
        },

        makeCalendarTitle: function (date) {
            return monthNames[date.getMonth()] + " " + date.getFullYear();
        },

        calendarToInput: function (date, type, withMonthZero) {
            if (type == 1) return date.getDate() + ". " + monthNames[date.getMonth()] + " " + date.getFullYear() + ".";
            var month = withMonthZero ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
            return date.getDate() + "." + month + "." + date.getFullYear() + ".";
        },

        inputToCalendar: function (input) {
            try {
                var parts = input.trim().match(/(\d+)/g);
                var d, m, y;
                if (parts.length == 1 && parts[0].length == 8) {
                    d = parts[0].substr(0, 2);
                    m = parts[0].substr(2, 2) - 1;
                    y = parts[0].substr(4);
                    return new Date(y, m, d);
                }
                if (parts.length == 1 && parts[0].length == 6) {
                    d = parts[0].substr(0, 2);
                    m = parts[0].substr(2, 2) - 1;
                    y = parts[0].substr(4);
                    if (y.length == 2) {
                        y = parseInt(y);
                        if (y > 69) {
                            y = y + 1900;
                        } else {
                            y = y + 2000;
                        }
                    }
                    return new Date(y, m, d);
                }
                if (parts.length == 1 && parts[0].length == 4) {
                    d = parts[0].substr(0, 2);
                    m = parts[0].substr(2, 2) - 1;
                    y = (new Date()).getFullYear();
                    return new Date(y, m, d);
                }
                if (parts.length == 1 && parts[0].length < 3) {
                    var newd = new Date();
                    d = parts[0];
                    m = newd.getMonth();
                    y = newd.getFullYear();
                    return new Date(y, m, d);
                }
                if (parts.length == 2) {
                    d = parts[0];
                    m = parts[1] - 1;
                    y = (new Date()).getFullYear();
                    return new Date(y, m, d);
                } else {
                    d = parts[0];
                    m = parts[1] - 1;
                    y = parts[2];
                    if (y.length == 2) {
                        y = parseInt(y);
                        if (y > 69) {
                            y = y + 1900;
                        } else {
                            y = y + 2000;
                        }
                    }
                    return new Date(y, m, d);
                }
            } catch (e) {
                return false;
            }
        }

    };
    
    function MakeCalendar(date, width, height, openUp) {
        var a = [];
        var calClass = 'calendarWrap bottom';
        if (openUp) calClass = 'calendarWrap top';
        a.push('<div class="' + calClass + '" style="width:' + width + 'px;height:' + height + 'px">');
        a.push('<table class="cal"><thead><tr>');

        a.push('<td colspan="7"><div><select class="calYears">' + MakeCalendarYears() + '</select><span>'+today+'</span><select class="calMonths">' + MakeCalendarMonths() + '</select></div></td>');

        a.push('</tr><tr><td class="A L">&lt;&lt;</td><td colspan="5" class=calTitle>' + privateMethods.makeCalendarTitle(date) + '</td><td class="A R">&gt;&gt;</td></tr>');
        a.push('<tr><td>' + dayNames[0] + '</td><td>' + dayNames[1] + '</td><td>' + dayNames[2] + '</td><td>' + dayNames[3] + '</td><td>' + dayNames[4] + '</td><td>' + dayNames[5] + '</td><td>' + dayNames[6] + '</td></tr></thead>');
        a.push('<tbody class="calBody">');
        a.push(privateMethods.makeCalendarBody(date));
        a.push('</tbody></table></div>');
        return a.join('');
    }

    function MakeCalendarYears() {
        var a = [];
        for (var i = 0; i < years.length; i++) {
            a.push('<option>' + years[i] + '</option>');
        }
        return a.join('');
    }

    function MakeCalendarMonths() {
        var a = [];
        for (var i = 0; i < months.length; i++) {
            a.push('<option>' + months[i] + '</option>');
        }
        return a.join('');
    }


    // --- plugin ---

    $.fn.quiDate = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiDate');
        }
    };

})(jQuery, window);


// checkbox
(function ($, window, undefined) {
    var evt_change = 'change';

    // --- public ---

    var methods = {

        toggle: function () {
            return this.each(function () {
                var $t = $(this);
                if ($t.hasClass('check')) {
                    $t.removeClass('check')
                      .trigger(evt_change, false);
                }
                else {
                    $t.addClass('check')
                      .trigger(evt_change, true);
                }
            });
        },

        toggleNoTrigger: function () {
            return this.each(function () {
                var $t = $(this);
                if ($t.hasClass('check')) {
                    $t.removeClass('check');
                } else {
                    $t.addClass('check');
                }
            });
        },

        setChecked: function (check) {
            return this.each(function () {
                if (check) {
                    $(this).addClass('check')
                           .trigger(evt_change, true);
                } else {
                    $(this).removeClass('check')
                           .trigger(evt_change, false);
                }
            });
        },

        setCheckedNoTrigger: function (check) {
            return this.each(function () {
                if (check) {
                    $(this).addClass('check');
                } else {
                    $(this).removeClass('check');
                }
            });
        },

        isChecked: function () {
            if (this.hasClass('check')) return true;
            else return false;
        },

        enable: function (enabled) {
            return this.each(function () {
                var $t = $(this);
                var opts = $t.data('opts');
                if (enabled) {
                    $t.removeClass('disabled');
                    data.disabled = false;
                } else {
                    $t.addClass('disabled');
                    data.disabled = true;
                }
            });
        },

        init: function (options) {
            return this.each(function () {
                var opts = $.extend({
                    margin: '3px 0 0 0',
                    height: 18,
                    display: 'inline-block',
                    verticalAlign: 'top',
                    checked: false,
                    disabled: false
                }, options);

                var $t = $(this);

                var h = opts.height - 2;
                var klass = 'qui qui-chbox';
                if (opts.disabled || $t.attr('data-disabled') == 'disabled') {
                    klass += ' disabled';
                    opts.disabled = true; // zbog data-disabled
                }
                if ($t.attr('data-checked') == 'checked' || opts.checked) klass += ' check';

                $t.addClass(klass)
                    .width(h)
                    .height(h)
                    .css({
                        'margin': opts.margin,
                        'display': opts.display,
                        'vertical-align': opts.verticalAlign
                    });

                $t.on('click.chbox', mainClick);

                $t.data('opts', opts);
            });
        }

    };

    // --- private ---

    function mainClick(e) {
        var $t = $(this);
        var disabled = $t.data('opts').disabled;
        if (!disabled) {
            if ($t.hasClass('check')) {
                $t.removeClass('check');
                $t.trigger(evt_change, false);
            }
            else {
                $t.addClass('check');
                $t.trigger(evt_change, true);
            }
        }
    }

    // --- plugin ---

    $.fn.quiCheckBox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiCheckBox');
        }
    };

})(jQuery, window);


// rating
(function ($, window, undefined) {

    var settings;
    var rating = {
        full: 2,
        half: true
    };

    // --- public ---

    var methods = {
        
        set: function (num) {
            privateMethods.makeRatingObj(num);
            this.html(privateMethods.makeStars(rating));
        },

        init: function (options) {
            settings = {};
            settings = $.extend({
                rating: 2.5,
                height: 18,
                display: 'inline-block',
                verticalAlign: 'top'
            }, options);

            return this.each(function () {
                var $this = $(this);

                var h = settings.height;
                var w = h * 5;
                var dataNum = $this.attr('data-num');
                if (dataNum) {
                    settings.rating = dataNum;
                }

                $this.width(w).height(h).addClass('qui-rating');

                privateMethods.makeRatingObj(settings.rating);
                $this.html(privateMethods.makeStars(rating));
            });
        }

    };



    // --- private ---

    var privateMethods = {

        makeRatingObj: function (r) {
            if (!r) {
                rating.full = 0;
                rating.half = false;
            }
            else if (r <= 0.7) {
                rating.full = 0;
                rating.half = true;
            }
            else if (r > 0.7 && r <= 1.2) {
                rating.full = 1;
                rating.half = false;
            }
            else if (r > 1.2 && r <= 1.7) {
                rating.full = 1;
                rating.half = true;
            }
            else if (r > 1.7 && r <= 2.2) {
                rating.full = 2;
                rating.half = false;
            }
            else if (r > 2.2 && r <= 2.7) {
                rating.full = 2;
                rating.half = true;
            }
            else if (r > 2.7 && r <= 3.2) {
                rating.full = 3;
                rating.half = false;
            }
            else if (r > 3.2 && r <= 3.7) {
                rating.full = 3;
                rating.half = true;
            }
            else if (r > 3.7 && r <= 4.2) {
                rating.full = 4;
                rating.half = false;
            }
            else if (r > 4.2 && r <= 4.7) {
                rating.full = 4;
                rating.half = true;
            } else {
                rating.full = 5;
                rating.half = false;
            }
        },
        
        makeStars: function(r) {
            var stars = '';
            for (var i = 0; i < r.full; i++) {
                stars += '<b class="f"></b>';
            }
            if (r.half) {
                stars += '<b class="h"></b>';
                for (var j = 0; j < (5 - r.full - 1) ; j++) {
                    stars += '<b class="e"></b>';
                }
            } else {
                for (var j = 0; j < (5 - r.full) ; j++) {
                    stars += '<b class="e"></b>';
                }
            }
            return stars;
        }
    };



    // --- plugin ---

    $.fn.quiRating = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiRating');
        }
    };

})(jQuery, window);


// switch
(function ($, window, undefined) {

    var settings;


    // --- public ---

    var methods = {
        
        toggle: function () {
            return this.each(function () {
                var move = $(this).data('sw').move;
                if ($(this).hasClass('qui-switch-on')) {
                    $(this).removeClass('qui-switch-on').find('.qui-switch-slider').css({ left: -move });
                    $(this).trigger('change', false);
                }
                else {
                    $(this).addClass('qui-switch-on').find('.qui-switch-slider').css({ left: 0 });
                    $(this).trigger('change', true);
                }
            });
        },
        
        setOn: function (on) {
            return this.each(function () {
                var move = $(this).data('sw').move;
                if (on) {
                    $(this).addClass('qui-switch-on').find('.qui-switch-slider').css({ left: 0 });
                    $(this).trigger('change', true);
                }
                else {
                    $(this).removeClass('qui-switch-on').find('.qui-switch-slider').css({ left: -move });
                    $(this).trigger('change', false);
                }
            });
        },
        
        isOn: function () {
            if (this.hasClass('qui-switch-on')) return true;
            else return false;
        },

        init: function (options) {
            settings = {};
            settings = $.extend({
                margin: '3px 0 0 0',
                on: false,
                height: 18,
                width: 60,
                display: 'inline-block',
                verticalAlign: 'top',
                onBackColor: '#9c0',
                offBackColor: '#ccc',
                onText: 'ON',
                offText: 'OFF',
                onTextColor: '#444',
                offTextColor: '#444',
                tickColor: 'gray'
            }, options);

            return this.each(function () {
                var $this = $(this);

                var h = settings.height,
                    w = settings.width,
                    klass = 'qui qui-switch';

                if ($this.attr('data-on') == 'on' || settings.on) {
                    klass += ' qui-switch-on';
                    settings.on = true;
                }

                $this.width(w).height(h).addClass(klass).css({
                    'display': settings.display,
                    'vertical-align': settings.verticalAlign,
                    'margin': settings.margin
                }).html(privateMethods.makeInnerSlider(settings));

                $this.on('click.switch', privateMethods.mainClick);

                var data = {
                    move: w * 0.8
                };
                $this.data('sw', data);
            });
        }

    };



    // --- private ---

    var privateMethods = {
        
        mainClick: function() {
            var move = $(this).data('sw').move;
            var on = $(this).hasClass('qui-switch-on');
            if (on) {
                $(this).removeClass('qui-switch-on').find('.qui-switch-slider').css({ left: -move });
                $(this).trigger('change', false);
            } else {
                $(this).addClass('qui-switch-on').find('.qui-switch-slider').css({ left: 0 });
                $(this).trigger('change', true);
            }
        },

        makeInnerSlider: function(setts) {
            var s = '',
                h = setts.height,
                w = setts.width,
                ont = setts.onText,
                offt = setts.offText,
                onc = setts.onBackColor,
                offc = setts.offBackColor,
                ontxtc = setts.onTextColor,
                offtxtc = setts.offTextColor,
                tickc = setts.tickColor,
                wlr = w * 0.8,
                wsr = w * 0.2,
                ws = w + wlr,
                on = setts.on;
            if (!on) on = 'left: -' + wlr + 'px;';
            else on = '';
            s += '<div class="qui-switch-slider" style="width:' + ws + 'px; ' + on + '">';
            s += '<div style="width:' + wlr + 'px; background-color:' + onc + '"><span style="color:' + ontxtc + ';line-height:' + h + 'px">' + ont + '</span></div>';
            s += '<div style="width:' + wsr + 'px; background-color:' + tickc + '"></div>';
            s += '<div style="width:' + wlr + 'px; background-color:' + offc + '"><span style="color:' + offtxtc + ';line-height:' + h + 'px">' + offt + '</span></div>';
            s += '</div>';
            return s;
        }
        
    };



    // --- plugin ---

    $.fn.quiSwitch = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiSwitch');
        }
    };

})(jQuery, window);


// bank account
// var _qui_bacc_dbsettings;
(function ($, window, undefined) {

    var settings;


    // --- public ---

    var methods = {
        
        getAcc: function (err) {
            var v = [],
                $this = $(this),
                s;
            $this.find('input').each(function () {
                v.push($(this).val().trim());
            });
            s = v.join('-');
            if (s == '--') return undefined;
            if ($this.hasClass('qui-bacc-err') && err) return undefined;
            else return s;
        },
        
        setAcc: function (acc) {
            if (!acc) return;
            var v = acc.split('-');
            $(this).find('input').each(function (i) {
                var $inp = $(this);
                $inp.val(v[i]);
                $inp.trigger('blur', true);
            });
            checkAcc(this);
        },

        init: function (options) {
            settings = {};
            if (window._qui_bacc_dbsettings) {
                settings = $.extend({
                    height: 22,
                    widthPerNumber: 7,
                    inputPadding: '0 3px 0 2px',
                    acc: undefined,
                    accValidationUrl: ''
                }, options, window._qui_bacc_dbsettings);
            } else {
                settings = $.extend({
                    height: 22,
                    widthPerNumber: 7,
                    inputPadding: '0 3px 0 2px',
                    cell1n: 3,
                    cell2n: 13,
                    cell3n: 2,
                    acc: undefined,
                    accValidationUrl: '',
                    modul: 97
                }, options);
            }

            return this.each(function () {
                var $this = $(this),
                    klass = 'qui qui-bacc',
                    dataacc = $this.attr('data-acc'),
                    datamodul = $this.attr('data-modul'),
                    dataaccvalidurl = $this.attr('data-accValidationUrl'),
                    acc = dataacc ? dataacc : settings.acc,
                    modul = datamodul ? datamodul : settings.modul,
                    avurl = dataaccvalidurl ? dataaccvalidurl : settings.accValidationUrl;

                $this.addClass(klass).attr('data-modul', modul).html(makeInput(settings, 'cell1n') + '-' + makeInput(settings, 'cell2n') + '-' + makeInput(settings, 'cell3n'));

                $this.on('input', 'input', settings, inpChange);
                $this.on('blur', 'input', settings, inpBlur);
                $this.on('keyup', 'input', settings, inpKeyup);
                
                if (acc) {
                    var v = acc.split('-');
                    $this.find('input').each(function (i) {
                        var $inp = $(this);
                        $inp.val(v[i]);
                        $inp.trigger('blur', true);
                    });
                    checkAcc($this);
                }

            });
        }

    };


    // --- private ---

    var privateMethods = {

    };

    var checkAcc = function ($this) {
        var accvu = $this.attr('data-accValidationUrl');
        if (accvu) {
            var v = [],
                $inputs = $this.find('input');
            $inputs.each(function () {
                v.push($(this).val());
            });

            var racun = v.join(''),
                modul = parseFloat($this.attr('data-modul'));

            $.ajax({
                type: 'GET',
                url: accvu,
                data: {
                    racun: racun,
                    modul: modul
                },
                success: function(data) {
                    if (data.Data) {
                        $this.removeClass('qui-bacc-err');
                    } else {
                        $this.addClass('qui-bacc-err');
                    }
                },
                error: function() {

                }
            });
        }
    };

    var makeInput = function(setts, cell) {
        var s = '',
            w = setts.widthPerNumber * setts[cell],
            h = setts.height,
            p = setts.inputPadding;
        return s += '<input type="text" style="width:' + w + 'px; height:' + h + 'px; padding:' + p + ';" data-c="' + cell + '" />';
    };

    var inpKeyup = function(e) {
        if (e.keyCode == 13) {
            var $next = $(this).next();
            if ($next.length)
                $next.focus().select();
            else
                $(this).blur();
        } else if (e.keyCode != 37 && e.keyCode != 39) {
            var val = $(this).val(),
                cell = $(this).attr('data-c'),
                n = e.data[cell];
            if (val.length >= n) {
                var $next = $(this).next();
                if ($next.length)
                    $next.focus().select();
            }
        }
    };

    var inpBlur = function(e, noCheckAcc) {
        var val = $(this).val(),
            datac = $(this).attr('data-c'),
            n = val.length,
            celln = e.data[datac];
        if (val == '') return; // TODO da li ovo treba ovako, ili izbaciti?
        if (n < celln) {
            var z = celln - n,
                zeros = '';
            for (var i = 0; i < z; i++) {
                zeros += '0';
            }
            $(this).val(zeros + val);
        }
        if (!noCheckAcc)
            checkAcc($(this).parents('.qui-bacc:first'));
    };

    var inpChange = function(e) {
        var val = $(this).val(),
            datac = $(this).attr('data-c'),
            n = val.length,
            celln = e.data[datac];
        if (n > celln) {
            val = val.substring(0, n - 1);
            $(this).val(val);
        }
    };



    // --- plugin ---

    $.fn.quiBankAcc = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiBankAcc');
        }
    };

})(jQuery, window);


// table filter
(function ($, window, undefined) {

    var settings, arrShow, arrHide;
    
    var ruter = {
            txt: searchTxt,
            dec: searchDec
        };

    function searchTxt($inp, $allRows) {
        var val = $inp.val().trim(),
            arrShowN = arrShow.length,
            arr = arrShowN ? arrShow : $allRows,
            n = arr.length,
            $row;
        if (val) {
            var firstChar = val[0],
                $td = $inp.parents('td').eq(0),
                eq = $td.prevAll().length,
                regex;
            $td.addClass('qui-tf-filtered');
            if (firstChar == '*') {
                val = val.substring(1);
                regex = new RegExp(val, "i");
                for (var i = 0; i < n; i++) {
                    $row = arrShowN ? arr[i] : arr.eq(i),
                    txt = $row.find('td').eq(eq).text();
                    if (txt.search(regex) < 0) {
                        arrHide.push($row);
                    } else {
                        arrShow.push($row);
                    }
                }
            } else {
                regex = new RegExp(val, "i");
                for (var i = 0; i < n; i++) {
                    $row = arrShowN ? arr[i] : arr.eq(i);
                    txt = $row.find('td').eq(eq).text();
                    if (txt.search(regex) != 0) {
                        arrHide.push($row);
                    } else {
                        arrShow.push($row);
                    }
                }
            }
        } else {
            $inp.parents('td').eq(0).removeClass('qui-tf-filtered');
        }
    }

    function searchDec($inp, $allRows) {
        var val = $inp.val().trim(),
            arrShowN = arrShow.length,
            arr = arrShowN ? arrShow : $allRows,
            n = arr.length,
            $row;
        if (val) {
            var firstChar = val[0],
                $td = $inp.parents('td').eq(0),
                eq = $td.prevAll().length,
                tip;
            switch (firstChar) {
            case '>':
                tip = 1;
                break;
            case '<':
                tip = 2;
                break;
            case '=':
                tip = 3;
                break;
            default:
                tip = 0;
            }
            var spl = val.split('-'),
                v1 = 0, v2 = 0;
            if (spl[0] && spl[1]) {
                v1 = spl[0].toDecimal();
                v2 = spl[1].toDecimal();
                tip = 4;
            }
            if (tip > 0 && tip < 4) val = val.substring(1);
            val = val.toDecimal();
            if (val !== false) {
                $td.addClass('qui-tf-filtered');
                for (var i = 0; i < n; i++) {
                    $row = arrShowN ? arr[i] : arr.eq(i);
                    txt = $row.find('td').eq(eq).text().fromMoney();

                    if (tip == 0 || tip == 3) {
                        if (txt === val) {
                            arrShow.push($row);
                        } else {
                            arrHide.push($row);
                        }
                    }
                    if (tip == 1) {
                        if (txt > val) {
                            arrShow.push($row);
                        } else {
                            arrHide.push($row);
                        }
                    }
                    if (tip == 2) {
                        if (txt < val) {
                            arrShow.push($row);
                        } else {
                            arrHide.push($row);
                        }
                    }
                    if (tip == 4) {
                        if (v1 <= txt && txt <= v2) {
                            arrShow.push($row);
                        } else {
                            arrHide.push($row);
                        }
                    }
                }
            } else {
                $td.removeClass('qui-tf-filtered');
            }
        } else {
            $inp.parents('td').eq(0).removeClass('qui-tf-filtered');
        }
    }

    function KeyupInput(e) {
        var $inp = $(this);
        if (e.keyCode == 13) {
            var tbodyId = $inp.attr('data-quitablefilter-tbodyid'),
                $allRows = $(tbodyId).find('tr'),
                $myTBody = $inp.closest('.qui-tf');
            arrHide = [];
            arrShow = [];
            var triggerX = false;
            if ($inp.val().trim() == '') {
                $allRows.each(function () { arrShow.push($(this)); });
                triggerX = true;
            }
            var $inputs = $myTBody.find('input');
            $inputs.each(function () {
                var type = $(this).attr('data-quitablefilter-type');
                if (type)
                    ruter[type]($(this), $allRows);
            });
            var nS = arrShow.length,
                nH = arrHide.length;
            for (var i = 0; i < nS; i++) {
                arrShow[i].get(0).style.display = '';
            }
            for (var j = 0; j < nH; j++) {
                arrHide[j].get(0).style.display = 'none';
            }
            if (triggerX) $myTBody.trigger('cleared');
            
            $myTBody.trigger('filtered');
        }
        if (e.keyCode == 27) {
            $inp.next().click();
        }
    }

    function ClickX() {
        var $inp = $(this).prev().val('');
        var e = $.Event('keyup');
        e.keyCode = 13; // A
        $inp.trigger(e);
    }

    // --- public ---

    var methods = {

        init: function (options) {
            settings = {};
            settings = $.extend({
                tbodyId: ''
            }, options);

            arrShow = [];
            arrHide = [];

            return this.each(function () {
                var $this = $(this);

                $this.addClass('qui-tf').find('tr').addClass('qui-tf-tr').find('td').each(function () {
                    var $td = $(this),
                        ft = $td.attr('data-quitablefilter-type');
                    $td.attr('data-xls-type', 'skip');
                    if (ft) {
                        $td.html('<div class="qui-tf-inpWrap"><input type="text" class="myInput" data-quitablefilter-type="' + ft + '" data-quitablefilter-tbodyid="' + settings.tbodyId + '" style="width:100%" /><div class="qui-tf-x">×</div></div>');
                    }
                });

                $this.off();
                $this.on('keyup', 'input', KeyupInput);
                $this.on('click', '.qui-tf-x', ClickX);
            });
        }

    };
    

    // --- private ---

    var privateMethods = {

    };



    // --- plugin ---

    $.fn.quiTableFilter = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiTableFilter');
        }
    };

})(jQuery, window);


// progress
(function ($, window, undefined) {

    // --- public ---

    var methods = {
        
        set: function(perc) {
            perc = parseFloat(perc);
            if (!isNaN(perc) && perc >= 0 && perc <= 100) {
                var opts = this.data('opts');
                opts.perc = perc;
                this.data('opts', perc);
                this.find('div').css('width', perc + '%');
            }
        },
        
        stepUp: function () {
            var opts = this.data('opts');
            var step = opts.step;
            if (step) {
                var $in = this.find('div'), inW, inWperc;
                if (opts.perc) {
                    inWperc = opts.perc + step;
                } else {
                    inW = $in.width();
                    inWperc = inW / opts.inWidth * 100;
                    inWperc += step;
                }
                if (inWperc > 100) inWperc = 100;
                opts.perc = inWperc;
                this.data('opts', opts);
                $in.css('width', inWperc + '%');
            }
        },

        init: function (options) {
            var opts = $.extend({
                height: 18,
                width: 200,
                step: 0,
                perc: 0,
                margin: '3px 0 0 0',
                display: 'inline-block'
            }, options);

            return this.each(function () {
                var $div = $(this);

                var w = opts.width;
                var h = opts.height;
                opts.inWidth = w - 2;

                $div.width(w - 2).height(h - 2).css({
                    'margin': opts.margin,
                    'display': opts.display
                }).addClass('qui qui-prg').html('<div class="qui-prg-in" style="width:' + opts.perc + '%"></div>');
                $div.data('opts', opts);
            });
        }

    };

    // --- plugin ---

    $.fn.quiProgress = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiProgress');
            return false;
        }
    };

})(jQuery, window);


// tree
(function ($, window, undefined) {
    var evt_select = 'select',
        tempChildrenProp = '_tempChildren';

    // --- public ---

    var methods = {
        
        getItems: function (itemsWithChildren) {
            var $tree = this,
                $items = $tree.find('span');
                items = [];
            $items.each(function() {
                var $item = $(this), item;
                item = $.extend({}, $item.data('item'));
                if (itemsWithChildren) {
                    item = $item.data('item');
                } else {
                    delete item[tempChildrenProp];
                }
                items.push(item);
            });
            return items;
        },

        getSelectedItem: function () {
            var $tree = this,
                $sel = $tree.find('span.sel');
            if (!$sel.length) return undefined;
            var item = $.extend({}, $sel.data('item'));
            delete item[tempChildrenProp];
            return item;
        },

        getSelectedItemProperty: function (prop) {
            var $tree = this,
                $sel = $tree.find('span.sel');
            if (!$sel.length) return undefined;
            var item = $sel.data('item');
            if (item && item.hasOwnProperty(prop)) {
                return item[prop];
            }
            return undefined;
        },

        getSelectedItemId: function () {
            var $tree = this,
                $sel = $tree.find('span.sel');
            if (!$sel.length) return undefined;
            return $sel.attr('data-id');
        },
        
        addItem: function (item, addType) {
            // addType:
            // 1 - u root
            // 2 - ispod selektovanog
            // 3 - ispod zadatog parentId-a u item objektu
            var $tree = this,
                opts = $tree.data('opts'),
                $li, $ul;
            if (addType == undefined || addType == 1) {
                $li = makeLi(opts.idProp, opts.rootValue, opts.labelProp, item);
                $tree.children('ul').append($li);
                flashItemAfterAdd($li);
            }else if (addType == 2) {
                var $sel = $tree.find('span.sel');
                $ul = $sel.next();
                var $selParent = $sel.parent();
                if ($ul.length) {
                    $li = makeLi(opts.idProp, opts.idParentProp, opts.labelProp, item);
                    $ul.removeClass('col').addClass('exp').append($li);
                    $selParent.children('i').removeClass('cold').addClass('exp');
                    flashItemAfterAdd($li);
                } else {
                    $ul = makeUl(opts.idProp, opts.idParentProp, opts.labelProp, [item], true);
                    $selParent.children('i').addClass('node exp').end().append($ul);
                    flashItemAfterAdd($ul);
                }
            }else if (addType == 3) {
                var idParent = item[opts.idParentProp],
                    $parent = $tree.find('span[data-id=' + idParent + ']').parent();
                $ul = $parent.children('ul');
                if ($ul.length) {
                    $li = makeLi(opts.idProp, opts.idParentProp, opts.labelProp, item);
                    $ul.removeClass('col').addClass('exp').append($li);
                    $parent.children('i').removeClass('cold').addClass('exp');
                    flashItemAfterAdd($li);
                } else {
                    $ul = makeUl(opts.idProp, opts.idParentProp, opts.labelProp, [item], true);
                    $parent.children('i').addClass('node exp').end().append($ul);
                    flashItemAfterAdd($ul);
                }
                expandParentNodes($parent);
            }
        },
        
        updateSelectedItem: function(newItem) {
            var $tree = this,
                opts = $tree.data('opts'),
                $sel = $tree.find('span.sel');
            if (!$sel.length) return undefined;
            var _newItem = $.extend({}, newItem); // da ne bude problema sa referencama...
            $sel.data('item', _newItem);
            $sel.text(_newItem[opts.labelProp]);
            if (_newItem['Aktivan'] !== true) {
                $sel.addClass('deaktiviran');
            } else {
                $sel.removeClass('deaktiviran');
            }
            return true;
        },
        
        removeSelectedItem: function() {
            this.find('span.sel').parent().remove();
        },

        init: function (options) {
            return this.each(function () {
                var opts = $.extend({
                    array: [],
                    idProp: 'id',
                    idParentProp: 'parentid',
                    labelProp: '',
                    width: 0,
                    height: 0,
                    rootValue: 0,
                    dblClickOpensNode: true
                }, options);

                var tree = arrToTree(opts.idProp, opts.idParentProp, opts.rootValue, opts.array);

                var $div = $(this);

                $div.data('opts', opts);

                $div.addClass('qui qui-tree nosel');
                if (opts.width) $div.width(opts.width);
                if (opts.height) $div.height(opts.height);

                $div.html(makeUl(opts.idProp, opts.idParentProp, opts.labelProp, tree));

                $div
                    .on('click', 'i.node', ClickNode)
                    .on('click', 'span', ClickItem);
                if (opts.dblClickOpensNode) {
                    $div.on('dblclick', 'span', DblClickItem);
                }
            });
        }
    };

    // events

    function ClickNode() {
        var $iNode = $(this),
            $parent = $iNode.parent();
        if ($iNode.hasClass('col')) {
            $iNode.removeClass('col').addClass('exp');
            $parent.children('ul').removeClass('col').addClass('exp');
        } else {
            $iNode.removeClass('exp').addClass('col');
            $parent.children('ul').removeClass('exp').addClass('col');
        }
    }

    function ClickItem() {
        var $item = $(this),
            $tree = $item.closest('.qui-tree');
        $tree.find('span.sel').removeClass('sel');
        $item.addClass('sel');

        var item = $.extend({}, $item.data('item'));
        delete item[tempChildrenProp];
        $tree.trigger(evt_select, item);
    }

    function DblClickItem(e) {
        e.stopImmediatePropagation();
        $(this).prev().click();
    }

    // utils

    var arrToTree = function (idProp, parentIdProp, rootValue, array, parent) {
        var tree = [];
        var emptyNode = {};
        emptyNode[idProp] = rootValue;
        parent = parent || emptyNode;
        var children = array.filter(function (c) { return c[parentIdProp] == parent[idProp]; });
        if (children.length) {
            if (parent[idProp] == rootValue) {
                tree = children;
            } else {
                parent[tempChildrenProp] = children;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                arrToTree(idProp, parentIdProp, rootValue, array, child);
            }
        }
        return tree;
    };

    var makeUl = function (idProp, parentIdProp, labelProp, array, expanded) {
        var $ul = $('<ul class="' + (expanded ? 'exp' : 'col') + '"></ul>');
        for (var i = 0; i < array.length; i++) {
            var a = array[i];
            $ul.append(makeLi(idProp, parentIdProp, labelProp, a));
        }
        return $ul;
    };

    var makeLi = function (idProp, parentIdProp, labelProp, aItem) {
        var isNode = aItem.hasOwnProperty(tempChildrenProp);
        var plusMinus;
        if (isNode) plusMinus = '<i class="node col"></i>';
        else plusMinus = '<i></i>';
        var id = aItem[idProp];
        var $li = $('<li>' + plusMinus + '<span data-id="' + id + '">' + (aItem[labelProp] || 'Node') + '</span>');
        $li.find('span').data('item', aItem);
        //dodavanje dela ako je deaktiviran da se dodeli stil klase deaktiviran
        if (aItem['Aktivan'] !== true) {
            $li.find('span').addClass('deaktiviran');
        }
        if (isNode) $li.append(makeUl(idProp, parentIdProp, labelProp, aItem[tempChildrenProp]));
        return $li;
    };

    var expandParentNodes = function($item) {
        var $uls = $item.parentsUntil('.qui-tree').filter('ul'),
            $is = $uls.siblings('i');
        $uls.removeClass('col').addClass('exp');
        $is.removeClass('col').addClass('exp');
    };

    var flashItemAfterAdd = function ($item) {
        var $span,
            tagName = $item.prop('tagName').toLowerCase();
        if (tagName != 'span') {
            $span = $item.find('span').first();
        } else {
            $span = $item;
        }
        $span.addClass('new');
        setTimeout(function () {
            $span.removeClass('new');
        }, 1000);
    };

    // --- plugin ---

    $.fn.quiTree = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.quiTree');
            return false;
        }
    };

})(jQuery, window);
