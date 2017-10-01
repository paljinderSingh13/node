// slide menu bar jquey
$(function(){
    // $('#switch').on('click', function(){
    //     $('.side-navbar').toggle('slide', { direction: 'left' }, 500);
    //     $('.content-middle').animate({
    //         'margin-left' : $('.content-middle').css('margin-left') == '0px' ? '280px' : '0px'
    //     }, 500);
    // });
              if (window.matchMedia('(min-width: 996px)').matches)
            {
                    $('#switch').on('click', function(){
                        $('.side-navbar').toggle('slide', { direction: 'left' }, 500);
                        $('.content-middle').animate({
                            'margin-left' : $('.content-middle').css('margin-left') == '0px' ? '280px' : '0px'
                        }, 500);
                    });
            }

          if (window.matchMedia('(max-width: 996px)').matches)
            {
                 $('#switch').on('click', function(){
                    $('.side-navbar').toggle('slide', { direction: 'left' }, 500);
                   $('.overlay').show();
                   $('.content-middle').css('margin-left',0);
                 });
                 $('.overlay').click(function()
                 {
                     $(this).hide();
                    $('.side-navbar').toggle('slide', { direction: 'left' }, 500);
                 });
            }
});


// submenu jquery
        $('.leftMenu a').click(function() {
            var $elem = $(this);
            $elem.parent('li').siblings('li').children('a').siblings('.sub-menu').slideUp();
            $elem.parent('li').siblings('li').removeClass('active-menu').find('i:last-child').removeClass('icon_keyboard_arrow_up').addClass('icon_keyboard_arrow_down');
            $elem.siblings('.sub-menu').slideToggle();
            if($elem.parent('li').hasClass('active-menu')){
                $elem.parent('li').removeClass('active-menu').find('i:last-child').removeClass('icon_keyboard_arrow_up').addClass('icon_keyboard_arrow_down');
            }
            else{

                $elem.parent('li').addClass('active-menu').find('i:last-child').removeClass('icon_keyboard_arrow_down').addClass('icon_keyboard_arrow_up');
            }
        });


// modalpopup jquery
        $(document).ready(function() { // the "href" attribute of .modal-trigger must specify the modal
        $('.modal-trigger').leanModal(); });

// logout-link jquery
    $('.logout-btn').click(function()
    {
        $('.logout-tooltip').toggle();
    });
    $('.logout-tooltip').click(function()
    {
      $(this).hide();
    });



    // slim scroll js
    var findHeight = $(window).height();
      totalHeight = findHeight - 74;

        $(function() {
            $('#section-right-container').slimScroll({
                height: totalHeight,
                width: '100%',
                color: '#44a6ea',
                alwaysVisible: true,
                size: '8px',
                allowPageScroll: true
            });
        });


// datepicker jquery
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15 // Creates a dropdown of 15 years to control year
  });
  
     // for dropdown jquery
      $(document).ready(function() {
        $('select').material_select();
      });

