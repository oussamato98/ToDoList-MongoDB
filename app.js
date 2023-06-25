//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/toDoListDB", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to Your toDoList" });
const item2 = new Item({ name: "Hit + to add a new button" });
const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];



// to handle the resolved promise use then
// Item.insertMany(defaultItems)
// .then((result) => {
//   console.log("Documents inserted successfully:", result);
// })
// .catch((error) => {
//   console.error("Error inserting documents:", error);
// });

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

  const itemName = req.body.newItem;
  console.log(itemName);
  const item = new Item({ name: itemName });
  item.save();
  res.redirect("/");


});

app.post("/delete",function(req,res){
  const inputCheck = req.body.checkboxInput;
  console.log(inputCheck);

  Item.deleteOne({_id:inputCheck })
.then((result) => {
  console.log("Documents deleted");
  res.redirect("/");
})
.catch((error) => {
  console.error("Error deleting documents:", error);
});




  
});


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
