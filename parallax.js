/**
* @title: Parallax PLugin
* @author: Mario Esquivel
* @created-date: 10-09-2013
* @email: marioe@thehangar.cr
*/


(function($,window,document,undefined){

    "use strict";

    var jParallax = {
        self : null,
        init:function(settings,elem){            
            this.$elem = $(elem); //jQuery Object

            this.refresh(settings);
        },

        /*
        * 
        * Initializes the plugin
        *
        * @Parameters: settings 
        *
        */
        refresh: function(settings){
            var self = this;

            self.parseSettings(settings);
 
            self.showLoading(true);

            self.removeData();          

            // Loop through all the parallax slides
            self.slides.each(function(index){

                var slide = $(this);
            
                /*All the slides have to start off the viewport, top:height of the window
                * to avoid interpolation
                */
                self.addData(slide, 0 ,"top:" + self.windowHeight + "px;")

                if(!slide.is(".large,.small")){

                    //All the slides have to be height equal to the viewport height
                    slide.height(self.windowHeight);
                }

                //Animations case based on the element classes
                if( slide.is(".wipe.scroll") || slide.is(".scroll")){
                    self.scroll(slide);
                }else if(slide.is(".wipe")){
                    self.wipe(slide);
                }

            });

            self.showLoading(false);

        },
        /*
        * 
        * Show/hide loading screen
        *
        * @Parameters: boolean 
        *
        */
        showLoading: function(show){

            if(show){
                this.loadingScreen.show();
            }else{
                this.loadingScreen.hide();
            }
        },

        /*
        * 
        * Set all the variables for later calculations
        *
        * @Parameters: settings 
        *
        */
        parseSettings: function(settings){
            
            //Overwrite default variables, with users config object
            this.settings = $.extend($.fn.jerryParallax.settings, settings);
            
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            this.pxStart = 0;

            this.loadingScreen = $(this.settings.loadingScreen);

            this.slides = this.$elem.find(".slide:not(.first)");
            this.allElemsWithData = this.$elem.find(".hasData");
                    
        },

        /*
        * 
        * Add the data-attribute to an element
        *
        * @Parameters: 
        *   elem: parallax element
        *   data: pixel where the element have to be animated
        *   conf: css properties
        *
        */
        addData: function(elem,data,conf){

            var elem = $(elem), 
                attr = elem.attr('data-'+data); //Get of the value if already have this attr

            /* For some browsers, `attr` is undefined; for others,
            *`attr` is false.  Check for both.
            *Check if the element already have this attr
            */
            if (typeof attr !== 'undefined' && attr !== false) {
                //If have the attr, just add the conf
                attr += conf;
            } else {
                attr = conf 
            }

            elem.attr("data-"+data , attr);

            /*class hasData its a flag, for the removeData function
            *All the elements with data-px have to have it.
            */
            if(!elem.hasClass("hasData")){
                elem.addClass("hasData");
            }
            
        },

        /*
        * 
        * Loop through all the element with the class hasData,
        * and remove all the data-attr, also remove all the inline styles
        *
        */
        removeData: function(){

               var a, obj;

                this.allElemsWithData.each(function (){

                    obj = $(this);
                    //Remove all inline styles
                    obj.removeAttr('style');

                    //Remove all data-attr
                    a = [].filter.call(obj[0].attributes, function (at)
                    {
                        return /^data-/.test(at.name);
                    });
                    _.each(a, function (b, i)
                    {
                        if (obj.attr(b.name))
                        {
                            obj.removeAttr(b.name);
                        }
                    });
                })
        },

        /*
        * Wipe: animation scenario, when the slide comes out of the viewport,
        * and is fixed to top:0px
        */

        wipe: function(elem){

             
            /*If isnt the first slide, add time to the animation*/ 
            if(this.pxStart > 0 ){
                this.pxStart = this.pxStart + this.settings.time;
            }

            /*Start always out off the viewport*/
            this.addData(elem, this.pxStart ,"top:" + this.windowHeight + "px;");

            /*If the elem is larger than viewport*/
            if(elem.is(".large")){

                /*
                * The element have to be fixed, when the bottom of the image reach the bottom
                * of the viewport, so the image have to scroll the viewport height plus 
                * the image remain out of the viewport
                */
                var slideHeight = elem.find(".large-img").height(),
                    remain = this.windowHeight - slideHeight,
                    n = this.pxStart + ( slideHeight * this.settings.scrollRatio ); 
    
                this.addData(elem, n ,"top:-" + remain + "px;");
                
                this.pxStart = n;

            }else{
                /*
                * If the slide its the same height of the viewport, the animation ends
                * star plus viewport height, top:0px, cause have to be wipe it
                */

                this.pxStart += (this.windowHeight * this.settings.scrollRatio);
                this.addData(elem, this.pxStart ,"top:0px;");       
            }
            

            /*
            *Case if the element have inner scrolling or second animations
            */
            if(elem.is(".inner-scroll")) {
                this.innerScroll(elem);
            } else if(elem.is(".second-anim")) {
                this.sAnim(elem);
            }

        },      

        /*
        * Scroll: animation scenario, when the slide comes out of the viewport,
        * and ends out of the viewport
        * @Paremeter: element
        */
        scroll: function(elem){
        
            var n = this.pxStart + this.settings.time;
                
            /*Start always out off the viewport*/
            this.addData(elem, n ,"top:" + this.windowHeight + "px;")

            /*
            * In some scenarios the slide is just a scrolling image, bigger or smaller
            * tha viewport
            */
            if ( elem.is(".image") ){
                var img =elem.find(".scroll-img"),
                    imgHeight = elem.find(".scroll-img").height();

                    elem.height(imgHeight);

                    n += (this.windowHeight  + imgHeight )  * this.settings.scrollRatio;    
                    this.addData(elem, n ,"top:-" + imgHeight + "px;");

                    /*For this scenario the next slide dosent have time*/
                    this.pxStart += (imgHeight  * this.settings.scrollRatio) - this.settings.time; 

            } else {

                 /*
                 *If the slide have inner scrolling, first have to be fixed to top:0px,
                 * do the inner scrolling, and then get out the viewport
                 */   
                if( elem.is(".inner-scroll") ) {
                    
                    //Set the element to top:0
                    this.pxStart = n + (this.windowHeight * this.settings.scrollRatio);
                    this.addData(elem, this.pxStart ,"top:0px;");
                    
                    //Call the inner scroll function
                    this.innerScroll(elem);
                    
                    /*
                    * At the end of the inner scroll animation,set the element to top:0 again to avoid
                    * interpolation
                    */
                    this.addData(elem, this.pxStart ,"top:0px;");
                    
                    /*
                    * Set the data-attr animation, to move out the slide
                    */
                    n = this.pxStart + (this.windowHeight * this.settings.scrollRatio);
                    this.addData(elem, n ,"top:-" + this.windowHeight + "px;");

                    //For scrolling animation doesnt add time
                    this.pxStart -= this.settings.time;

                } else{

                    n +=  (2 * (this.windowHeight * this.settings.scrollRatio));
                    this.addData(elem, n ,"top:-" + this.windowHeight + "px;");

                    if(elem.is(".small.bg-fixed")){
                        this.pxStart = this.pxStart + (elem.height() * this.settings.scrollRatio);      
                    }
                    else {
                        this.pxStart = this.pxStart + (this.windowHeight * this.settings.scrollRatio);
                    }

                }
            }

        },
        
        /*
        * innerScroll: animation scenario, when the slide's content scrolls up,
        * @Paremeter: element
        */
        innerScroll: function(elem){


            /*
            *The inner scroll content, have to scroll up the remain out of his container
            */

            var wrapper = elem.find(".inner-scroll"),
                content = wrapper.find(".content"),
                mt = wrapper.height() - content.height(),
                startTemp = this.pxStart + this.settings.time,
                endTemp = 0;

            this.addData(content, startTemp ,"margin-top:0px;");

            endTemp = startTemp + (( 2 * Math.abs(mt) * this.settings.scrollRatio));

            this.addData(content, endTemp, "margin-top:" + mt + "px;");

            if(elem.is(".second-anim")){
                this.sAnim(elem,startTemp,endTemp);
            }
            
            this.pxStart = endTemp


        },

        /*
        * second animation: animation scenario, besides the inner scroll, the slide have another animation
        * @Paremeter: element
        *             startTemp: when the iner scroll Starts
        *             endTemp: when the iner scroll Ends
        */

        sAnim: function(elem,startTemp,endTemp){

            if(elem.is(".bg-change")){
                this.bgChange(elem);
            }else if(elem.is(".move")){
                this.move(elem,startTemp,endTemp);
            }else if(elem.is(".bg-move")){
                this.bgMove(elem,startTemp,endTemp);                
            }

        },

        /*
        * Background Change: animation scenario
        * @Paremeter: element
        *             
        */

        bgChange: function(elem){

            var changinImg = elem.find(".changing-img");
            this.addData(changinImg, (this.pxStart + this.settings.time),"opacity:0;");
            //Ends at the time defined by the user
            this.pxStart += (this.settings.backgroundChangeTime * this.settings.scrollRatio);
            this.addData(changinImg, this.pxStart, "opacity:1;");

        },

        /*
        * Move: animation scenario, move elements while inner scrolling
        * @Paremeter: element
        *             startTemp: when the iner scroll Starts
        *             endTemp: when the iner scroll Ends
        *             
        */

        move: function(elem,startTemp,endTemp){

            var moveIt = elem.find(".move-it");

            this.addData(moveIt, startTemp ,"margin-top:0px;");
            this.addData(moveIt, endTemp ,"margin-top:-128px;"); //definir cuanto

        },

        /*
        * Background Position Move: animation scenario, move background position while inner scrolling
        * @Paremeter: element
        *             startTemp: when the iner scroll Starts
        *             endTemp: when the iner scroll Ends
        *             
        */

        bgMove: function(elem,startTemp,endTemp){

            this.addData(elem, startTemp ,"background-position: 0px 0px;");
            this.addData(elem, endTemp ,"background-position: 0px -100px;");

        }

    }

    $.fn.jerryParallax = function(settings){


        jParallax.init(settings,this);

        var s = skrollr.init(jParallax.settings.skrollrConfig); //instance of skrollr


        $(window).on("resize", _.debounce(function ()
        {
            s.destroy(); //Destroy the instance of skrollr
            jParallax.refresh(settings,this); //re-init the parallax
            s = skrollr.init(jParallax.settings.skrollrConfig).refresh(); //init skrollr again with the new data

        }, 10));

    };


    //Global settings
    $.fn.jerryParallax.settings ={
        loadingScreen: "#loading",  
        time : 100, //extra pixel between animations
        backgroundChangeTime:450, // time-pixels for bg change
        slides:null,
        scrollRatio:2,
        skrollrConfig: null 
    };

})(jQuery,window,document);