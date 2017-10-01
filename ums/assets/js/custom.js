$(document).ready(function() {

        // For datatable action
          $('#example').DataTable( {
              dom: '<"table-wrapper"Bfrtip>',
              buttons: [
              'pdf', 'csv', 'print'
               ]
          } );

          var table = $('#example').DataTable();

          $("#filter").on('change', function() {
              //filter by selected value on second column
              table.column(3).search($(this).val()).draw();
          }); 

          // For tooltip action
         // $('a[data-toggle=tooltip]').tooltip() ;


          // For loading Content
        function hideLoading(){
          $('#loading').hide();
        }
        setTimeout(
            function(){
              hideLoading();
              $('.content-box').removeClass('pre-load');
          },1000
        );

      

      // select js
       $('.selectpicker').selectpicker();

       
       // for dropmenu
       $('ul.nav li.dropdown').hover(function() {
           $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(200);
        }, function() {
           $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(200);
        });


       // float action button script
        $('.floatingContainer').hover(function() {
        }, function() {
            $('.subActionButton').removeClass('display');
            $('.actionButton').removeClass('open');
        });

        $('.actionButton').hover(function() {
            $(this).addClass('open');
            $(this).find('.floatingText').addClass('show');
            $('.subActionButton').addClass('display');
        }, function() {
            $(this).find('.floatingText').removeClass('show');
        });

      } );