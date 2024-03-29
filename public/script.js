(function() {
    Vue.component("modal", {
        template: "#modal-template",
        props: ["imageId"],
        watch: {
            imageId: function() {
                var self = this;
                axios
                    .get("/image/" + this.imageId)
                    .then(function(resp) {
                        if (resp.data.length || resp.data.image) {
                            var next_id = resp.data.image[0].next_id;
                            var prev_id = resp.data.image[0].prev_id;
                            next_id ? (self.next_id = next_id) : (self.next_id = 0);
                            prev_id ? (self.prev_id = prev_id) : (self.prev_id = 0);
                            self.image = resp.data.image[0];
                            self.comments = resp.data.comments;
                            self.tags = resp.data.tags;
                        } else {
                            location.hash = "";
                            self.$emit("close-component");
                        }
                    })
                    .catch(err => {
                        console.log("error while getting image: ", err);
                    });
            }
        },
        data: function() {
            return {
                image: {},
                comment: "",
                commentUser: "",
                comments: [],
                tags: [],
                errors: [],
                next_id: 0,
                prev_id: 0
            };
        },
        mounted: function() {
            var self = this;
            axios
                .get("/image/" + this.imageId)
                .then(function(resp) {
                    if (resp.data.length || resp.data.image) {
                        var next_id = resp.data.image[0].next_id;
                        var prev_id = resp.data.image[0].prev_id;
                        if (next_id) self.next_id = next_id;
                        if (prev_id) self.prev_id = prev_id;
                        self.image = resp.data.image[0];
                        self.comments = resp.data.comments;
                        self.tags = resp.data.tags;
                    } else {
                        location.hash = "";
                        self.$emit("close-component");
                    }
                })
                .catch(err => {
                    console.log("error while getting image: ", err);
                });
        },
        methods: {
            closeComponent: function(e) {
                if (e.target.classList[0] == "modal-box" || e.target.classList[0] == "close") {
                    location.hash = "";
                    this.$emit("close-component");
                }
            },
            postComment: function(e) {
                var self = this;
                e.preventDefault();

                this.errors = [];
                !this.comment && this.errors.push("comment ");
                !this.commentUser && this.errors.push("username ");

                if (!this.errors.length) {
                    var formData = {
                        comment: this.comment,
                        commentUser: this.commentUser
                    };

                    axios
                        .post("/image/" + this.imageId, formData)
                        .then(function(resp) {
                            self.comments.unshift(resp.data[0]);
                            self.comment = "";
                            self.commentUser = "";
                        })
                        .catch(err => {
                            console.log("error while posting comment: ", err);
                        });
                }
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
            showMoreButton: false,
            errors: [],
            uploadVisible: false
        },
        mounted: function() {
            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });

            axios
                .get("/images")
                .then(function(resp) {
                    self.images = resp.data;
                    if (resp.data.length) {
                        self.showMoreButton = true;
                    }
                })
                .catch(err => {
                    console.log("error while getting images: ", err);
                });
        },
        methods: {
            handleFileChange: function(e) {
                document.getElementById("uploadFile").value = e.target.value;
                this.form.file = e.target.files[0];
            },
            uploadFile: function(e) {
                var self = this;

                // disable form submit on button click
                e.preventDefault();

                // form validation
                this.errors = [];
                !this.form.title && this.errors.push("title ");
                !this.form.description && this.errors.push("description ");
                !this.form.username && this.errors.push("username ");
                !this.form.file && this.errors.push("file ");

                if (!this.errors.length) {
                    // get form data incl. file
                    var formData = new FormData();
                    formData.append("file", this.form.file);
                    formData.append("title", this.form.title);
                    formData.append("description", this.form.description);
                    formData.append("username", this.form.username);

                    // save to database
                    axios
                        .post("/upload", formData)
                        .then(function(resp) {
                            self.images.unshift(resp.data[0]);

                            // clear form fields
                            self.form.title = "";
                            self.form.description = "";
                            self.form.username = "";
                            document.getElementById("uploadFile").value = "";
                        })
                        .catch(err => {
                            console.log("error while uploading image: ", err);
                        });
                }
            },
            getMoreImages: function() {
                var lastId = this.images[this.images.length - 1].id;
                var self = this;
                axios.get("/get-more-images/" + lastId).then(function(resp) {
                    self.images.push.apply(self.images, resp.data);
                    var lastIdNew = self.images[self.images.length - 1].id;
                    if (lastIdNew == resp.data[0].last_id) {
                        self.showMoreButton = false;
                    }
                });
            },
            closeModal: function() {
                this.imageId = 0;
            },
            toggleUpload: function() {
                this.uploadVisible = this.uploadVisible ? false : true;
            }
        }
    });
})();
