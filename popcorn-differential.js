(function( Popcorn ) {
    Popcorn.plugin( "zapper" , {
        _setup: function( track ) {
            // setup code, fire on initialization
            // |track| refers to the TrackEvent created by the options passed
            // into the plugin on init
            // this refers to the popcorn object
        },
        _update: function( track ) {
            // update code, fire on update/modification of a plugin created track event.
            // |track| refers to the TrackEvent created by the options passed
            // into the plugin on init
            // this refers to the popcorn object
        },
        _teardown: function( track ) {
            // teardown code, fire on removal of plugin or destruction of instance
            // |track| refers to the TrackEvent created by the options passed
            // into the plugin on init
            // this refers to the popcorn object
        },
        start: function( event, track ) {
            // fire on track.start
            // |event| refers to the event object
            // |track| refers to the TrackEvent created by the options passed
            // into the plugin on init
            // this refers to the popcorn object
            //this.media.src = mediaURL;
            this.destroy();
            //this.play();
        },
        end: function( event, track ) {
            // fire on track.end
            // |event| refers to the event object
            // |track| refers to the TrackEvent created by the options passed
            // into the plugin on init
            // this refers to the popcorn object
        },
        frame: function( event, track ) {
            // when frameAnimation is enabled, fire on every frame between start and end
            // |event| refers to the event object
            // |track| refers to the TrackEvent created by the options passed
            // into the plugin on init
            // this refers to the popcorn object
        },
        toString: function() {
            // provide a custom toString method for each plugin
            // defaults to return start, end, id, and target
            // this refers to the popcorn object
        }
    });
})(Popcorn);
