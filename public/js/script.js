(function() {
    new Vue({
        el: "#main",
        data: {
            images: [],
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            }
        },
        mounted: function() {
            var self = this;
            axios.get("/images")
                .then(function(resp) {
                    var imagesFromServer = resp.data.rows;
                    self.images = imagesFromServer;
                })
                .catch((err) => {
                    console.log("error while getting images: ", err);
                });
        },
        methods: {
            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },
            uploadFile: function(e) {
                e.preventDefault();
                var self = this;

                var formData = new FormData();
                formData.append("file", this.form.file);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);

                axios.post("/upload", formData)
                    .then(function(resp) {
                        self.images.unshift(resp.data.newImage);
                    })
                    .catch((err) => {
                        console.log("error while uploading image: ", err);
                    });
            }
        }
    });
})();
