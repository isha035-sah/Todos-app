//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//importing mongooose databse into the project
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin-isha:EbG6d0PFazlNuCDn@cluster0.ycfrtow.mongodb.net/todolistDB", {useNewUrlParser: true});

// mongodb+srv://admin-isha:<password>@cluster0.ycfrtow.mongodb.net/?retryWrites=true&w=majority

//creating  a schema
const itemsSchema = {
  name: String
};

//creating schema for the custom newListItems
const listSchema={
  name:String,
  items:[itemsSchema]
};
//creating a model
const Item = mongoose.model("Item",itemsSchema);

//creating a model of custom Schema
const List= mongoose.model("List", listSchema);

//creating a mongoose document oe we can say items
const item1 = new Item({
  name:"Welcome to your todo list"

});

const item2= new Item({
  name: "Hit the + button to add Item"
});
const item3 = new Item({
  name:"Hit the del button to delete the item"
});

//creating an array of items
const defaultItems= [item1, item2, item3];



//mongoose.find() to fetch all the datas

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    // if(err) console.log(err);
    // else console.log(res);

    if(foundItems.length == 0){
      //if the array is empty  inserting tha array into the collection
      Item.insertMany(defaultItems , function(err,res){
        if(err) console.log(err);
        else console.log(res);
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;
// listName/replace(/\w/, c=> c.toUpperCase());
console.log(itemName);

const item = new Item({
  name: itemName
});

if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

});

app.post("/delete" , function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;

  if(listName ==="Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(err) console.log(err);
      else console.log("successfully deleted");
      res.redirect("/");
    });
  }else {
    List.findOneAndUpdate({name : listName},{$pull: {items: {_id : checkedItemId} } }, function(err,foundList){
      if(err) console.log(err);
      else{
        res.redirect("/"+ listName);
      }
    })
  }



});

//custom List
app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,result){
    if(err) console.log(err);
    else{
     if(result){
       //show existing list
      res.render("list", {listTitle:result.name , newListItems : result.items})
    }else {
      //creating list
      const list = new List({
        name: customListName,
        items : defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      // console.log("Doesnot exists");
    }
  }
    // else console.log(result);
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port ==""){
  port = 3300;
}

app.listen(port, function() {
  console.log("Server started on port 3300");
});
