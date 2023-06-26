//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://oussamaaouad98:oussama123@cluster0.j7w7txl.mongodb.net/toDoListDB", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to Your toDoList" });
const item2 = new Item({ name: "Hit + to add a new button" });
const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema] 
});

const List = mongoose.model("List", listSchema);

const items = [];

app.get("/", function (req, res) {

  Item.find({})
    .then((arrayOfdocument) => {
      if (arrayOfdocument.length === 0) {
        console.log("array is null")
        Item.insertMany(defaultItems)
          .then((result) => {
            console.log("Documents inserted successfully:", result);
            res.redirect("/");
          })
          .catch((error) => {
            console.error("Error inserting documents:", error);
          });
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: arrayOfdocument });

      }
    })
    .catch((error) => {
      console.log("erreur");

    });

});





app.post("/", function (req, res) {

  const itemName = _.lowerCase(req.body.list);
  const itemContent = req.body.newItem;

  const item = new Item({ name: itemContent });

  if(itemName=== "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.updateOne(
      { name: itemName }, // Filter to find the document to update
      { $push: { items: item } } // Update to add the new item to the items array
    )
      .then(() => {
        console.log('Item added to the list successfully.');
      })
      .catch(error => {
        console.error('Error updating the list:', error);
      });
  
     res.redirect("/"+itemName);
  }




});


app.post("/delete", function (req, res) {

  const checkboxInput = req.body.checkboxInput;

  const values = checkboxInput.split('|');
  const itemId = values[0];
  console.log(itemId);
  const listName = _.lowerCase(values[1]);
  console.log(listName);

  if(listName === "Today")
  {
    Item.findByIdAndRemove({ _id: itemId })
      .then((result) => {
        console.log("Documents deleted");
        res.redirect("/");
      })
      .catch((error) => {
        console.error("Error deleting documents:", error);
      });

  }

  else {

    // update an array inside an object 

    List.findOneAndUpdate({ name: listName},{$pull: {items: { _id: itemId }}})
    .then((result) => {
      console.log("Documents deleted");
      res.redirect("/"+listName+"");
        })
    .catch((error) => {
      console.error("Error deleting documents:", error);
    });
   }
});
 

app.get("/:id", function (req, res) {

  const requiredName = _.lowerCase(req.params.id); 



  List.find({ name: requiredName })
    .then((result) => {

      if (result.length === 0) {
        const list = new List({ name: requiredName, items: defaultItems });
        list.save();
        res.redirect("/" + requiredName);
      }
      else {
        result.forEach((e) => res.render("list", { listTitle: _.upperFirst(e.name), newListItems: e.items })
        );
      }
    })
    .catch((error) => {
      console.error("Error ", error);
    });

})



app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT ; 
if(port == null || port == ""){
  port=3000;
}
app.listen(port, function () {
  console.log("Server is running");
});
