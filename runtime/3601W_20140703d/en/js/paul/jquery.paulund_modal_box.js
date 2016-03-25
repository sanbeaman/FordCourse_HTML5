/**
 * JQuery Plugin for a modal box
 * Will create a simple modal box with all HTML and styling
 *
 * Author: Paul Underwood
 * URL: http://www.paulund.co.uk
 *
 * Available for free download from http://www.paulund.co.uk
 */
(function($){
	// Defining our jQuery plugin
	$.fn.paulund_modal_box = function(prop){
		// Default parameters
		var options = $.extend({
			height : "250",
			width : "500",
			title:"JQuery Modal Box Demo",
			description: "Example of how to create a modal box.",
			top: "30%",
			left: "217px"
		},prop);
		//Click event on element
		return this.click(function(e){
			add_block_page();
			add_popup_box();
			add_styles();
			$(this).trigger("playaudio");
			$(this).addClass('addborder');
			$('.paulund_modal_box').fadeIn();
		});
		/**
		 * Add styles to the html markup
		 */
		function add_styles(){
			$('.paulund_modal_box').css({
				'position':'absolute',
				'left':options.left,
				'top':options.top,
				'display':'none',
				'height': (options.height +60) + 'px',
				'width': (options.width +60) + 'px',
				'border':'1px solid #f15d22',
				'box-shadow': '0px 2px 7px #292929',
				'-moz-box-shadow': '0px 2px 7px #292929',
				'-webkit-box-shadow': '0px 2px 7px #292929',
				'border-radius':'10px',
				'-moz-border-radius':'10px',
				'-webkit-border-radius':'10px',
				'background': '#666666',
				'z-index':'115'
			});
			$('.paulund_modal_close').css({
				'position':'relative',
				'top':'2px',
				'right':'2px',
				'float':'right',
				'display':'block',
				'height':'25px',
				'width':'25px',
				'background': 'url(images/shell/my_modal_close.png) no-repeat'
			});
			$('.paulund_block_page').css({
				'position':'absolute',
				'top':'0',
				'left':'0',
				//'background-color':'rgba(0,0,0,0.6)',
				'background-image':'url(js/paul/images/black6.png)',
				'height':'100%',
				'width':'100%',
				'z-index':'110'
			});
			$('.paulund_inner_modal_box').css({
				'background-color':'#ffffff',
				'height':(options.height) + 'px',
				'width':(options.width) + 'px',
				'padding':'10px',
				'margin':'15px',
				'border-radius':'10px',
				'-moz-border-radius':'10px',
				'-webkit-border-radius':'10px'
			});
		}
		/**
		 * Create the block page div
		 */
		function add_block_page(){
			var block_page = $('<div class="paulund_block_page"></div>');
			$(block_page).appendTo('#wrapper');
		}
		/**
		 * Creates the modal box
		 */
		function add_popup_box(){
			var pop_up = $('<div class="paulund_modal_box"><a href="#" class="paulund_modal_close"></a><div class="paulund_inner_modal_box"><h2>' + options.title + '</h2><p>' + options.description + '</p></div></div>');
			$(pop_up).appendTo('.paulund_block_page');

			$('.paulund_modal_close').click(function(){
				$(this).parent().fadeOut().remove();
				$('.paulund_block_page').fadeOut().remove();
			});
		}
		return this;
	};
})(jQuery);
