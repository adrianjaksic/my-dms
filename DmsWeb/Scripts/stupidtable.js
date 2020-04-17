// Stupid jQuery table plugin.

// Call on a table
// sortFns: Sort functions for your datatypes.
(function ($) {

    $.fn.stupidtable = function (sortFns, otherOpts) {
        return this.each(function () {
            var $table = $(this);
            sortFns = sortFns || {};
            otherOpts = otherOpts || {};

            // ==================================================== //
            //                  Utility functions                   //
            // ==================================================== //

            // Merge selectors with default selectors for Quinta.Web project.
            otherOpts = $.extend({}, {
                'th': '.qTabelaHeadTd',
                'tbody': '#glavniTBody'
            }, otherOpts);

            // Merge sort functions with some default sort functions.
            sortFns = $.extend({}, {
                'int': function (a, b) { return parseInt(a, 10) - parseInt(b, 10); },
                'float': function (a, b) { return parseFloat(a) - parseFloat(b); },
                'money': function (a, b) { return a.fromMoney() - b.fromMoney(); },
                'string': function (a, b) { if (a < b) return -1; if (a > b) return +1; return 0; },
                'evidbr': function (a, b) {
                    var aSplit = a.split('-');
                    var bSplit = b.split('-');
                    var aNumber = parseInt(aSplit[aSplit.length - 1]);
                    var bNumber = parseInt(bSplit[bSplit.length - 1]);
                    
                    if (isNaN(aNumber) && isNaN(bNumber)) {
                        // oba stringa
                        if (a < b) return -1; if (a > b) return +1; return 0;
                    } else if (isNaN(aNumber)) {
                        // b is number
                        return -1;
                    } else if (isNaN(bNumber)) {
                        // a is number
                        return +1;
                    } else {
                        return aNumber - bNumber;
                    }
                },
                // multi data -> [string]-[int]
                'multi': function (a, b) {
                    if (a.contains('-') && b.contains('-')) {
                        var aSplit = a.split('-');
                        var bSplit = b.split('-');

                        var aLevo = aSplit[0];
                        var aDesno = parseInt(aSplit[1], 10);
                        var bLevo = bSplit[0];
                        var bDesno = parseInt(bSplit[1], 10);

                        if (isNaN(aDesno)) {
                            aDesno = 0;
                        }

                        if (isNaN(bDesno)) {
                            bDesno = 0;
                        }

                        if (aSplit[1])

                            if (aLevo < bLevo) {
                                return -1;
                            }
                        if (aLevo > bLevo) {
                            return +1;
                        } else {
                            return aDesno - bDesno;
                        }
                    } else {
                        if (a.contains('-')) {
                            return +1;
                        }else if (b.contains('-')) {
                            return -1;
                        } else {
                            if (a < b) return -1; if (a > b) return +1; return 0;
                        }
                    }
                }
            }, sortFns);

            // Array comparison. See http://stackoverflow.com/a/8618383
            var arrays_equal = function (a, b) { return !!a && !!b && !(a < b || b < a); };

            // Return the resulting indexes of a sort so we can apply
            // this result elsewhere. This returns an array of index numbers.
            // return[0] = x means "arr's 0th element is now at x"
            var sort_map = function (arr, sort_function, reverse_column) {
                var map = [];
                var index = 0;
                if (reverse_column) {
                    for (var i = arr.length - 1; i >= 0; i--) {
                        map.push(i);
                    }
                }
                else {
                    var sorted = arr.slice(0).sort(sort_function);
                    for (var i = 0; i < arr.length; i++) {
                        index = $.inArray(arr[i], sorted);

                        // If this index is already in the map, look for the next index.
                        // This handles the case of duplicate entries.
                        while ($.inArray(index, map) != -1) {
                            index++;
                        }
                        map.push(index);
                    }
                }
                return map;
            };

            // Apply a sort map to the array.
            var apply_sort_map = function (arr, map) {
                var clone = arr.slice(0),
                    newIndex = 0;
                for (var i = 0; i < map.length; i++) {
                    newIndex = map[i];
                    clone[newIndex] = arr[i];
                }
                return clone;
            };

            // ==================================================== //
            //                  Begin execution!                    //
            // ==================================================== //

            // Do sorting when THs are clicked
            $table.on("click", otherOpts.th, function () {
                //var trs = $table.children(otherOpts.tbody).children("tr");
                var trs = $(otherOpts.tbody).children("tr");
                var $this = $(this);
                var th_index = 0;
                var dir = $.fn.stupidtable.dir;

                $table.find(otherOpts.th).slice(0, $this.index()).each(function () {
                    var cols = $(this).attr('colspan') || 1;
                    th_index += parseInt(cols, 10);
                });

                // Determine (and/or reverse) sorting direction, default `asc`
                var sort_dir = $this.data("sort-dir") === dir.ASC ? dir.DESC : dir.ASC;

                // Choose appropriate sorting function. If we're sorting descending, check
                // for a `data-sort-desc` attribute.
                if (sort_dir == dir.DESC)
                    var type = $this.data("sort-desc") || $this.data("sort") || null;
                else
                    var type = $this.data("sort") || null;

                // Prevent sorting if no type defined
                if (type === null) {
                    return;
                }

                // Trigger `beforetablesort` event that calling scripts can hook into;
                // pass parameters for sorted column index and sorting direction
                $table.trigger("beforetablesort", { column: th_index, direction: sort_dir });
                // More reliable method of forcing a redraw
                $table.css("display");

                // Run sorting asynchronously on a timout to force browser redraw after
                // `beforetablesort` callback. Also avoids locking up the browser too much.
                setTimeout(function () {
                    // Gather the elements for this column
                    var column = [];
                    var sortMethod = sortFns[type];

                    // Push either the value of the `data-order-by` attribute if specified
                    // or just the text() value in this column to column[] for comparison.
                    trs.each(function (index, tr) {
                        var $e = $(tr).children().eq(th_index);
                        var sort_val = $e.data("sort-value");
                        var order_by = typeof (sort_val) !== "undefined" ? sort_val : $e.text();
                        column.push(order_by);
                    });

                    // Create the sort map. This column having a sort-dir implies it was
                    // the last column sorted. As long as no data-sort-desc is specified, 
                    // we're free to just reverse the column.
                    var reverse_column = !!$this.data("sort-dir") && !$this.data("sort-desc");
                    var theMap = sort_map(column, sortMethod, reverse_column);

                    // Reset siblings
                    $table.find(otherOpts.th).data("sort-dir", null).removeClass("sorting-desc sorting-asc");
                    $this.data("sort-dir", sort_dir).addClass("sorting-" + sort_dir);

                    // Replace the content of tbody with the sortedTRs. Strangely (and
                    // conveniently!) enough, .append accomplishes this for us.
                    var sortedTRs = $(apply_sort_map(trs, theMap));
                    //$table.children(otherOpts.tbody).append(sortedTRs);
                    $(otherOpts.tbody).append(sortedTRs);

                    // Trigger `aftertablesort` event. Similar to `beforetablesort`
                    $table.trigger("aftertablesort", { column: th_index, direction: sort_dir });
                    // More reliable method of forcing a redraw
                    $table.css("display");
                }, 10);
            });
        });
    };

    // Enum containing sorting directions
    $.fn.stupidtable.dir = { ASC: "asc", DESC: "desc" };

})(jQuery);
