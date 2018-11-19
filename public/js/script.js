(function() {
    new Vue({
        el: "#main",
        data: {
            images: []
        },
        mounted: function() {
            var self = this;
            axios.get("/images")
                .then(function(resp) {
                    var imagesFromServer = resp.data.rows;
                    self.images = imagesFromServer;
                });
        }
    });
})();
