(function() {

    Vue.component('modal', {
        template: "#modal-template",
        props: ['imageId'],
        watch: {
            imageId: function() {
                // console.log("watcher running: ", this.imageId);
                var self = this;
                axios.get("/image/" + this.imageId)
                    .then(function(resp) {
                        if (resp.data.rowCount > 0) {
                            self.image = resp.data.rows[0];
                            self.comments = resp.data.rows;
                        } else {
                            location.hash = "";
                            self.$emit("close-component");
                        }
                    })
                    .catch((err) => {
                        console.log("error while getting image: ", err);
                    });
            }
        },
        data: function() {
            return {
                image: {},
                comment: "",
                commentUser: "",
                comments: []
            };
        },
        mounted: function() {
            var self = this;
            axios.get("/image/" + this.imageId)
                .then(function(resp) {
                    if (resp.data.rowCount > 0) {
                        self.image = resp.data.rows[0];
                        self.comments = resp.data.rows;
                    } else {
                        location.hash = "";
                        self.$emit("close-component");
                    }
                })
                .catch((err) => {
                    console.log("error while getting image: ", err);
                });
        },
        methods: {
            closeComponent: function(e) {
                if (e.target.classList[0] == "modal-box" | e.target.classList[0] == "close") {
                    this.$emit("close-component");
                }
            },
            postComment: function(e) {
                e.preventDefault();
                var self = this;
                var formData = {
                    "comment": this.comment,
                    "commentUser": this.commentUser
                };
                axios.post("/image/" + this.imageId, formData)
                    .then(function(resp) {
                        self.comments.unshift(resp.data.results.rows[0]);
                    })
                    .catch((err) => {
                        console.log("error while posting comment: ", err);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            imageId: location.hash.slice(1) || 0,
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            },
            showMoreButton: false
        },
        mounted: function() {
            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });

            axios.get("/images")
                .then(function(resp) {
                    self.images = resp.data.rows;
                    if (resp.data.rows.length) {
                        self.showMoreButton = true;
                    }
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
                        console.log(resp.data);
                        self.images.unshift(resp.data.rows[0]);
                    })
                    .catch((err) => {
                        console.log("error while uploading image: ", err);
                    });
            },
            getMoreImages: function() {
                var lastId = this.images[this.images.length - 1].id;
                var self = this;
                axios.get("/get-more-images/" + lastId)
                    .then(function(resp) {
                        self.images.push.apply(self.images, resp.data);
                        var lastIdNew = self.images[self.images.length - 1].id;
                        if (lastIdNew == resp.data[0].last_id) {
                            self.showMoreButton = false;
                        }
                    });
            },
            closeModal: function() {
                this.imageId = 0;
            }
        }
    });
})();
