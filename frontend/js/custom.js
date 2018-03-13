function toggleTheme() {
  $('.toggle-theme').on('click', function(){
    var theme = $(this).data('target');
    if (theme == 'light'){
      if($('html').hasClass('dark')){
        $('html').removeClass('dark');
      }
    }else{
      if(!$('html').hasClass('dark')){
        $('html').addClass('dark');
      }
    }
  })
}
