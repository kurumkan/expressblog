var bodyParser = require("body-parser");
var  methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var mongoose = require("mongoose");
var express = require("express");
var app = express();

mongoose.connect(process.env.MONGOLAB_URI);

//app config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
//must be after parser
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//schema config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	//it should be date. With default value now.
	created: {
		type: Date, default: Date.now
	}
});

var Blog = mongoose.model("Blog", blogSchema);

//in here we added db entry
// Blog.create({
// 	title: "test blog",
// 	image: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSnfpzoD-_HTIGH37ncMqaYiqjOI4MrXSPSTCyAHbJdSsc6O9vP",
// 	body: "Blog post content goes here. "
// });


app.get("/", function(request, response){
	response.redirect("/blogs");
});


app.get("/blogs", function(request, response){
	//retreive all the blogposts from the db		
	Blog.find({},function(error, blogs){
		if(error){
			console.log(error);
		}else{
			response.render("index", {blogs: blogs});
		}
	});	
});

app.get("/blogs/new", function(request, response){
	//show form
	response.render("new");	
});

app.post("/blogs", function(request, response){
	request.body.blog.body = request.sanitize(request.body.blog.body);
	//create new blogpost
	Blog.create(request.body.blog, function(error, newBlog){
		if(error)
			response.render("new");
		else{
			response.redirect("/blogs");		
		}
	});			
});

app.get("/blogs/:id", function(request, response){
	var id = request.params.id;
	Blog.findById(id, function(error, blog){
		if(error){
			response.redirect("/blogs");
		}else{
			response.render("show", {blog: blog});
		}
	});
});

//edit route
app.get("/blogs/:id/edit", function(request, response){
	var id = request.params.id;
	Blog.findById(id, function(error, blog){
		if(error){
			response.redirect("/blogs");
		}else{			
			response.render("edit", {blog: blog});
		}
	});
});

//update
app.put("/blogs/:id", function(request, response){
	var id = request.params.id;	
	var data = request.body.blog;
	data.body = request.sanitize(data.body);
	
	Blog.findByIdAndUpdate(id, data, function(error, blog){
		if(error){
			response.redirect("/blogs");
		}else{
			response.redirect("/blogs/"+id);
		}
	});
});

//delete
app.delete("/blogs/:id", function(request, response){
	var id = request.params.id;

	Blog.findByIdAndRemove(id, function(error){
		if(error){
			response.redirect("/blogs");
		}else{
			response.redirect("/blogs");
		}
	});
});




//if Process env port is not defined - set 5000 as a port
app.set("port", process.env.PORT||5000);

app.listen(app.get("port"), function(){
	console.log("Server started");
})