$(window).load(function () {
    $('.backgroundImage').css('visibility', 'visible').hide().fadeIn('slow');
});

function scrollDown(target) {
	$('html, body').animate({
        scrollTop: $(target).offset().top - 100
    }, 500);
}

function queryParameters () {
    var result = {};
    var params = window.location.search.split(/\?|\&/);
    params.forEach( function(it) {
        if(it) {
        	var param = it.split("=");
            result[param[0]] = param[1];
        }
    });
    return result;
}

$(document).ready(function() {
    var randNumber = 1 + Math.floor(Math.random() * 15);
    $('.backgroundImage').css('background-image', 'url(/background/standart/'+randNumber+'.jpg)');
    var op = queryParameters().op;
    if(op == 'my_files') var aclass = 'dark '+op;
    $('body').addClass(aclass);
    //var max = $('.diskmax').html().split(' ')[0];
    //var used = $('.diskused').html().split(' ')[0];
    //var percent = Math.round(max/Math.round(used));
    //$('.bar-inner').css('width', percent+'%');
});