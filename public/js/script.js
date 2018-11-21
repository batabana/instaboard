(function() {

    Vue.component('modal', {
        template: "#modal-template",
        props: ['imageId'],
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
                    self.image = resp.data.rows[0];
                    self.comments = resp.data.rows;
                })
                .catch((err) => {
                    console.log("error while getting image: ", err);
                });
        },
        methods: {
            closeComponent: function() {
                this.$emit("close-component");
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
            imageId: 0,
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
                    self.images = resp.data.rows;
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
            toggleModal: function(e) {
                this.imageId = e.target.id;
            },
            closeModal: function() {
                this.imageId = 0;
            }
        }
    });
})();
