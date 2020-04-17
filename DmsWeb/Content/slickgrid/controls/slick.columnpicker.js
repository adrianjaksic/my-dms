(function ($) {
  function SlickColumnPicker(columns, grid, options) {
    var $menu;
    var columnCheckboxes;

    var defaults = {
      fadeSpeed:250
    };

    function init() {
      grid.onHeaderContextMenu.subscribe(handleHeaderContextMenu);
      grid.onColumnsReordered.subscribe(updateColumnOrder);
      options = $.extend({}, defaults, options);

      $menu = $("<span class='slick-columnpicker' style='display:none;position:absolute;z-index:20;' />").appendTo(document.body);

      var zind = 502;

      $menu = $("<span class='slick-columnpicker' style='display:none;position:absolute;z-index:" + zind + "; background-color: #f2f2f2; border-radius: 5px; padding: 10px; border: 1px solid black;' />").appendTo(document.body);

      $(window).on('click.columnpicker', function (e) {
          var $this = $(e.target);
          if ($this.parents('.slick-columnpicker').length == 0 && !$this.hasClass('slick-columnpicker')) {
              $menu.fadeOut(options.fadeSpeed);
          }
      });

      $menu.bind("click", updateColumn);

      $menu.bind('click', '.forcefitCB', function () {
          grid.onColumnsResized.notify({});
      });

    }

    function destroy() {
      grid.onHeaderContextMenu.unsubscribe(handleHeaderContextMenu);
      grid.onColumnsReordered.unsubscribe(updateColumnOrder);
      $menu.remove();
    }

    function handleHeaderContextMenu(e, args) {
      e.preventDefault();
      $menu.empty();
      updateColumnOrder();
      columnCheckboxes = [];

      var $li, $input, $a;



      $li = $("<li style='list-style: none; margin-bottom: 5px;' />").appendTo($menu);
      $a = $("<a href='#'>" + qKonverzija.VratiLokalizovaniTekst("Izvoz u excel") + "</a>").data("option", "exportxls");
      $a.appendTo($li);

      for (var i = 0; i < columns.length; i++) {
          $li = $("<li style='list-style: none;' />").appendTo($menu);
          $input = $("<input type='checkbox' />").data("column-id", columns[i].id);
          columnCheckboxes.push($input);

          if (grid.getColumnIndex(columns[i].id) != null) {
              $input.attr("checked", "checked");
          }

          $("<label />")
              .text(columns[i].customPolje ? '' : columns[i].name)
              .prepend($input)
              .appendTo($li);

          if (columns[i].customPolje) {
              $input.prop('disabled', true);
          }
      }

      $("<hr/>").appendTo($menu);
      $li = $("<li style='list-style: none;' />").appendTo($menu);
      $input = $("<input type='checkbox' />").data("option", "autoresize");
      $("<label />")
          .text(qKonverzija.VratiLokalizovaniTekst("Prilagodi kolone širini tabele"))
          .prepend($input)
          .appendTo($li);
      if (grid.getOptions().forceFitColumns) {
        $input.attr("checked", "checked");
      }


      //$li = $("<li />").appendTo($menu);
      //$input = $("<input type='checkbox' />").data("option", "syncresize");
      //$("<label />")
      //    .text("Synchronous resize")
      //    .prepend($input)
      //    .appendTo($li);
      //if (grid.getOptions().syncColumnCellResize) {
      //  $input.attr("checked", "checked");
      //}

      $menu
          .css("top", e.pageY - 10)
          .css("left", e.pageX - 10)
          .fadeIn(options.fadeSpeed);
    }

    function updateColumnOrder() {
      // Because columns can be reordered, we have to update the `columns`
      // to reflect the new order, however we can't just take `grid.getColumns()`,
      // as it does not include columns currently hidden by the picker.
      // We create a new `columns` structure by leaving currently-hidden
      // columns in their original ordinal position and interleaving the results
      // of the current column sort.
      var current = grid.getColumns().slice(0);
      var ordered = new Array(columns.length);
      for (var i = 0; i < ordered.length; i++) {
        if ( grid.getColumnIndex(columns[i].id) === undefined ) {
          // If the column doesn't return a value from getColumnIndex,
          // it is hidden. Leave it in this position.
          ordered[i] = columns[i];
        } else {
          // Otherwise, grab the next visible column.
          ordered[i] = current.shift();
        }
      }
      columns = ordered;
    }

    function updateColumn(e) {
        var dataView = grid.getData();
      if ($(e.target).data("option") == "autoresize") {
        if (e.target.checked) {
          grid.setOptions({forceFitColumns:true});
          grid.autosizeColumns();
        } else {
          grid.setOptions({forceFitColumns:false});
        }
        return;
      }

      if ($(e.target).data("option") == "exportxls") {
          e.preventDefault();

          var columnsZaXls = [];
          var cols = grid.getColumns();

          var totaliZaXls = [];

          var formatteriZaXls = [];

          for (var k = 0; k < cols.length; ++k) {
              var col = $.extend({}, cols[k]);

              var $total = grid.getFooterRow().find('.qTabelaHeadTd:eq(' + k + ')');
              var total = undefined;
              if ($total.find('span').length > 0) {
                  total = $total.find('span').text().trimnull();
              } else {
                  total = $total.text().trimnull();
              }

              var vrednost = total != undefined ? total.fromMoney() : undefined;

              if (col.tipPodatka != "skip" && col.customPolje != true) {
                  totaliZaXls.push(vrednost);

                  columnsZaXls.push(col);
              }

              if (col.formatterZaExcel) formatteriZaXls.push({ col: col });
          }

          var items = [];
          for (var j = 0; j < dataView.getLength() ; ++j) {
              var item = $.extend({}, dataView.getItem(j));

              formatteriZaXls.forEach(function (f) {
                  item[f.col.field] = f.col.formatter(j, null, item[f.col.field], col, item);
              });

              items.push(item);
          }

          if (grid.getOptions().bezTotala === true) {
              qUtils.ExportToXlsNovaTabela(columnsZaXls, items);
          } else {
              qUtils.ExportToXlsNovaTabela(columnsZaXls, items, totaliZaXls);
          }

          $menu.fadeOut(options.fadeSpeed);
          return;
      }

      if ($(e.target).is(":checkbox")) {
        var visibleColumns = [];
        $.each(columnCheckboxes, function (i, e) {
          if ($(this).is(":checked")) {
            visibleColumns.push(columns[i]);
          }
        });

        if (!visibleColumns.length) {
          $(e.target).attr("checked", "checked");
          return;
        }

        grid.setColumns(visibleColumns);
      }
    }

    function getAllColumns() {
      return columns;
    }

    init();

    return {
      "getAllColumns": getAllColumns,
      "destroy": destroy
    };
  }

  // Slick.Controls.ColumnPicker
  $.extend(true, window, { Slick:{ Controls:{ ColumnPicker:SlickColumnPicker }}});
})(jQuery);
