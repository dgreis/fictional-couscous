/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

       var pipeline = [
        {"$group": {_id: "$category",
                    num: {"$sum" : 1}
                   } },
        {"$sort": {_id: 1} }
    ];
    this.db.collection("item").aggregate(pipeline).toArray(function(err, categories) {
        assert.equal(null, err);
    var total = 0;
        for (var i=0; i<categories.length; i++) {
            total += categories[i].num;
        }
    categories.unshift({_id: "All", num: total});
    callback(categories);
    });
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab1B
         *
         * LAB #1B: Implement the getItems() method.
         *
         * Create a query on the "item" collection to select only the items
         * that should be displayed for a particular page of a given category.
         * The category is passed as a parameter to getItems().
         *
         * Use sort(), skip(), and limit() and the method parameters: page and
         * itemsPerPage to identify the appropriate products to display on each
         * page. Pass these items to the callback function.
         *
         * Sort items in ascending order based on the _id field. You must use
         * this sort to answer the final project questions correctly.
         *
         * Note: Since "All" is not listed as the category for any items,
         * you will need to query the "item" collection differently for "All"
         * than you do for other categories.
         *
         *var pageItem = this.createDummyItem();
         *var pageItems = [];
         */
        var matchCriteria = {};
        var count = 0;
        if (category == "All") {
         matchCriteria = {};
        } else {
         matchCriteria = {category: category}
        } 
        var skip = page * itemsPerPage; 
        var pageItems = [];   
        //var size =  this.db.collection("item").find(matchCriteria).sort({"_id" : 1}).skip(skip).limit(itemsPerPage).size();
        this.db.collection("item").find(matchCriteria).sort({"_id" : 1}).skip(skip).limit(itemsPerPage).toArray(function(err, docs) { 
         assert.equal(err,null);
         assert.notEqual(docs.length,0);
         
         docs.forEach(function(doc) { 
         count = count + 1;
         pageItems.push(doc);
         });
         callback(pageItems);
        });   
      };
        
    
    this.getNumItems = function(category, callback) {
        "use strict";

        var matchCriteria = {};
        var count = 0;
        if (category == "All") {
         matchCriteria = {};
        } else {
         matchCriteria = {category: category}
        } 
        this.db.collection("item").find(matchCriteria).toArray(function(err, docs) { 
         assert.equal(err,null);
         assert.notEqual(docs.length,0);
         
         docs.forEach(function(doc) { 
         count = count + 1;
         });
         callback(count);
        });   
       
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab2A
         *
         * LAB #2A: Implement searchItems()
         *
         * Using the value of the query parameter passed to searchItems(),
         * perform a text search against the "item" collection.
         *
         * Sort the results in ascending order based on the _id field.
         *
         * Select only the items that should be displayed for a particular
         * page. For example, on the first page, only the first itemsPerPage
         * matching the query should be displayed.
         *
         * Use limit() and skip() and the method parameters: page and
         * itemsPerPage to select the appropriate matching products. Pass these
         * items to the callback function.
         *
         * searchItems() depends on a text index. Before implementing
         * this method, create a SINGLE text index on title, slogan, and
         * description. You should simply do this in the mongo shell.
         *
         */
         var skip = page * itemsPerPage; 
        var pageItems = [];   
        this.db.collection("item").find( {$text: { $search: query } }).sort({"_id" : 1}).skip(skip).limit(itemsPerPage).toArray(function(err, docs) { 
         assert.equal(err,null);
         
         docs.forEach(function(doc) { 
         pageItems.push(doc);
         });
         callback(pageItems);
        });  
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var count = 0;

        this.db.collection("item").find({ $text: { $search: query } }).toArray(function(err, docs) { 
         assert.equal(err,null);
         //assert.notEqual(docs.length,0);
         
         docs.forEach(function(doc) { 
         count = count + 1;
         });
         callback(count);
        });   
    }


    this.getItem = function(itemId, callback) {
        "use strict";

        this.db.collection("item").find({"_id": itemId}).toArray(function(err, doc) { 
         assert.equal(err,null);
         //assert.notEqual(docs.length,0); 
         console.log("The single item is " + JSON.stringify(doc));
         console.log("the title is " + doc[0].title);
         callback(doc[0]);
        });  
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }
        this.db.collection("item").update(
         { _id : itemId},
         { $push: {"reviews": {
                    "name": name,
                    "comment": comment,
                    "stars": stars,
                    "date": Date.now()
                  }}});
        callback(reviewDoc);
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
